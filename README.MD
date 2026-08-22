# Finch — Agente Educacional de Investimentos

Finch é um agente de IA para educação financeira voltado a investidores iniciantes. Ele explica conceitos de investimentos, risco, retorno, liquidez e diversificação em uma linguagem simples, objetiva e acessível.

> **Aviso:** Finch possui finalidade educacional. Ele não recomenda compra ou venda de investimentos, não promete rentabilidade e não substitui um profissional certificado.

## Status

🚧 Em planejamento e desenvolvimento do MVP.

## O que o MVP faz

- Criação de perfil educacional do usuário;
- Chat para dúvidas sobre finanças pessoais e investimentos;
- Explicações contextualizadas sobre risco, retorno, liquidez e diversificação;
- Histórico básico de conversas.

## Arquitetura

![Diagrama da arquitetura inicial do Finch](docs/arquitetura.png)

```text
Next.js → FastAPI → Agente Finch → Modelo OpenAI
                    ↓
                PostgreSQL
```

## Tecnologias previstas

- Next.js e TypeScript;
- Python e FastAPI;
- LangChain;
- OpenAI API;
- PostgreSQL.

## Documentação

A especificação do MVP, o fluxo, a arquitetura, a segurança e as limitações estão em:

- [Documentação do agente](docs/01-documentacao-agent.md)

## Como executar

### Primeira execução

Pré-requisitos: Node.js e Python 3.11 ou superior.

```powershell
cd apps/web
npm install

cd ../api
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt

cd ../..
```

### Desenvolvimento

Inicie frontend e backend juntos a partir da raiz:

```powershell
npm run dev
```

Endereços locais:

- Frontend: `http://localhost:3000`
- Backend: `http://127.0.0.1:8000`
- Documentação da API: `http://127.0.0.1:8000/docs`

Para iniciar apenas uma parte:

```powershell
npm run dev:web
npm run dev:api
```
