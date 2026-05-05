/** Input while typing — restricts to digits and formats as Brazilian mobile/landline. */
export function formatPhonePtBrInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/** Read-only label from digits stored in `profile.phone`. */
export function formatPhoneDigitsForDisplay(raw: string | null | undefined): string {
  if (!raw?.trim()) return "";
  return formatPhonePtBrInput(raw.replace(/\D/g, ""));
}
