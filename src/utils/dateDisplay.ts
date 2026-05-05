/** Formats YYYY-MM-DD for UI without timezone shift. */
export function formatIsoDateOnlyForLocale(
  iso: string | null | undefined,
  language: string,
): string {
  if (!iso?.trim()) return "";
  const part = iso.split("T")[0] ?? iso;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(part);
  if (!m) return part;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return part;

  try {
    return new Intl.DateTimeFormat(
      language === "pt-br" || language.startsWith("pt")
        ? "pt-BR"
        : language.startsWith("ja")
          ? "ja-JP"
          : "en-US",
      { day: "2-digit", month: "short", year: "numeric" },
    ).format(new Date(y, mo - 1, d));
  } catch {
    return `${m[3]}/${m[2]}/${m[1]}`;
  }
}
