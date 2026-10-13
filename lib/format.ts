import type { Status } from './types';

export const STATUS_LABEL: Record<Status, string> = {
  ONGOING: 'Ongoing',
  SUBMITTED: 'Submitted',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
};

export function fmtDate(v: string | null | undefined): string {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** YYYY-MM-DD for <input type="date">. */
export function isoDate(v: string | null | undefined): string {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function fmtScore(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—';
  return Number(v).toFixed(Number.isInteger(Number(v)) ? 0 : 1);
}

export function shortYear(y: string): string {
  const m = /^(\d{4})-(\d{2})(\d{2})$/.exec(y);
  return m ? `${m[1]}–${m[3]}` : y;
}

export function initials(name: string): string {
  return name
    .replace(/^(Dr|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}
