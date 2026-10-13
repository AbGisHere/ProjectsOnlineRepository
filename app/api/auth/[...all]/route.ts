// Better Auth endpoints: /api/auth/sign-in/email, /api/auth/sign-out,
// /api/auth/get-session, … (the token routes /api/auth/login and
// /api/auth/register are more specific and keep working).
import { toNextJsHandler } from 'better-auth/next-js';
import { auth } from '@/server/auth';

export const { GET, POST } = toNextJsHandler(auth);
