# Base de Conhecimento do Finch

## Objetivo

A pasta `data` reúne a base educacional usada pelo agente e dados fictícios preparados para evoluções futuras. Nenhum arquivo contém dados reais de usuários.

## Arquivos atuais

| Arquivo | Tipo | Uso atual |
| --- | --- | --- |
| `data/financas-basicas.md` | Base educacional | Enviado integralmente ao modelo em todas as perguntas. |
| `data/perfil_investidor.json` | Perfil fictício | Exemplo de estrutura; não é carregado pelo agente. |
| `data/transacoes_exemplo.csv` | Transações fictícias | Exemplo para testes futuros; não é carregado pelo agente. |

## Funcionamento atual

O Finch lê `financas-basicas.md` na primeira pergunta e mantém seu conteúdo em cache durante a execução do backend.

```text
financas-basicas.md → Finch Agent → Ollama Service → qwen3.5:2b
```

A base aborda planejamento financeiro, risco, retorno, liquidez, diversificação, renda fixa, títulos públicos e renda variável. Ela não contém cotações, taxas ou rentabilidades atuais.

O documento completo é adicionado ao contexto de cada pergunta. Isso mantém o MVP simples e transparente, embora aumente o tempo de processamento do modelo local.

## Dados preparados para o futuro

O perfil e as transações são exemplos fictícios versionados para orientar implementações posteriores. Quando essas funcionalidades existirem, os dados deverão ser coletados pelo frontend, validados pelo FastAPI e armazenados com controle de acesso.

O agente deverá receber apenas um resumo necessário para a pergunta, nunca credenciais ou um extrato completo sem necessidade.

```text
Dados do usuário → validação → persistência → resumo controlado → Finch
```

## Segurança e manutenção

- extratos reais, senhas, tokens e credenciais não devem ser versionados;
- o arquivo `.env` permanece fora do Git;
- dados fictícios devem ser identificados na documentação;
- informações que mudam com o tempo devem ser verificadas em fontes oficiais;
- a base deve ser revisada antes de receber novos produtos ou regras financeiras.
