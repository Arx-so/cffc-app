import type { Metadata } from "next";
import { PAGE_TITLES, isLocale } from "@/lib/i18n";
import PrivacyPtBr from "@/content/privacy/pt-br";
import PrivacyEn from "@/content/privacy/en";
import PrivacyJa from "@/content/privacy/ja";

const PAGES = { "pt-br": PrivacyPtBr, en: PrivacyEn, ja: PrivacyJa };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "pt-br";
  return { title: PAGE_TITLES[locale].privacy };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const Content = PAGES[isLocale(rawLocale) ? rawLocale : "pt-br"];
  return <Content />;
}
