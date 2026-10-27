import clsx, { type ClassValue } from 'clsx';

export const cn = (...v: ClassValue[]) => clsx(v);

/** Prices are integers in kobo. 250000 -> ₦2,500 */
export function formatPrice(minor: number, currency = 'NGN'): string {
  const major = minor / 100;
  const symbol = currency === 'NGN' ? '₦' : currency + ' ';
  return symbol + major.toLocaleString('en-NG', { maximumFractionDigits: 2 });
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Only allow in-app redirects (blocks open redirects like //evil.com) */
export function safeNext(next: string | null): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

export const PREVIEW_SECONDS = 30;
