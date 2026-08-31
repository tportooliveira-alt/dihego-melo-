import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";

import { site } from "@/data/site";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--fonte-display",
  display: "swap",
});

const corpo = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--fonte-corpo",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.marcaCompleta} — compra e venda de veículos`,
  description: site.descricao,
  openGraph: {
    title: site.marcaCompleta,
    description: site.descricao,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${corpo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
