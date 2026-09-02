import type { Metadata } from "next";
import { PAGE_TITLES, isLocale } from "@/lib/i18n";
import TermsPtBr from "@/content/terms/pt-br";
import TermsEn from "@/content/terms/en";
import TermsJa from "@/content/terms/ja";

const PAGES = { "pt-br": TermsPtBr, en: TermsEn, ja: TermsJa };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "pt-br";
  return { title: PAGE_TITLES[locale].terms };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const Content = PAGES[isLocale(rawLocale) ? rawLocale : "pt-br"];
  return <Content />;
}
