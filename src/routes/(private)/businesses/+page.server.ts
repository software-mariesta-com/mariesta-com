import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.businesses.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const res = await fetch('/api/businesses');
	if (!res.ok) {
		return {
			items: [],
			loadError: 'Failed to load businesses',
			canCreate: capabilities.businesses.create,
			canUpdate: capabilities.businesses.update,
			canDelete: capabilities.businesses.delete
		};
	}

	return {
		items: await res.json(),
		loadError: null as string | null,
		canCreate: capabilities.businesses.create,
		canUpdate: capabilities.businesses.update,
		canDelete: capabilities.businesses.delete
	};
};
