export type Locale = "pt-br" | "en" | "ja";

export const LOCALES: Locale[] = ["pt-br", "en", "ja"];
export const DEFAULT_LOCALE: Locale = "pt-br";

export function isLocale(value: string): value is Locale {
  return (LOCALES as string[]).includes(value);
}

export const HTML_LANG: Record<Locale, string> = {
  "pt-br": "pt-BR",
  en: "en",
  ja: "ja",
};

export const LANGUAGE_NAME: Record<Locale, string> = {
  "pt-br": "PT",
  en: "EN",
  ja: "JA",
};

export const NAV_LABELS: Record<Locale, { privacy: string; terms: string; support: string }> = {
  "pt-br": { privacy: "Privacidade", terms: "Termos", support: "Suporte" },
  en: { privacy: "Privacy", terms: "Terms", support: "Support" },
  ja: { privacy: "プライバシー", terms: "利用規約", support: "サポート" },
};

export const LAST_UPDATED: Record<Locale, string> = {
  "pt-br": "31 de julho de 2026",
  en: "July 31, 2026",
  ja: "2026年7月31日",
};

export const PAGE_TITLES: Record<
  Locale,
  { privacy: string; terms: string; support: string; deleteAccount: string }
> = {
  "pt-br": {
    privacy: "Política de Privacidade",
    terms: "Termos de Uso",
    support: "Suporte",
    deleteAccount: "Exclusão de Conta e Dados",
  },
  en: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    support: "Support",
    deleteAccount: "Account & Data Deletion",
  },
  ja: {
    privacy: "プライバシーポリシー",
    terms: "利用規約",
    support: "サポート",
    deleteAccount: "アカウントとデータの削除",
  },
};

// Path segments are kept identical across locales (only the locale prefix
// changes) so the language switcher can swap the first path segment without
// needing a slug-translation map.
export const ROUTES = {
  privacy: "privacidade",
  terms: "termos",
  support: "suporte",
  deleteAccount: "exclusao-de-conta",
} as const;
