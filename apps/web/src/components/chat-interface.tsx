"use client";

import { FormEvent, useState } from "react";
import { ArrowUp, Bot, ChartNoAxesColumnIncreasing, CircleUserRound, MessageCircle, ShieldCheck } from "lucide-react";

type Message = {
  id: number;
  author: "finch" | "user";
  content: string;
};

const suggestions = [
  "O que é CDB?",
  "Como organizar meus gastos?",
  "O que significa liquidez?",
];

const initialMessages: Message[] = [
  {
    id: 1,
    author: "finch",
    content: "Olá, sou o Finch. Posso ajudar você a entender conceitos financeiros e observar seus hábitos com mais clareza. Por onde começamos?",
  },
];

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json();
    if (
      typeof data === "object" &&
      data !== null &&
      "detail" in data &&
      typeof data.detail === "string"
    ) {
      return data.detail;
    }
  } catch {
    // A resposta não possui um corpo JSON aproveitável.
  }

  return "Não foi possível processar a mensagem agora.";
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event?: FormEvent<HTMLFormElement>, suggestedMessage?: string) {
    event?.preventDefault();

    const content = (suggestedMessage ?? draft).trim();
    if (!content || isSending) return;

    const userMessage: Message = {
      id: Date.now(),
      author: "user",
      content,
    };

    setDraft("");
    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setIsSending(true);

    try {
      if (!apiBaseUrl) {
        throw new Error("A comunicação com o Finch não foi configurada.");
      }

      const response = await fetch(`${apiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response));
      }

      const data: { message: string } = await response.json();
      setMessages((currentMessages) => [
        ...currentMessages,
        { id: Date.now() + 1, author: "finch", content: data.message },
      ]);
    } catch (error) {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          author: "finch",
          content:
            error instanceof Error
              ? error.message
              : "Não foi possível conectar ao Finch agora. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Navegação principal">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Finch</span>
        </div>

        <nav className="navigation">
          <a className="nav-item nav-item-active" href="#chat">
            <MessageCircle size={18} aria-hidden="true" />
            Conversa
          </a>
          <span className="nav-item nav-item-disabled">
            <ChartNoAxesColumnIncreasing size={18} aria-hidden="true" />
            Resumo financeiro
          </span>
          <span className="nav-item nav-item-disabled">
            <CircleUserRound size={18} aria-hidden="true" />
            Meu perfil
          </span>
        </nav>

        <div className="sidebar-note">
          <ShieldCheck size={18} aria-hidden="true" />
          <p>Conteúdo educacional. Investimentos envolvem riscos.</p>
        </div>
      </aside>

      <section className="conversation" id="chat" aria-label="Conversa com Finch">
        <header className="conversation-header">
          <div>
            <p className="eyebrow">Assistente educacional</p>
            <h1>Conversa com Finch</h1>
          </div>
        </header>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <article className={`message message-${message.author}`} key={message.id}>
              {message.author === "finch" && (
                <span className="message-avatar" aria-hidden="true"><Bot size={18} /></span>
              )}
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <div className="composer-area">
          <div className="suggestions" aria-label="Perguntas sugeridas">
            {suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => sendMessage(undefined, suggestion)} disabled={isSending}>
                {suggestion}
              </button>
            ))}
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <label className="sr-only" htmlFor="chat-message">Escreva sua mensagem</label>
            <textarea
              id="chat-message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Escreva sua pergunta sobre finanças..."
              rows={1}
              maxLength={1000}
              disabled={isSending}
            />
            <button type="submit" disabled={!draft.trim() || isSending} aria-label="Enviar mensagem" title="Enviar mensagem">
              <ArrowUp size={20} aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
