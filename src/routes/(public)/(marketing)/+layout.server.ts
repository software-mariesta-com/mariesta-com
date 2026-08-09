import { getPublishedBusinesses } from '#lib/server/businesses';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	try {
		const businesses = await getPublishedBusinesses();
		return {
			businesses: JSON.parse(
				JSON.stringify(
					businesses.map((b) => ({
						id: b.id,
						name: b.name,
						category: b.category,
						blurb: b.blurb,
						linkUrl: b.linkUrl
					}))
				)
			)
		};
	} catch (err) {
		console.error('Footer businesses load failed', err);
		return { businesses: [] };
	}
};
