import { existsSync, readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const rootDirectory = process.cwd();
const webDirectory = path.join(rootDirectory, "apps", "web");
const apiDirectory = path.join(rootDirectory, "apps", "api");
const apiEnvironmentFile = path.join(apiDirectory, ".env");
const runOnly = new Set(process.argv.slice(2));
const runWeb = runOnly.size === 0 || runOnly.has("--web");
const runApi = runOnly.size === 0 || runOnly.has("--api");

const nextCli = path.join(webDirectory, "node_modules", "next", "dist", "bin", "next");
const pythonExecutable = process.platform === "win32"
  ? path.join(apiDirectory, ".venv", "Scripts", "python.exe")
  : path.join(apiDirectory, ".venv", "bin", "python");

if (runApi && !existsSync(pythonExecutable)) {
  console.error("Ambiente Python não encontrado em apps/api/.venv.");
  console.error("Crie-o com: py -3.11 -m venv apps/api/.venv");
  process.exit(1);
}

const processes = [];
let isStopping = false;

function startProcess(name, command, args, cwd, environment = process.env) {
  const child = spawn(command, args, { cwd, stdio: "inherit", env: environment });
  processes.push(child);

  child.on("error", (error) => {
    console.error(`Não foi possível iniciar ${name}: ${error.message}`);
    stop(1);
  });

  child.on("exit", (code) => {
    if (!isStopping) {
      stop(code ?? 1);
    }
  });

  return child;
}

function stop(exitCode) {
  if (isStopping) return;

  isStopping = true;
  process.exitCode = exitCode;

  for (const child of processes) {
    if (child.killed || !child.pid) continue;

    if (process.platform === "win32") {
      spawnSync(
        "taskkill",
        ["/PID", String(child.pid), "/T", "/F"],
        { stdio: "ignore" },
      );
    } else {
      child.kill("SIGTERM");
    }
  }
}

function getRequiredEnvironmentValue(filePath, name) {
  if (!existsSync(filePath)) {
    throw new Error(`Arquivo de ambiente não encontrado: ${filePath}`);
  }

  const pattern = new RegExp(`^${name}=(.+)$`, "m");
  const value = readFileSync(filePath, "utf8").match(pattern)?.[1]?.trim();

  if (!value) {
    throw new Error(`A variável obrigatória ${name} não foi configurada em ${filePath}.`);
  }

  return value;
}

async function isOllamaAvailable(ollamaBaseUrl) {
  try {
    const response = await fetch(`${ollamaBaseUrl}/api/tags`, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function ensureOllamaIsRunning() {
  const ollamaBaseUrl = getRequiredEnvironmentValue(apiEnvironmentFile, "OLLAMA_BASE_URL").replace(/\/$/, "");

  if (await isOllamaAvailable(ollamaBaseUrl)) {
    console.log("Ollama já está disponível.");
    return;
  }

  const ollamaHost = new URL(ollamaBaseUrl).host;
  console.log("Ollama não está ativo. Iniciando o servidor local...");
  startProcess(
    "ollama",
    "ollama",
    ["serve"],
    rootDirectory,
    { ...process.env, OLLAMA_HOST: ollamaHost },
  );

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (await isOllamaAvailable(ollamaBaseUrl)) {
      console.log("Ollama iniciado com sucesso.");
      return;
    }
  }

  throw new Error("O Ollama não ficou disponível após a tentativa de inicialização.");
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

if (runApi) {
  await ensureOllamaIsRunning();
}

if (runWeb) {
  startProcess(
    "frontend",
    process.execPath,
    [nextCli, "dev", "-p", "3000"],
    webDirectory,
  );
}

if (runApi) {
  startProcess(
    "backend",
    pythonExecutable,
    ["-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
    apiDirectory,
  );
}
