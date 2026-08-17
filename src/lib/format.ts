/** Money and date formatting for the Indonesian market. */

/** Card / listing style: `Rp150.000`. */
export function rupiah(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}

/** Checkout style: `IDR 262,000`. */
export function idr(amount: number): string {
  return `IDR ${amount.toLocaleString('en-US')}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** `2026-07-20` → a local `Date` (avoids the UTC shift of `new Date(iso)`). */
/**
 * Money short enough for a chart axis: 24.600.000 becomes "25jt". Whole
 * millions lose the decimal, so an axis reads 5jt / 10jt / 15jt rather than
 * 5,0jt / 10jt / 15jt.
 */
export function shortRupiah(amount: number): string {
  if (amount >= 1_000_000) {
    const millions = amount / 1_000_000;
    const rounded = Math.round(millions * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1).replace('.', ',')}jt`;
  }
  if (amount >= 1_000) return `${Math.round(amount / 1_000)}rb`;
  return String(amount);
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `Sun, 20 July 2026` */
export function longDate(iso: string): string {
  const date = parseISODate(iso);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** `Sun, 20 Jul` */
export function shortDate(iso: string): string {
  const date = parseISODate(iso);
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)}`;
}

/** `20 Jul 2026` */
export function compactDate(iso: string): string {
  const date = parseISODate(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()].slice(0, 3)} ${date.getFullYear()}`;
}

export function monthLabel(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

export const WEEKDAY_LABELS = DAYS;

/** `07:00 - 08:30 WIB` */
export function timeRange(start: string, end: string): string {
  return `${start} - ${end} WIB`;
}

/** `09.00 – 11.00 (2h)` — the dotted form used on session cards. */
export function sessionWindow(start: string, end: string, durationMinutes: number): string {
  const hours = durationMinutes / 60;
  const label = Number.isInteger(hours) ? `${hours}h` : `${durationMinutes}min`;
  return `${start.replace(':', '.')} – ${end.replace(':', '.')} (${label})`;
}
