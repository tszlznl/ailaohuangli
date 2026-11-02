export const MIN_DATE = '1901-01-01';
export const MAX_DATE = '2099-12-31';

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const match = DATE_RE.exec(key);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function normalizeDateKey(raw: string | null): string {
  const parsed = raw ? parseDateKey(raw) : null;
  if (!parsed) return todayKey();
  const key = toDateKey(parsed);
  if (key < MIN_DATE) return MIN_DATE;
  if (key > MAX_DATE) return MAX_DATE;
  return key;
}

export function addDays(key: string, delta: number): string {
  const date = parseDateKey(key) ?? new Date();
  date.setDate(date.getDate() + delta);
  return normalizeDateKey(toDateKey(date));
}

export function isTodayKey(key: string): boolean {
  return key === todayKey();
}

export function isWeekendKey(key: string): boolean {
  const date = parseDateKey(key);
  if (!date) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function weekdayZh(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('zh-CN', { weekday: 'long' }).format(date);
}

export function weekdayEn(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).toUpperCase();
}

export function monthZh(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('zh-CN', { month: 'long' }).format(date);
}

export function monthEn(key: string): string {
  const date = parseDateKey(key) ?? new Date();
  return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date).toUpperCase();
}

export function yearOf(key: string): number {
  return (parseDateKey(key) ?? new Date()).getFullYear();
}

export function monthOf(key: string): number {
  return (parseDateKey(key) ?? new Date()).getMonth() + 1;
}

export function dayNumber(key: string): number {
  return (parseDateKey(key) ?? new Date()).getDate();
}
