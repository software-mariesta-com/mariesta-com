import { getPublishedBusinesses } from '#lib/server/businesses';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
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
			),
			user: locals.user
				? { name: locals.user.name, email: locals.user.email }
				: null
		};
	} catch (err) {
		console.error('Footer businesses load failed', err);
		return { businesses: [], user: locals.user ? { name: locals.user.name, email: locals.user.email } : null };
	}
};
