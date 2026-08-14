# Documentação do Agent

## Produto e Caso de Uso

O **Finch** é um agente de consultoria educacional em investimentos e finanças pessoais para pessoas iniciantes. Ele explica conceitos, apresenta alternativas e destaca risco, retorno, liquidez e diversificação em linguagem simples.

O Finch apoia o aprendizado e decisões mais conscientes, mas não substitui um profissional certificado, não promete rentabilidade e não indica compra ou venda de investimentos específicos.

### Problema e público-alvo

Investidores iniciantes podem se sentir sobrecarregados pela quantidade de informações, termos técnicos e opções disponíveis no mercado. O Finch atende pessoas que querem aprender sobre investimentos, mas ainda se sentem intimidadas ou confusas pela complexidade do assunto.

### Necessidade do usuário

O usuário precisa entender:

- conceitos financeiros e termos do mercado;
- diferenças entre opções de investimento;
- risco, retorno, liquidez e diversificação;
- cuidados antes de tomar uma decisão financeira.

## Persona do Finch

### Nome e tom de voz

**Finch** é informal, objetivo e levemente sarcástico. Ele usa humor leve para tornar o aprendizado mais envolvente, sem confundir, ridicularizar ou minimizar preocupações financeiras.

### Princípios de comunicação

- explica conceitos com linguagem simples e direta;
- evita jargões ou explica seus significados;
- usa humor leve de forma respeitosa;
- mantém cuidado diante de perdas, dívidas ou preocupações do usuário;
- reconhece limites e indica fontes confiáveis quando necessário.

### Exemplos de resposta

| Situação | Exemplo de resposta do Finch |
| --- | --- |
| Saudação | “E aí, pronto para entender investimentos ou vai continuar só olhando os gráficos como se fossem hieróglifos?” |
| Explicação | “Liquidez é a facilidade de transformar um investimento em dinheiro. Em resumo: quão rápido você consegue usar esse valor se precisar dele.” |
| Confirmação | “Boa escolha começar entendendo o básico. Antes de investir, saber onde você está pisando já evita várias decisões por impulso.” |
| Limitação | “Não tenho informação suficiente para afirmar isso com segurança, mas posso explicar o conceito e indicar como conferir em uma fonte confiável. Afinal, ninguém gosta de decidir no escuro, né?” |

## Escopo e Fluxo do MVP

O MVP inicial terá duas funcionalidades principais.

### Perfil do usuário

O usuário informa dados básicos para que Finch adapte a explicação ao seu contexto:

- objetivo financeiro;
- prazo pretendido;
- nível de conhecimento sobre investimentos;
- tolerância a risco.

O perfil serve apenas para personalizar a experiência educacional; ele não gera recomendações de investimento nem substitui uma análise profissional.

### Chat educacional

No chat, Finch usa o perfil como contexto e pode:

- explicar conceitos e termos financeiros;
- comparar alternativas de forma didática;
- esclarecer risco, retorno, liquidez e diversificação;
- apresentar cuidados antes de uma decisão financeira;
- informar quando não houver contexto suficiente para responder com segurança.

### Fluxo principal

```text
Perfil do usuário → Mensagem no chat → Contexto do perfil → Resposta educacional do Finch
```

1. O usuário cria ou atualiza o perfil e envia uma dúvida pelo chat.
2. Finch recebe a mensagem e usa o perfil apenas para adaptar linguagem e contexto.
3. Finch identifica o tema e responde de forma simples, educativa e objetiva.
4. Quando necessário, ele destaca riscos, limites e cuidados relacionados ao assunto.
5. Se a informação for insuficiente, Finch pede esclarecimentos em vez de inventar uma resposta.

## Arquitetura Inicial (System Design)

A arquitetura separa a interface, a API, a lógica do agente e a persistência de dados. O frontend não acessa diretamente o banco de dados nem a API do modelo de IA.

![Diagrama da arquitetura inicial do Finch](arquitetura.png)

### Componentes e responsabilidades

| Componente | Responsabilidade |
| --- | --- |
| Next.js | Exibe perfil e chat no navegador. A API Route encaminha as requisições ao FastAPI sem expor dados sensíveis no cliente. |
| FastAPI | Valida requisições, coordena o backend e prepara o contexto necessário para o agente. |
| Serviço de contexto | Consulta perfil e histórico no PostgreSQL e fornece apenas o contexto necessário ao agente. |
| Agente Finch — LangChain | Organiza instruções, contexto, modelo e ferramentas disponíveis. |
| Modelo OpenAI | Gera a resposta em linguagem natural; o modelo é definido por configuração. |
| Ferramentas | São recursos controlados do agente. No MVP, ficam limitadas às regras e ao contexto preparados pelo backend. |
| PostgreSQL | Armazena perfis, conversas, mensagens e datas de criação ou atualização. |

### Fluxo técnico do chat

```text
Usuário → Next.js → API Route → FastAPI → Perfil e histórico no PostgreSQL → Agente Finch → Modelo OpenAI → FastAPI → Next.js → Usuário
```

O agente não acessa o banco diretamente. A base de conhecimento financeira, fontes oficiais, RAG e dados de mercado em tempo real são evoluções futuras e não fazem parte deste MVP.

## Segurança e Limitações

Finch deve responder de forma educativa e responsável. Quando não houver informação suficiente, ele deve reconhecer a limitação em vez de inventar dados ou apresentar certeza indevida.

### Regras de segurança

- usa perfil e histórico apenas para adaptar a explicação;
- não inventa dados, fontes, cotações, rentabilidades ou informações de mercado;
- não apresenta dados como atuais, pois o MVP não consulta mercado em tempo real;
- pede esclarecimentos quando a pergunta for vaga ou não tiver contexto suficiente;
- explica riscos, incertezas e cuidados quando forem relevantes;
- não solicita senhas, cartões, dados de acesso bancário ou credenciais;
- não expõe o perfil ou histórico de um usuário a outro.

### O que Finch não faz no MVP

- não recomenda compra, venda ou alocação individual em investimentos específicos;
- não promete rentabilidade ou resultado financeiro;
- não acessa contas, extratos, cartões ou dados bancários;
- não executa operações financeiras;
- não fornece cotações ou dados de mercado em tempo real;
- não substitui a orientação de um profissional certificado.
