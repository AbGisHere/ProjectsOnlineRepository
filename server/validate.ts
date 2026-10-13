// Request validation with the same rules and 400 shape the API has always
// used: { success: false, error: 'Validation failed', details: [{ field, message }] }.
import { ApiError } from './errors';

type Rule = (value: unknown, body: Record<string, unknown>) => string | null;
export type Schema = Record<string, Rule[]>;

const INVALID = 'Invalid value';
const present = (v: unknown) => v !== undefined && v !== null && v !== '';
const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));

export const isInt = (opts: { min?: number; max?: number } = {}): Rule => (v) => {
  const s = str(v).trim();
  if (!/^[-+]?\d+$/.test(s)) return INVALID;
  const n = Number(s);
  if (opts.min !== undefined && n < opts.min) return INVALID;
  if (opts.max !== undefined && n > opts.max) return INVALID;
  return null;
};
export const isFloat = (opts: { min?: number; max?: number } = {}): Rule => (v) => {
  const s = str(v).trim();
  if (s === '' || Number.isNaN(Number(s))) return INVALID;
  const n = Number(s);
  if (opts.min !== undefined && n < opts.min) return INVALID;
  if (opts.max !== undefined && n > opts.max) return INVALID;
  return null;
};
export const isString: Rule = (v) => (typeof v === 'string' ? null : INVALID);
export const notEmpty: Rule = (v) => (str(v).trim() ? null : INVALID);
export const isEmail: Rule = (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str(v)) ? null : INVALID);
export const minLength = (n: number): Rule => (v) => (str(v).length >= n ? null : INVALID);
export const isIn = (values: readonly string[]): Rule => (v) => (values.includes(str(v)) ? null : INVALID);
export const isURL: Rule = (v) => (/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(str(v)) ? null : INVALID);
export const isISO8601: Rule = (v) => (/^\d{4}-\d{2}-\d{2}([T ][\d:.]+(Z|[+-]\d{2}:?\d{2})?)?$/.test(str(v)) && !Number.isNaN(Date.parse(str(v))) ? null : INVALID);

/** Skip the remaining rules when the field is absent. */
export const optional: Rule = () => null;
/** Skip the remaining rules unless `cond(body)` holds; `message` replaces the default. */
export const when = (cond: (body: Record<string, unknown>) => boolean, rules: Rule[], message?: string): Rule => (v, body) => {
  if (!cond(body)) return null;
  for (const r of rules) {
    const err = r(v, body);
    if (err) return message ?? err;
  }
  return null;
};

/** Validate `input` against `schema`; throws a 400 ApiError listing every bad field. */
export function check(input: Record<string, unknown>, schema: Schema) {
  const details: { field: string; message: string }[] = [];
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    if (rules[0] === optional && !present(value)) continue;
    for (const rule of rules) {
      if (rule === optional) continue;
      const err = rule(value, input);
      if (err) {
        details.push({ field, message: err });
        break;
      }
    }
  }
  if (details.length) throw new ApiError(400, 'Validation failed', details);
}
