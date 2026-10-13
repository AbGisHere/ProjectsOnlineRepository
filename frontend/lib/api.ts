// Thin client for the PRO Express API. Every call goes through `request`, so
// auth headers and error shapes are handled in exactly one place.

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/$/, '');

const TOKEN_KEY = 'pro.session';

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  status: number;
  details: FieldError[];
  constructor(status: number, message: string, details: FieldError[] = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
  /** Field-level messages keyed by request-body field name. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const d of this.details) if (!out[d.field]) out[d.field] = humanizeValidation(d.field, d.message);
    return out;
  }
}

// express-validator's default message is just "Invalid value"; say which rule
// the field broke instead.
function humanizeValidation(field: string, message: string): string {
  if (message && message !== 'Invalid value') return message;
  const f = field.replace(/_/g, ' ');
  if (/email/.test(field)) return 'Enter a valid email address, like name@vit.edu.';
  if (/password/.test(field)) return 'Use at least 6 characters.';
  if (/year$/.test(field) && field !== 'academic_year') return 'Year must be between 1 and 5.';
  if (/score/.test(field)) return 'Score must be a number from 0 to 100.';
  if (/_id$/.test(field)) return `Enter a whole-number ${f.replace(/ id$/, ' ID')}.`;
  if (/url/.test(field)) return 'Enter a full URL, starting with https://.';
  if (/date/.test(field)) return 'Enter a date as YYYY-MM-DD.';
  return `Check the ${f}.`;
}

// The API's error middleware already maps the common Oracle errors; this
// covers the rest so no raw ORA- text reaches the screen.
function friendlyMessage(status: number, raw: string): string {
  if (!raw) return status >= 500 ? 'The server hit an unexpected error. Try again in a moment.' : 'The request could not be completed.';
  if (/ORA-\d+|NJS-\d+|DPI-\d+/.test(raw)) {
    if (/ORA-01400/.test(raw)) return 'A required field is missing.';
    if (/ORA-02290/.test(raw)) return 'One of the values is outside what the database allows (check year, status or score).';
    if (/ORA-12899/.test(raw)) return 'One of the values is too long for its field.';
    if (/ORA-01722/.test(raw)) return 'A number field contains something that is not a number.';
    if (/ORA-01861|ORA-01830|ORA-01841/.test(raw)) return 'Dates must be written as YYYY-MM-DD.';
    if (/NJS-|DPI-|ORA-12541|ORA-12514/.test(raw)) return 'The API cannot reach the Oracle database. Check that the database container is running.';
    return 'The database rejected this change. Check the values and try again.';
  }
  if (raw === 'Validation failed') return 'Some fields need attention.';
  if (/foreign key violation/.test(raw)) return 'One of the linked records (team, student, faculty, department…) does not exist.';
  if (/referenced by other rows/.test(raw)) return 'This record is still linked to other records. Remove those links first, then delete it.';
  if (/same unique value/.test(raw)) return 'A record with this ID, name or email already exists.';
  return raw;
}

export type Session = { id: number; name: string; role: Role; email: string; token: string };
export type Role = 'student' | 'faculty' | 'admin';

export function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function writeSession(s: Session | null) {
  try {
    if (s) localStorage.setItem(TOKEN_KEY, JSON.stringify(s));
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable: session lives for this tab only */
  }
}

type Envelope<T> = { success: boolean; data?: T; error?: string; message?: string; details?: FieldError[] };

export async function request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const session = typeof window !== 'undefined' ? readSession() : null;
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, `Can't reach the PRO API at ${API_URL}. Start it with "npm run dev" in the project root.`);
  }

  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    /* non-JSON body */
  }

  if (!res.ok || json?.success === false) {
    if (res.status === 401 && path !== '/auth/login') {
      throw new ApiError(401, 'Your session has expired. Sign in again to make changes.');
    }
    throw new ApiError(res.status, friendlyMessage(res.status, json?.error || ''), json?.details || []);
  }
  return (json?.data ?? (json as unknown)) as T;
}

export const api = {
  get: <T>(p: string) => request<T>('GET', p),
  post: <T>(p: string, b: unknown) => request<T>('POST', p, b),
  put: <T>(p: string, b: unknown) => request<T>('PUT', p, b),
  del: <T>(p: string) => request<T>('DELETE', p),
};
