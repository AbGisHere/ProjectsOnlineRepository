// Department, Technology, Domain and Category share one shape: { X_ID, X_Name }.
// One factory keeps their five handlers identical.
import { execute } from '../db';
import { ApiError } from '../errors';
import { intParams, ok, route } from '../http';
import { check, isInt, isString, notEmpty } from '../validate';

export function lookupHandlers({ table, label }: { table: string; label: string }) {
  const idCol = `${table}_ID`;
  const nameCol = `${table}_Name`;
  const idKey = idCol.toLowerCase();
  const nameKey = nameCol.toLowerCase();

  return {
    getAll: route(async () => {
      const result = await execute(`SELECT * FROM ${table} ORDER BY ${idCol}`);
      return ok({ data: result.rows });
    }),

    getById: route(async ({ params }) => {
      intParams(params, 'id');
      const result = await execute(`SELECT * FROM ${table} WHERE ${idCol} = :id`, { id: params.id });
      if (!result.rows?.length) throw new ApiError(404, `${label} not found`);
      return ok({ data: result.rows[0] });
    }),

    create: route(async ({ body }) => {
      check(body, { [idKey]: [isInt()], [nameKey]: [isString, notEmpty] });
      const id = body[idKey];
      const name = String(body[nameKey]).trim();
      await execute(`INSERT INTO ${table} (${idCol}, ${nameCol}) VALUES (:${idKey}, :${nameKey})`, { [idKey]: id, [nameKey]: name });
      return ok({ data: { [idKey]: id, [nameKey]: name } }, 201);
    }),

    update: route(async ({ params, body }) => {
      intParams(params, 'id');
      check(body, { [nameKey]: [isString, notEmpty] });
      const name = String(body[nameKey]).trim();
      const result = await execute(`UPDATE ${table} SET ${nameCol} = :${nameKey} WHERE ${idCol} = :id`, { [nameKey]: name, id: params.id });
      if (!result.rowsAffected) throw new ApiError(404, `${label} not found`);
      // Department historically echoed the row; the others returned a message.
      return table === 'Department'
        ? ok({ data: { [idKey]: Number(params.id), [nameKey]: name } })
        : ok({ message: `${label} updated` });
    }),

    remove: route(async ({ params }) => {
      intParams(params, 'id');
      const result = await execute(`DELETE FROM ${table} WHERE ${idCol} = :id`, { id: params.id });
      if (!result.rowsAffected) throw new ApiError(404, `${label} not found`);
      return ok({ message: `${label} deleted` });
    }),
  };
}

export const departments = lookupHandlers({ table: 'Department', label: 'Department' });
export const technologies = lookupHandlers({ table: 'Technology', label: 'Technology' });
export const domains = lookupHandlers({ table: 'Domain', label: 'Domain' });
export const categories = lookupHandlers({ table: 'Category', label: 'Category' });
