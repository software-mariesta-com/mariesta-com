import { asc, eq } from 'drizzle-orm';
import { ttlGet, ttlInvalidate, ttlSet } from '#lib/server/cache/ttl';
import { db } from '#lib/server/db';
import { business } from '#lib/server/db/schema';

const PUBLISHED_BUSINESSES_CACHE_KEY = 'published-businesses';
const PUBLISHED_BUSINESSES_TTL_MS = 60_000;

export async function getPublishedBusinesses() {
	const cached = ttlGet<Awaited<ReturnType<typeof fetchPublishedBusinesses>>>(
		PUBLISHED_BUSINESSES_CACHE_KEY
	);
	if (cached) return cached;

	const rows = await fetchPublishedBusinesses();
	ttlSet(PUBLISHED_BUSINESSES_CACHE_KEY, rows, PUBLISHED_BUSINESSES_TTL_MS);
	return rows;
}

async function fetchPublishedBusinesses() {
	return db.query.business.findMany({
		where: eq(business.status, 'published'),
		orderBy: [asc(business.name)]
	});
}

export function invalidatePublishedBusinessesCache() {
	ttlInvalidate(PUBLISHED_BUSINESSES_CACHE_KEY);
}
