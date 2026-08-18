# Base de Conhecimento do Finch

## Objetivo

Esta base separa conteúdo educativo, dados fictícios de teste e dados dinâmicos do usuário. O Finch usa essas informações para educação financeira e análise descritiva; ele não recomenda compra, venda ou alocação individual de investimentos.

## Arquivos atuais

| Arquivo | Tipo | Finalidade |
| --- | --- | --- |
| `data/financas-basicas.md` | Base educacional | Explicar produtos, risco, liquidez, retorno e diversificação. |
| `data/perfil_investidor.json` | Perfil fictício | Demonstrar o formato de dados de um usuário. |
| `data/transacoes_exemplo.csv` | Transações fictícias | Testar importação, categorização e análise. |

## Dados do usuário

O perfil reúne dados pessoais, situação financeira, perfil investidor, objetivos e investimentos atuais. No sistema real, o frontend coletará essas informações e o FastAPI as salvará no PostgreSQL. O JSON atual usa dados fictícios para desenvolvimento.

As transações pessoais poderão ser cadastradas manualmente ou enviadas em CSV. O fluxo previsto é:

```text
Dados do usuário → validação no FastAPI → PostgreSQL → resumo financeiro → Finch
```

Extratos reais, senhas, credenciais e arquivos enviados por usuários não devem ser versionados no Git.

## Uso pelo agente

Finch recebe apenas o contexto necessário:

1. **Perfil:** adapta linguagem, profundidade e cuidados da explicação.
2. **Base educacional:** explica conceitos e compara produtos.
3. **Resumo de transações:** apresenta receitas, despesas, categorias e recorrências.

O backend deve fornecer um resumo das transações, e não o extrato bruto completo, para o agente.