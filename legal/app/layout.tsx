import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — Central Legal`,
    template: `%s — ${APP_NAME}`,
  },
  description:
    "Política de Privacidade, Termos de Uso e Suporte do app Big Eye Scout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <nav className="top">
          <div className="inner">
            <Link href="/" className="brand">
              Big Eye <span>Scout</span>
            </Link>
            <div className="links">
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/termos">Termos</Link>
              <Link href="/suporte">Suporte</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
