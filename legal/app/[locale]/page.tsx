import { isLocale } from "@/lib/i18n";
import HomePtBr from "@/content/home/pt-br";
import HomeEn from "@/content/home/en";
import HomeJa from "@/content/home/ja";

const PAGES = { "pt-br": HomePtBr, en: HomeEn, ja: HomeJa };

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const Content = PAGES[isLocale(rawLocale) ? rawLocale : "pt-br"];
  return <Content />;
}
