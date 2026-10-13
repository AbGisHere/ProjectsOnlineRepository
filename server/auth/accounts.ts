// Keeps Better Auth's auth_user/auth_account rows in step with the
// Student, Faculty and Admin tables. The ids are deterministic
// ('student-1001', 'acct-student-1001'), the same scheme the seed uses.
import type { AccountRole } from '@/lib/emailRules';
import { execute } from '../db';

const userId = (role: AccountRole, refId: unknown) => `${role}-${refId}`;

/** Create a sign-in account (email + bcrypt hash) for a person row. */
export async function createAuthAccount(role: AccountRole, refId: unknown, name: unknown, email: unknown, passwordHash: string) {
  const id = userId(role, refId);
  await execute(
    `INSERT INTO auth_user (id, name, email, email_verified, user_role, ref_id)
     VALUES (:id, :name, :email, 0, :role, :refId)`,
    { id, name, email, role, refId }
  );
  await execute(
    `INSERT INTO auth_account (id, account_id, provider_id, user_id, password)
     VALUES (:aid, :id, 'credential', :id, :hash)`,
    { aid: `acct-${id}`, id, hash: passwordHash }
  );
}

/** Mirror a name/email change onto the person's sign-in account. */
export async function syncAuthAccount(role: AccountRole, refId: unknown, fields: { name?: unknown; email?: unknown }) {
  const sets: string[] = [];
  const binds: Record<string, unknown> = { role, refId };
  if (fields.name !== undefined) {
    sets.push('name = :name');
    binds.name = fields.name;
  }
  if (fields.email !== undefined) {
    sets.push('email = :email');
    binds.email = fields.email;
  }
  if (!sets.length) return;
  await execute(`UPDATE auth_user SET ${sets.join(', ')}, updated_at = SYSTIMESTAMP WHERE user_role = :role AND ref_id = :refId`, binds);
}

/** Remove a person's sign-in account; sessions and credentials cascade. */
export async function deleteAuthAccount(role: AccountRole, refId: unknown) {
  await execute('DELETE FROM auth_user WHERE user_role = :role AND ref_id = :refId', { role, refId });
}
