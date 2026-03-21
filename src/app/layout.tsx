import type { Metadata } from "next";
import { Cormorant_Garamond, Sora } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const bodyFont = Sora({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME ?? "Quem Quer Ser Milionário? 5.º Ano"} | ${process.env.NEXT_PUBLIC_SCHOOL_NAME ?? "Escola Conde de Oeiras"}`,
  description: "Aplicação de treino de Matemática do 5.º ano com progressão tipo concurso e envio final de resultados por email.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
