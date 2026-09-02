import Link from "next/link";
import { NAV_LABELS, ROUTES, Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Nav({ locale }: { locale: Locale }) {
  const labels = NAV_LABELS[locale];

  return (
    <nav className="top">
      <div className="inner">
        <Link href={`/${locale}`} className="brand">
          Big Eye <span>Scout</span>
        </Link>
        <div className="links">
          <Link href={`/${locale}/${ROUTES.privacy}`}>{labels.privacy}</Link>
          <Link href={`/${locale}/${ROUTES.terms}`}>{labels.terms}</Link>
          <Link href={`/${locale}/${ROUTES.support}`}>{labels.support}</Link>
          <LanguageSwitcher currentLocale={locale} />
        </div>
      </div>
    </nav>
  );
}
