// Better Auth: email + password sign-in with cookie sessions for the web app.
// Every auth_user is linked to one Student, Faculty or Admin row, matched by
// email when the account is created. Students must use @vitstudent.ac.in,
// faculty @vit.ac.in, admins any address (lib/emailRules.ts).
import bcrypt from 'bcryptjs';
import { APIError, betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import { emailRuleError, roleForEmail, type AccountRole } from '@/lib/emailRules';
import { execute, getPool } from '../db';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

const PERSON_TABLE: Record<AccountRole, { table: string; idCol: string }> = {
  student: { table: 'Student', idCol: 'Student_ID' },
  faculty: { table: 'Faculty', idCol: 'Faculty_ID' },
  admin: { table: 'Admin', idCol: 'Admin_ID' },
};

/** Find the Student/Faculty/Admin row an email belongs to. */
async function findPerson(email: string) {
  const role = roleForEmail(email);
  const { table, idCol } = PERSON_TABLE[role];
  const r = await execute<{ ID: number }>(`SELECT ${idCol} AS ID FROM ${table} WHERE LOWER(Email) = LOWER(:email)`, { email });
  const id = r.rows?.[0]?.ID;
  return id === undefined ? null : { role, id: Number(id) };
}

/** 'pro.example.com' or 'https://pro.example.com/' -> 'https://pro.example.com'. */
function origin(value: string | undefined) {
  const v = value?.trim().replace(/\/+$/, '');
  if (!v) return undefined;
  return /^https?:\/\//.test(v) ? v : `https://${v}`;
}

// The public URL (BETTER_AUTH_URL), plus Vercel's own *.vercel.app addresses
// for this deployment, so signing in works on either.
const baseURL = origin(process.env.BETTER_AUTH_URL) ?? origin(process.env.VERCEL_URL);
const trustedOrigins = [
  baseURL,
  origin(process.env.VERCEL_URL),
  origin(process.env.VERCEL_BRANCH_URL),
  origin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
].filter((o): o is string => !!o);

export const auth = betterAuth({
  appName: 'PRO',
  secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET,
  baseURL,
  trustedOrigins,
  // Better Auth's built-in Postgres support (Kysely), on the app's pool.
  database: getPool(),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    autoSignIn: true,
    // bcrypt, so the hashes in Student/Faculty/Admin (and the seed data)
    // are the same format Better Auth stores.
    password: {
      hash: (password) => bcrypt.hash(password, SALT_ROUNDS),
      verify: ({ hash, password }) => bcrypt.compare(password, hash),
    },
  },

  session: {
    modelName: 'auth_session',
    fields: {
      expiresAt: 'expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      ipAddress: 'ip_address',
      userAgent: 'user_agent',
      userId: 'user_id',
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },

  // Tables are auth_* (USER is a reserved word in SQL) with snake_case
  // columns, as created in sql/ddl.sql.
  user: {
    modelName: 'auth_user',
    fields: { emailVerified: 'email_verified', createdAt: 'created_at', updatedAt: 'updated_at' },
    additionalFields: {
      role: { type: 'string', required: true, input: false, fieldName: 'user_role' },
      refId: { type: 'number', required: true, input: false, fieldName: 'ref_id' },
    },
  },
  account: {
    modelName: 'auth_account',
    fields: {
      accountId: 'account_id',
      providerId: 'provider_id',
      userId: 'user_id',
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
      idToken: 'id_token',
      accessTokenExpiresAt: 'access_token_expires_at',
      refreshTokenExpiresAt: 'refresh_token_expires_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
  verification: {
    modelName: 'auth_verification',
    fields: { value: 'verification_value', expiresAt: 'expires_at', createdAt: 'created_at', updatedAt: 'updated_at' },
  },

  databaseHooks: {
    user: {
      create: {
        // Only people already on record can open an account, and only with
        // the email domain their role requires.
        before: async (user) => {
          const email = String(user.email);
          const role = roleForEmail(email);
          const ruleError = emailRuleError(role, email);
          if (ruleError) throw new APIError('BAD_REQUEST', { message: ruleError });
          const person = await findPerson(email);
          if (!person) {
            throw new APIError('BAD_REQUEST', {
              message: `No ${role} record uses ${email}. Register through PRO's sign-up page, or ask an admin to add you first.`,
            });
          }
          return { data: { ...user, role: person.role, refId: person.id } };
        },
      },
    },
  },

  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
