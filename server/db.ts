// Oracle connection pool shared by every API route.
// One pool per server instance: a long-running `next start` keeps it for the
// process lifetime, and on Vercel each warm function instance reuses it.
import oracledb from 'oracledb';

// Return rows as plain objects (column name -> value) instead of arrays.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Auto-commit each execute() call unless a transaction explicitly disables it.
oracledb.autoCommit = true;
// Fetch CLOB columns (e.g. Project.Abstract) as plain strings instead of
// streaming Lob objects, which can't be serialized to JSON.
oracledb.fetchAsString = [oracledb.CLOB];

type Binds = Record<string, unknown>;
export type Row = Record<string, unknown>;

const g = globalThis as unknown as { __proPool?: Promise<oracledb.Pool> };

function getPool(): Promise<oracledb.Pool> {
  if (!g.__proPool) {
    g.__proPool = oracledb
      .createPool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING,
        // Small pool: serverless instances each hold their own.
        poolMin: 0,
        poolMax: Number(process.env.DB_POOL_MAX) || 4,
        poolIncrement: 1,
        poolTimeout: 60,
      })
      .catch((err: unknown) => {
        g.__proPool = undefined; // let the next request retry
        throw err;
      });
  }
  return g.__proPool!;
}

/** Run one statement on a pooled connection, always releasing it. */
export async function execute<T extends Row = Row>(sql: string, binds: Binds = {}) {
  const pool = await getPool();
  const connection = await pool.getConnection();
  try {
    return await connection.execute<T>(sql, binds as oracledb.BindParameters);
  } finally {
    try {
      await connection.close();
    } catch (err) {
      console.error('Error closing connection', err);
    }
  }
}
