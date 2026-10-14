// One error shape for the whole API: { success: false, error, details? }.

export class ApiError extends Error {
  statusCode: number;
  details?: { field: string; message: string }[];
  constructor(statusCode: number, message: string, details?: { field: string; message: string }[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Postgres error codes -> the readable messages the API has always sent.
// Unique and foreign-key messages are unchanged from the Oracle version.
const PG_MESSAGES: Record<string, string> = {
  '23505': 'A record with the same unique value already exists.',
  '23502': 'A required field is missing.',
  '23514': 'One of the values is outside what the database allows (check year, status or score).',
  '22001': 'One of the values is too long for its field.',
  '22P02': 'A number field contains something that is not a number.',
  '22003': 'A number is too large for its field.',
  '22007': 'Dates must be written as YYYY-MM-DD.',
  '22008': 'Dates must be written as YYYY-MM-DD.',
};
// Can't reach or sign in to the database (network, DNS, wrong password).
const CONNECTION_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '28P01', '28000', '3D000', '57P03']);
const DB_UNREACHABLE = 'The server cannot reach the database. Check that DATABASE_URL is set and correct.';

/** Map an error (ApiError or Postgres) to the JSON body and status the API returns. */
export function toErrorResponse(err: unknown) {
  const e = err as { statusCode?: number; code?: string; message?: string; details?: unknown };
  const statusCode = e.statusCode || 500;

  let message = e.message || 'Internal server error';
  if (e.code === '23503') {
    // Inserting/updating a row whose parent is missing, vs deleting a parent
    // that other rows still point to.
    message = /^update or delete/i.test(message)
      ? 'Cannot delete/update: record is referenced by other rows.'
      : 'Referenced record does not exist (foreign key violation).';
  } else if (e.code && PG_MESSAGES[e.code]) {
    message = PG_MESSAGES[e.code];
  } else if ((e.code && CONNECTION_CODES.has(e.code)) || /DATABASE_URL/.test(message)) {
    message = DB_UNREACHABLE;
  } else if (e.code === '42P01') {
    message = 'The database tables are missing. Run "npm run ddl" and "npm run seed" against it.';
  } else if (e.code && /^[0-9A-Z]{5}$/.test(e.code) && !e.statusCode) {
    // Any other database error: no raw SQL text reaches the client.
    message = 'The database rejected this change. Check the values and try again.';
  }

  if (statusCode >= 500) console.error(err);

  const body: Record<string, unknown> = { success: false, error: message };
  if (e.details) body.details = e.details;
  return { statusCode, body };
}
