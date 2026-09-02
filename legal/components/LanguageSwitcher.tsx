"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGUAGE_NAME, LOCALES, Locale } from "@/lib/i18n";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/"); // drop "/<locale>"

  return (
    <div className="lang-switcher">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${rest ? `/${rest}` : ""}`}
          className={locale === currentLocale ? "lang-active" : undefined}
        >
          {LANGUAGE_NAME[locale]}
        </Link>
      ))}
    </div>
  );
}
