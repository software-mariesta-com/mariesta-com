import { asc, eq, sql } from 'drizzle-orm';
import { ensureDefaultRoles } from '#lib/server/ensure-default-roles';
import { db } from '#lib/server/db';
import { user } from '#lib/server/db/schema';

/**
 * Ensure exactly one owner exists: promote the oldest user if none.
 * Safe to call repeatedly (no-op when an owner already exists).
 */
export async function ensureOwnerExists(): Promise<{ id: string; email: string } | null> {
	await ensureDefaultRoles();
	const [existingOwner] = await db
		.select({ id: user.id, email: user.email })
		.from(user)
		.where(eq(user.role, 'owner'))
		.limit(1);

	if (existingOwner) return existingOwner;

	const [oldest] = await db
		.select({ id: user.id, email: user.email })
		.from(user)
		.orderBy(asc(user.createdAt))
		.limit(1);

	if (!oldest) return null;

	await db.update(user).set({ role: 'owner', permissions: null }).where(eq(user.id, oldest.id));

	return oldest;
}

/** Count owners (should be 0 or 1). */
export async function countOwners(): Promise<number> {
	const [row] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(user)
		.where(eq(user.role, 'owner'));
	return row?.count ?? 0;
}
