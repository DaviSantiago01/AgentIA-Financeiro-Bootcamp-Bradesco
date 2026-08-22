import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finch | Educação financeira",
  description: "Agente educacional de investimentos para iniciantes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
