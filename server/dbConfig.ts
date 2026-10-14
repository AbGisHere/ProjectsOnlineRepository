// Postgres connection settings from DATABASE_URL (scripts/dbConfig.js is the
// same logic for the npm scripts). Supabase and other hosted databases need
// TLS; their certificates aren't in Node's default CA list, so the
// connection is encrypted without verifying the chain. Local databases
// (localhost) connect without TLS, and DB_SSL=disable forces that.
import type { PoolConfig } from 'pg';

export function poolConfig(): PoolConfig {
  const raw = process.env.DATABASE_URL;
  // Not set (e.g. during `next build`): queries fail later with a clear
  // "cannot reach the database" error instead of breaking the build.
  if (!raw) return {};
  const url = new URL(raw);
  // An sslmode in the URL would override the ssl option below.
  url.searchParams.delete('sslmode');
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  const ssl = process.env.DB_SSL === 'disable' || local ? false : { rejectUnauthorized: false };
  return { connectionString: url.toString(), ssl };
}
