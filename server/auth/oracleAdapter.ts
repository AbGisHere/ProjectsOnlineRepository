// Better Auth has no Oracle adapter, so this is one, built on node-oracledb
// with Better Auth's createAdapterFactory. The factory handles id generation,
// field-name mapping and value conversion (booleans -> 0/1, JSON -> text);
// this file only turns its where-clauses into Oracle SQL.
//
// Table and column names come from the `modelName`/`fields` mapping in
// server/auth/index.ts (auth_user, email_verified, …). Oracle upper-cases
// unquoted identifiers, so rows are read back with lower-cased keys.
import { createAdapterFactory, type CustomAdapter } from 'better-auth/adapters';
import { execute } from '../db';

type CleanedWhere = Parameters<CustomAdapter['findOne']>[0]['where'][number];

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
function ident(name: string) {
  if (!IDENT.test(name)) throw new Error(`Unsafe identifier for Oracle adapter: ${name}`);
  return name;
}

function lowerKeys(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[k.toLowerCase()] = v;
  return out;
}

type Binds = Record<string, unknown>;

/** Compile Better Auth where-clauses to an Oracle WHERE fragment + binds. */
function whereSql(where: CleanedWhere[] | undefined, binds: Binds, prefix = 'w') {
  if (!where?.length) return '';
  let sql = '';
  where.forEach((w, i) => {
    const col = ident(w.field);
    const insensitive = w.mode === 'insensitive';
    const lhs = insensitive ? `LOWER(${col})` : col;
    const val = (v: unknown) => (insensitive && typeof v === 'string' ? v.toLowerCase() : v);
    const b = `${prefix}${i}`;
    let clause: string;
    switch (w.operator) {
      case 'in':
      case 'not_in': {
        const list = (Array.isArray(w.value) ? w.value : [w.value]) as unknown[];
        if (!list.length) {
          clause = w.operator === 'in' ? '1 = 0' : '1 = 1';
          break;
        }
        const names = list.map((v, j) => {
          binds[`${b}_${j}`] = val(v);
          return `:${b}_${j}`;
        });
        clause = `${lhs} ${w.operator === 'in' ? 'IN' : 'NOT IN'} (${names.join(', ')})`;
        break;
      }
      case 'contains':
      case 'starts_with':
      case 'ends_with': {
        const s = String(val(w.value)).replace(/[\\%_]/g, (c) => `\\${c}`);
        binds[b] = w.operator === 'contains' ? `%${s}%` : w.operator === 'starts_with' ? `${s}%` : `%${s}`;
        clause = `${lhs} LIKE :${b} ESCAPE '\\'`;
        break;
      }
      case 'ne':
        if (w.value === null) clause = `${col} IS NOT NULL`;
        else {
          binds[b] = val(w.value);
          clause = `(${lhs} <> :${b} OR ${col} IS NULL)`;
        }
        break;
      case 'lt':
      case 'lte':
      case 'gt':
      case 'gte': {
        const op = { lt: '<', lte: '<=', gt: '>', gte: '>=' }[w.operator];
        binds[b] = w.value;
        clause = `${col} ${op} :${b}`;
        break;
      }
      default:
        if (w.value === null) clause = `${col} IS NULL`;
        else {
          binds[b] = val(w.value);
          clause = `${lhs} = :${b}`;
        }
    }
    sql += i === 0 ? clause : ` ${w.connector === 'OR' ? 'OR' : 'AND'} ${clause}`;
  });
  return ` WHERE ${sql}`;
}

function selectList(select?: string[]) {
  return select?.length ? select.map(ident).join(', ') : '*';
}

export const oracleAdapter = () =>
  createAdapterFactory({
    config: {
      adapterId: 'oracle',
      adapterName: 'Oracle (node-oracledb)',
      usePlural: false,
      supportsNumericIds: false,
      supportsJSON: false,
      supportsDates: true,
      supportsBooleans: false, // stored as NUMBER(1); the factory maps 0/1 <-> boolean
      supportsArrays: false,
      transaction: false,
    },
    adapter: () => {
      async function findMany(model: string, where: CleanedWhere[] | undefined, opts: {
        select?: string[]; limit?: number; offset?: number; sortBy?: { field: string; direction: 'asc' | 'desc' };
      } = {}) {
        const binds: Binds = {};
        let sql = `SELECT ${selectList(opts.select)} FROM ${ident(model)}${whereSql(where, binds)}`;
        if (opts.sortBy) sql += ` ORDER BY ${ident(opts.sortBy.field)} ${opts.sortBy.direction === 'desc' ? 'DESC' : 'ASC'}`;
        if (opts.offset) sql += ` OFFSET ${Math.max(0, Math.floor(opts.offset))} ROWS`;
        if (opts.limit !== undefined) sql += ` FETCH NEXT ${Math.max(0, Math.floor(opts.limit))} ROWS ONLY`;
        const r = await execute(sql, binds);
        return (r.rows ?? []).map(lowerKeys);
      }

      async function updateRows(model: string, where: CleanedWhere[], update: Record<string, unknown>) {
        const binds: Binds = {};
        const sets = Object.entries(update).map(([k, v], i) => {
          binds[`u${i}`] = v;
          return `${ident(k)} = :u${i}`;
        });
        if (!sets.length) return 0;
        const r = await execute(`UPDATE ${ident(model)} SET ${sets.join(', ')}${whereSql(where, binds)}`, binds);
        return r.rowsAffected ?? 0;
      }

      return {
        async create({ model, data, select }) {
          const cols = Object.keys(data);
          const binds: Binds = {};
          cols.forEach((c, i) => (binds[`c${i}`] = (data as Record<string, unknown>)[c]));
          await execute(
            `INSERT INTO ${ident(model)} (${cols.map(ident).join(', ')}) VALUES (${cols.map((_, i) => `:c${i}`).join(', ')})`,
            binds
          );
          if (!select?.length) return data;
          return Object.fromEntries(Object.entries(data).filter(([k]) => select.includes(k))) as typeof data;
        },

        async findOne({ model, where, select }) {
          const rows = await findMany(model, where, { select, limit: 1 });
          return (rows[0] ?? null) as never;
        },

        async findMany({ model, where, limit, select, sortBy, offset }) {
          return (await findMany(model, where, { select, limit, sortBy, offset })) as never[];
        },

        async count({ model, where }) {
          const binds: Binds = {};
          const r = await execute<{ N: number }>(`SELECT COUNT(*) AS N FROM ${ident(model)}${whereSql(where, binds)}`, binds);
          return Number(r.rows?.[0]?.N ?? 0);
        },

        async update({ model, where, update }) {
          const n = await updateRows(model, where, update as Record<string, unknown>);
          if (!n) return null;
          const rows = await findMany(model, where, { limit: 1 });
          // The update may have changed a field used in `where`; fall back to the id.
          if (rows[0]) return rows[0] as never;
          const id = (update as Record<string, unknown>).id;
          return id ? ((await findMany(model, [{ field: 'id', operator: 'eq', value: id as string, connector: 'AND', mode: 'sensitive' }], { limit: 1 }))[0] as never) ?? null : null;
        },

        async updateMany({ model, where, update }) {
          return updateRows(model, where, update);
        },

        async delete({ model, where }) {
          const binds: Binds = {};
          await execute(`DELETE FROM ${ident(model)}${whereSql(where, binds)}`, binds);
        },

        async deleteMany({ model, where }) {
          const binds: Binds = {};
          const r = await execute(`DELETE FROM ${ident(model)}${whereSql(where, binds)}`, binds);
          return r.rowsAffected ?? 0;
        },
      };
    },
  });
