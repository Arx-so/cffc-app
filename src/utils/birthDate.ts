/**
 * Birth date input helpers shared by Signup and EditProfile so both screens
 * present the same DD/MM/YYYY format. Supabase stores `birth_date` as an ISO
 * date-only string (YYYY-MM-DD), so conversion happens at the form boundary.
 */

/** Auto-insert slashes so the user sees DD/MM/YYYY while typing digits. */
export const formatBirthDateInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

/** Parse a DD/MM/YYYY string into a Date. Returns null when incomplete or invalid. */
export const parseDDMMYYYY = (text: string): Date | null => {
  if (text.length !== 10) return null;
  const [dd, mm, yyyy] = text.split('/').map(Number);
  if (!dd || !mm || !yyyy) return null;
  const date = new Date(yyyy, mm - 1, dd);
  // Guard against invalid dates like 31/02/2000.
  if (
    date.getDate() !== dd ||
    date.getMonth() !== mm - 1 ||
    date.getFullYear() !== yyyy
  ) return null;
  return date;
};

export const getAgeInYears = (date: Date): number => {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
};

/** Date -> YYYY-MM-DD, the shape the `birth_date` column expects. */
export const toYYYYMMDD = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, '0');
  const dd = `${date.getDate()}`.padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

/**
 * YYYY-MM-DD (as stored) -> DD/MM/YYYY (as shown in the form). Parsed by string
 * rather than through `new Date` to avoid the UTC shift that would move the day
 * back for users in negative offsets. Non-ISO input is returned untouched so an
 * unexpected value stays visible instead of silently blanking the field.
 */
export const isoToDDMMYYYY = (iso: string | null | undefined): string => {
  if (!iso?.trim()) return '';
  const datePart = iso.split('T')[0] ?? iso;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(datePart);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
};

/** DD/MM/YYYY -> YYYY-MM-DD, or null when the text is not a valid date. */
export const ddmmyyyyToIso = (text: string): string | null => {
  const parsed = parseDDMMYYYY(text.trim());
  return parsed ? toYYYYMMDD(parsed) : null;
};
