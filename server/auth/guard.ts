// Who is calling? Accepts either a Better Auth session cookie (the web app)
// or a Bearer JWT from POST /api/auth/login (Postman, curl, other clients).
import { ApiError } from '../errors';
import { auth } from './index';
import { verifyToken, type Role, type TokenUser } from './jwt';

export async function authenticate(req: Request): Promise<TokenUser> {
  const header = req.headers.get('authorization') || '';
  if (header.startsWith('Bearer ')) return verifyToken(header.slice(7));

  const session = await auth.api.getSession({ headers: req.headers });
  if (session?.user) {
    const u = session.user as typeof session.user & { role: Role; refId: number };
    return { id: Number(u.refId), role: u.role, email: u.email };
  }
  throw new ApiError(401, 'Missing or malformed Authorization header');
}

export function requireRole(user: TokenUser, ...roles: Role[]) {
  if (!roles.includes(user.role)) throw new ApiError(403, 'Insufficient permissions for this action');
}
