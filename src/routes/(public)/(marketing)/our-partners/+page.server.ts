import { listPublishedPartners } from '#lib/remotes/partner.remote';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const partners = await listPublishedPartners();
	return {
		items: JSON.parse(
			JSON.stringify(
				partners.map((p) => ({
					id: p.id,
					name: p.name,
					logoUrl: p.logoUrl,
					linkUrl: p.linkUrl
				}))
			)
		) as { id: string; name: string; logoUrl: string | null; linkUrl: string | null }[],
		loadError: null as string | null
	};
};
