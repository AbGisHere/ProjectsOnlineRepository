// Postgres connection settings from DATABASE_URL for the npm scripts
// (server/dbConfig.ts is the same logic for the app). Hosted databases such
// as Supabase use TLS; localhost, or DB_SSL=disable, connects without it.
function poolConfig() {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill it in.');
  const url = new URL(raw);
  url.searchParams.delete('sslmode');
  const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  const ssl = process.env.DB_SSL === 'disable' || local ? false : { rejectUnauthorized: false };
  return { connectionString: url.toString(), ssl };
}

module.exports = { poolConfig };
