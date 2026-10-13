// Unknown /api paths get the API's JSON 404 instead of the HTML not-found page.
function notFound(req: Request) {
  const { pathname } = new URL(req.url);
  return Response.json({ success: false, error: `Route not found: ${req.method} ${pathname}` }, { status: 404 });
}

export const GET = notFound;
export const POST = notFound;
export const PUT = notFound;
export const DELETE = notFound;
