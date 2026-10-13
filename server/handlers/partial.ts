import { ApiError } from '../errors';

/**
 * Build an UPDATE's SET clause from only the fields actually sent, so an
 * omitted optional field isn't silently overwritten with NULL.
 */
export function partialSet(fields: Record<string, unknown>, binds: Record<string, unknown>) {
  const sets: string[] = [];
  for (const [col, val] of Object.entries(fields)) {
    if (val !== undefined) {
      const bindName = col.toLowerCase();
      sets.push(`${col} = :${bindName}`);
      binds[bindName] = val;
    }
  }
  if (!sets.length) throw new ApiError(400, 'No fields to update');
  return sets.join(', ');
}
