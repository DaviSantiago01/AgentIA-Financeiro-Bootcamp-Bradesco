import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const rootDirectory = process.cwd();
const webDirectory = path.join(rootDirectory, "apps", "web");
const apiDirectory = path.join(rootDirectory, "apps", "api");
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

function startProcess(name, command, args, cwd, useShell = false) {
  const child = spawn(command, args, { cwd, stdio: "inherit", shell: useShell });
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
}

function stop(exitCode) {
  if (isStopping) return;

  isStopping = true;
  process.exitCode = exitCode;

  for (const child of processes) {
    if (!child.killed) child.kill("SIGTERM");
  }
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

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
