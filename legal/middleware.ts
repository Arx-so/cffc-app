import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

// Requests without a locale prefix (e.g. "/suporte") are the URLs already
// registered in App Store Connect / Google Play and linked from the app's
// LegalUrls constants — they must keep resolving. This rewrites them
// internally to the default locale ("/pt-br/suporte") without changing the
// visible URL, while "/en/..." and "/ja/..." are served directly.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocalePrefix = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocalePrefix) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
