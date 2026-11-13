import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "SASS · Gestão Imobiliária", template: "%s · SASS" },
  description: "Obras por administração e leilão de imóveis — gestão integrada.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
