// Postgres connection pool shared by every API route (and by Better Auth).
// One pool per server instance: a long-running `next start` keeps it for the
// process lifetime, and on Vercel each warm function instance reuses it.
import { Pool, types } from 'pg';
import { poolConfig } from './dbConfig';

// Return numbers as numbers and dates as 'YYYY-MM-DD', the same JSON the API
// has always sent: NUMERIC (scores, averages) and BIGINT (COUNT) would
// otherwise arrive as strings, and DATE as a timezone-shifted timestamp.
types.setTypeParser(types.builtins.NUMERIC, (v) => parseFloat(v));
types.setTypeParser(types.builtins.INT8, (v) => parseInt(v, 10));
types.setTypeParser(types.builtins.DATE, (v) => v);

type Binds = Record<string, unknown>;
export type Row = Record<string, unknown>;

const g = globalThis as unknown as { __proPool?: Pool };

export function getPool(): Pool {
  if (!g.__proPool) {
    g.__proPool = new Pool({
      ...poolConfig(),
      // Small pool: serverless instances each hold their own.
      max: Number(process.env.DB_POOL_MAX) || 4,
      idleTimeoutMillis: 60_000,
    });
    g.__proPool.on('error', (err) => console.error('Idle Postgres client error', err));
  }
  return g.__proPool;
}

/**
 * Rewrite named binds (`:id`) to Postgres placeholders (`$1`). Quoted
 * strings and `::type` casts are left alone; repeated names share a slot.
 */
function toPositional(sql: string, binds: Binds) {
  const values: unknown[] = [];
  const slots = new Map<string, number>();
  let out = '';
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (c === "'" || c === '"') {
      const end = sql.indexOf(c, i + 1);
      const stop = end === -1 ? sql.length : end + 1;
      out += sql.slice(i, stop);
      i = stop - 1;
    } else if (c === ':' && sql[i + 1] === ':') {
      out += '::';
      i++;
    } else if (c === ':' && /[A-Za-z_]/.test(sql[i + 1] ?? '')) {
      const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(sql.slice(i + 1))![0];
      if (!(name in binds)) throw new Error(`Missing bind value for :${name}`);
      if (!slots.has(name)) {
        values.push(binds[name]);
        slots.set(name, values.length);
      }
      out += `$${slots.get(name)}`;
      i += name.length;
    } else {
      out += c;
    }
  }
  return { text: out, values };
}

/** Upper-case column names, as the API returned them on Oracle (STUDENT_ID, …). */
function upperKeys(row: Row): Row {
  const out: Row = {};
  for (const [k, v] of Object.entries(row)) out[k.toUpperCase()] = v;
  return out;
}

/** Run one statement on a pooled connection. Each call commits on its own. */
export async function execute<T extends Row = Row>(sql: string, binds: Binds = {}) {
  const { text, values } = toPositional(sql, binds);
  const result = await getPool().query(text, values);
  return { rows: result.rows.map(upperKeys) as T[], rowsAffected: result.rowCount ?? 0 };
}
