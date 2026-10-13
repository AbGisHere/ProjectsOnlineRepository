// JWT helpers. authenticate() verifies the Bearer token and returns the
// { id, role, email } payload; requireRole() restricts to specific roles.
import jwt from 'jsonwebtoken';
import { ApiError } from './errors';

export type Role = 'student' | 'faculty' | 'admin';
export type TokenUser = { id: number; role: Role; email: string };

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new ApiError(500, 'JWT_SECRET is not configured on the server.');
  return s;
}

export function signToken(user: TokenUser) {
  return jwt.sign(user, secret(), { expiresIn: (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'] });
}

export function authenticate(req: Request): TokenUser {
  const header = req.headers.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Missing or malformed Authorization header');
  try {
    return jwt.verify(token, secret()) as TokenUser;
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
}

export function requireRole(user: TokenUser, ...roles: Role[]) {
  if (!roles.includes(user.role)) throw new ApiError(403, 'Insufficient permissions for this action');
}
