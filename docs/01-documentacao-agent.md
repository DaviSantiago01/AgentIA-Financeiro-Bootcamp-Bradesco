# Documentação do Agente Finch

## Produto e caso de uso

O **Finch** é um agente educacional de investimentos e finanças pessoais para pessoas iniciantes. Ele explica conceitos, riscos e características de produtos financeiros em uma linguagem simples e objetiva.

O Finch apoia o aprendizado, mas não substitui um profissional certificado, não promete rentabilidade e não recomenda compra, venda ou alocação individual de investimentos.

### Problema e público-alvo

Pessoas que estão começando a investir podem se sentir sobrecarregadas por termos técnicos, riscos e muitas opções disponíveis. O Finch oferece um ponto inicial para compreender:

- risco, retorno, liquidez e diversificação;
- características gerais de investimentos;
- planejamento financeiro antes de investir;
- cuidados e limitações relacionados a decisões financeiras.

## Persona e comunicação

Finch responde em português do Brasil, com linguagem simples, acolhedora e objetiva.

Seus princípios são:

- explicar termos técnicos quando necessário;
- responder de forma direta, em até 120 palavras e dois parágrafos;
- usar somente o contexto educacional fornecido;
- reconhecer quando não possui informação suficiente;
- não inventar taxas, cotações, garantias ou regras atuais;
- destacar riscos e limitações relevantes.

## Escopo atual do MVP

O MVP possui uma funcionalidade principal: o **chat educacional**.

No chat, o usuário pode perguntar sobre finanças pessoais e investimentos. O Finch usa integralmente `data/financas-basicas.md` como contexto para produzir a resposta.

O MVP atual:

- possui uma interface de chat em Next.js;
- valida mensagens com FastAPI e Pydantic;
- gera respostas localmente com Ollama e `qwen3.5:2b`;
- não armazena mensagens nem mantém histórico entre requisições;
- não utiliza perfil ou transações do usuário;
- não possui banco de dados, LangChain, RAG ou busca vetorial.

## Fluxo principal da conversa

```text
Usuário → Next.js → POST /chat → FastAPI → Finch Agent → Ollama Service → qwen3.5:2b → Resposta
```

1. O usuário escreve uma pergunta na interface.
2. O frontend envia `{ "message": "..." }` diretamente ao FastAPI.
3. O FastAPI valida a mensagem com `MessageSchema`.
4. O Finch adiciona o prompt de sistema e a base educacional completa.
5. O Ollama Service envia o contexto para o modelo local com `think` desativado.
6. O backend valida a resposta do modelo e a devolve ao frontend.
7. O frontend apresenta a resposta ou uma mensagem de erro segura.

## Arquitetura atual

| Componente | Responsabilidade |
| --- | --- |
| Next.js | Renderiza o chat e usa `fetch` para chamar o FastAPI. |
| FastAPI | Expõe `/health` e `/chat`, valida a entrada e traduz falhas em respostas HTTP. |
| Finch Agent | Define comportamento, monta o contexto e carrega a base educacional completa. |
| Ollama Service | Realiza a comunicação HTTP e valida a resposta do modelo local. |
| qwen3.5:2b | Gera a resposta em linguagem natural no computador do usuário. |
| `financas-basicas.md` | Fornece o conhecimento educacional usado em todas as perguntas. |

O frontend não usa uma Next.js API Route no MVP. A chamada sai do Client Component diretamente para o FastAPI, com CORS limitado aos endereços locais do frontend.

## Configuração e erros

As configurações do Ollama são obrigatórias e ficam em `apps/api/.env`, que não é versionado. O repositório fornece apenas `.env.example`.

O backend diferencia:

| Código | Significado |
| --- | --- |
| `502` | O modelo retornou conteúdo inválido ou incompleto. |
| `503` | O Ollama local não está disponível. |
| `504` | O modelo ultrapassou o tempo limite configurado. |

## Segurança e limitações

- O prompt orienta o Finch a não solicitar, validar ou repetir credenciais.
- O MVP não possui filtro técnico robusto para detectar senha, cartão ou dados bancários antes do envio ao modelo.
- Dados financeiros reais ou credenciais não devem ser enviados ao chat.
- O Finch não acessa contas, extratos, cartões nem executa operações financeiras.
- A base não contém taxas, cotações ou dados de mercado em tempo real.
- A resposta depende das limitações do modelo local e deve ser tratada como conteúdo educacional.
- O envio da base completa aumenta a latência; nos testes locais, respostas levaram aproximadamente 50 a 172 segundos.

## Evoluções futuras

- formulário e persistência do perfil do usuário;
- importação e resumo de transações;
- PostgreSQL para usuários, conversas e mensagens;
- histórico de conversa;
- recuperação semântica com RAG ou banco vetorial;
- fontes financeiras atualizadas e ferramentas controladas;
- validação robusta de dados sensíveis.

O diagrama em [`docs/arquitetura.png`](arquitetura.png) representa essa visão de evolução e inclui componentes que ainda não fazem parte do MVP funcional.
