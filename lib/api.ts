// Thin client for the PRO Express API. Every call goes through `request`, so
// auth headers and error shapes are handled in exactly one place.

// The API is served by this same Next.js app under /api. Override only to
// point the UI at an API hosted elsewhere.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

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

// The API already turns database errors into sentences; this rewrites the
// common ones for the screen.
function friendlyMessage(status: number, raw: string): string {
  if (!raw) return status >= 500 ? 'The server hit an unexpected error. Try again in a moment.' : 'The request could not be completed.';
  if (raw === 'Validation failed') return 'Some fields need attention.';
  if (/foreign key violation/.test(raw)) return 'One of the linked records (team, student, faculty, department…) does not exist.';
  if (/referenced by other rows/.test(raw)) return 'This record is still linked to other records. Remove those links first, then delete it.';
  if (/same unique value/.test(raw)) return 'A record with this ID, name or email already exists.';
  return raw;
}

export type Role = 'student' | 'faculty' | 'admin';
/** The signed-in person: `id` is their Student_ID, Faculty_ID or Admin_ID. */
export type Session = { id: number; name: string; role: Role; email: string };

type Envelope<T> = { success: boolean; data?: T; error?: string; message?: string; details?: FieldError[] };

export async function request<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res: Response;
  try {
    // The Better Auth session cookie rides along on same-origin requests.
    res = await fetch(`${API_URL}${path}`, { method, headers, credentials: 'include', body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, "Can't reach the server. Check your connection and that the app is running.");
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
