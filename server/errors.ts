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

/** Map an error (ApiError or Oracle) to the JSON body and status the API returns. */
export function toErrorResponse(err: unknown) {
  const e = err as { statusCode?: number; errorNum?: number; message?: string; details?: unknown };
  const statusCode = e.statusCode || 500;

  // Oracle unique-constraint / FK violations -> friendlier messages.
  let message = e.message || 'Internal server error';
  if (e.errorNum === 1) message = 'A record with the same unique value already exists.';
  if (e.errorNum === 2291) message = 'Referenced record does not exist (foreign key violation).';
  if (e.errorNum === 2292) message = 'Cannot delete/update: record is referenced by other rows.';

  if (statusCode >= 500) console.error(err);

  const body: Record<string, unknown> = { success: false, error: message };
  if (e.details) body.details = e.details;
  return { statusCode, body };
}
