// GET /api -> health check.
export function GET() {
  return Response.json({ success: true, message: 'PRO — Project Online Repository API is running' });
}
