import type { Metadata } from "next";
import { PAGE_TITLES, isLocale } from "@/lib/i18n";
import DeleteAccountPtBr from "@/content/delete-account/pt-br";
import DeleteAccountEn from "@/content/delete-account/en";
import DeleteAccountJa from "@/content/delete-account/ja";

const PAGES = {
  "pt-br": DeleteAccountPtBr,
  en: DeleteAccountEn,
  ja: DeleteAccountJa,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : "pt-br";
  return { title: PAGE_TITLES[locale].deleteAccount };
}

export default async function DeleteAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const Content = PAGES[isLocale(rawLocale) ? rawLocale : "pt-br"];
  return <Content />;
}
