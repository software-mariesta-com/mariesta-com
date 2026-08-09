/**
 * Drizzle schema barrel.
 * Tables are grouped by SQL prefix in `schema/`:
 * - `auth_*` → `schema/auth.ts`
 * - `master_*` → `schema/master.ts`
 * - `info_*` → `schema/info.ts`
 */
export * from './schema/index';
