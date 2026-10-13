// JWT helpers for API clients (Postman, curl): POST /api/auth/login issues a
// token, verifyToken() checks it. See guard.ts for who-is-calling checks.
import jwt from 'jsonwebtoken';
import { ApiError } from '../errors';

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

export function verifyToken(token: string): TokenUser {
  if (!token) throw new ApiError(401, 'Missing or malformed Authorization header');
  try {
    return jwt.verify(token, secret()) as TokenUser;
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
}
