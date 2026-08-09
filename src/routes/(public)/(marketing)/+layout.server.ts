import { listPublishedBusinesses } from '#lib/remotes/business.remote';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const businesses = await listPublishedBusinesses();
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
};
