import type { Metadata } from "next";
import { PAGE_TITLES, isLocale } from "@/lib/i18n";
import SupportPtBr from "@/content/support/pt-br";
import SupportEn from "@/content/support/en";
import SupportJa from "@/content/support/ja";

const PAGES = { "pt-br": SupportPtBr, en: SupportEn, ja: SupportJa };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "pt-br";
  return { title: PAGE_TITLES[locale].support };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const Content = PAGES[isLocale(rawLocale) ? rawLocale : "pt-br"];
  return <Content />;
}
