import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { APP_NAME, SITE_URL } from "@/lib/site";
import { HTML_LANG, LOCALES, Locale, isLocale } from "@/lib/i18n";
import { Nav } from "@/components/Nav";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const DESCRIPTIONS: Record<Locale, string> = {
  "pt-br": "Política de Privacidade, Termos de Uso e Suporte do app Big Eye Scout.",
  en: "Privacy Policy, Terms of Use and Support for the Big Eye Scout app.",
  ja: "Big Eye Scout アプリのプライバシーポリシー、利用規約、サポート情報。",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "pt-br";

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${APP_NAME} — Central Legal`,
      template: `%s — ${APP_NAME}`,
    },
    description: DESCRIPTIONS[locale],
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale;

  return (
    <html lang={HTML_LANG[locale]}>
      <body>
        <Nav locale={locale} />
        {children}
      </body>
    </html>
  );
}
