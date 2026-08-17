import { eq } from 'drizzle-orm';
import { buildDefaultPagePermissionSeeds } from '#lib/constants/page-permission-routes';
import { db } from '#lib/server/db';
import { pagePermission } from '#lib/server/db/schema/master';

/** Ensure canonical page permission rows exist. Safe to call repeatedly. */
export async function ensureDefaultPagePermissions(): Promise<void> {
	const seeds = buildDefaultPagePermissionSeeds();

	for (const seed of seeds) {
		const existing = await db.query.pagePermission.findFirst({
			where: eq(pagePermission.slug, seed.slug)
		});

		if (existing) continue;

		await db.insert(pagePermission).values({
			slug: seed.slug,
			name: seed.name,
			routePattern: seed.routePattern,
			section: seed.section,
			action: seed.action,
			description: seed.description,
			sortOrder: seed.sortOrder
		});
	}
}
