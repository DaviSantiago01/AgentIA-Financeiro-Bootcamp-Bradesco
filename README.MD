# Finch — Agente Educacional de Investimentos

Finch é um agente de IA para educação financeira voltado a investidores iniciantes. Ele explica conceitos de investimentos, risco, retorno, liquidez e diversificação em uma linguagem simples, objetiva e acessível.

> **Aviso:** Finch possui finalidade educacional. Ele não recomenda compra ou venda de investimentos, não promete rentabilidade e não substitui um profissional certificado.

## Status

🚧 MVP em desenvolvimento.

## O que já funciona

- Interface de chat em Next.js;
- Comunicação entre frontend e FastAPI;
- Respostas geradas localmente pelo Ollama;
- Envio integral da base educacional Markdown ao modelo local;
- Orientações de segurança e limites educacionais definidos no prompt do agente.

## Arquitetura

```text
Usuário → Next.js → FastAPI → Finch Agent → Ollama Service → Ollama/qwen3.5:2b
```

O backend separa a orquestração da integração externa:

- `app/agent/finch_agent.py` define o comportamento educacional, carrega integralmente `data/financas-basicas.md` e monta o contexto;
- `app/services/ollama_service.py` é responsável apenas pela comunicação HTTP com o Ollama;
- `app/routes/chat.py` recebe a mensagem e converte falhas do serviço em respostas HTTP apropriadas.

## Tecnologias atuais

- Next.js 16 e TypeScript;
- Python e FastAPI;
- HTTPX;
- Ollama com `qwen3.5:2b`.

A base Markdown completa é enviada ao modelo em cada pergunta e permanece em cache durante a execução. Perfil dinâmico, histórico de conversa, PostgreSQL e busca vetorial são evoluções posteriores.

O [diagrama de evolução](docs/arquitetura.png) inclui componentes planejados que ainda não fazem parte do MVP funcional.

## Documentação

A especificação do MVP, o fluxo, a arquitetura, a segurança e as limitações estão em:

- [Documentação do agente](docs/01-documentacao-agent.md)
- [Casos de teste do agente](docs/testes-agent.md)

## Como executar

### Primeira execução

Pré-requisitos: Node.js 20.9 ou superior, Python 3.11 ou superior e Ollama.

```powershell
cd apps/web
npm install

cd ../api
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

cd ../..
```

Baixe o modelo local uma única vez:

```powershell
ollama run qwen3.5:2b
```

Após testar o chat no terminal, use `/bye`. No Windows, o Ollama permanece disponível em segundo plano na porta `11434`.

Crie as configurações locais obrigatórias:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
```

O backend lê o modelo, a URL do Ollama e o timeout de `apps/api/.env`. O frontend lê a URL do FastAPI de `apps/web/.env.local`.

### Desenvolvimento

Inicie frontend e backend juntos a partir da raiz:

```powershell
npm run dev
```

Antes de iniciar o FastAPI, esse comando verifica se o Ollama responde na URL definida em `apps/api/.env`. Caso esteja desligado, ele executa `ollama serve` automaticamente. Se o Ollama já estiver ativo, nenhum processo adicional é criado. O script não baixa modelos: `qwen3.5:2b` precisa ter sido baixado previamente.

Endereços locais:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- Documentação da API: `http://127.0.0.1:8000/docs`

Para iniciar apenas uma parte:

```powershell
npm run dev:web
npm run dev:api
```

## Solução de problemas

- **Ollama indisponível (`503`):** confirme se `ollama serve` está ativo e consulte `http://127.0.0.1:11434/api/tags`.
- **Modelo ausente:** execute `ollama pull qwen3.5:2b` e tente novamente.
- **Tempo limite (`504`):** aguarde o carregamento inicial do modelo e confira `OLLAMA_TIMEOUT_SECONDS` em `apps/api/.env`.
- **Resposta lenta:** o modelo processa a base completa em cada pergunta; nos testes locais, respostas levaram aproximadamente 50 a 172 segundos. O exemplo do backend reserva 240 segundos antes de retornar `504`.
- **Resposta inválida (`502`):** consulte os logs do FastAPI; eles registram o motivo de término e o tamanho da resposta sem expor o raciocínio interno do modelo.
- **Backend:** confirme o funcionamento em `http://127.0.0.1:8000/health`.
