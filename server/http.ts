// Wraps a route handler so thrown errors (ApiError or Oracle) become the
// API's standard JSON error response. Plays the role Express's asyncHandler
// + errorHandler middleware used to.
import { ApiError, toErrorResponse } from './errors';

export type Ctx = {
  req: Request;
  params: Record<string, string>;
  query: URLSearchParams;
  body: Record<string, unknown>;
};

type Handler = (ctx: Ctx) => Promise<Response>;
type RouteContext = { params: Promise<Record<string, string>> };

export function route(handler: Handler) {
  return async (req: Request, context?: RouteContext): Promise<Response> => {
    try {
      const params = context?.params ? await context.params : {};
      let body: Record<string, unknown> = {};
      if (req.method !== 'GET' && req.method !== 'DELETE') {
        const text = await req.text();
        if (text) {
          try {
            body = JSON.parse(text);
          } catch {
            throw new ApiError(400, 'Request body must be valid JSON');
          }
        }
      }
      return await handler({ req, params, query: new URL(req.url).searchParams, body });
    } catch (err) {
      const { statusCode, body } = toErrorResponse(err);
      return Response.json(body, { status: statusCode });
    }
  };
}

export const ok = (payload: Record<string, unknown>, status = 200) => Response.json({ success: true, ...payload }, { status });

/** Reject non-integer path params with the same 400 shape as body validation. */
export function intParams(params: Record<string, string>, ...names: string[]) {
  const details = names.filter((n) => !/^\d+$/.test(params[n] ?? '')).map((field) => ({ field, message: 'Invalid value' }));
  if (details.length) throw new ApiError(400, 'Validation failed', details);
}
