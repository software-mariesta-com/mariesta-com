import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.partners.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const res = await fetch('/api/partners');
	if (!res.ok) {
		return {
			items: [],
			loadError: 'Failed to load partners',
			canCreate: capabilities.partners.create,
			canUpdate: capabilities.partners.update,
			canDelete: capabilities.partners.delete
		};
	}

	return {
		items: await res.json(),
		loadError: null as string | null,
		canCreate: capabilities.partners.create,
		canUpdate: capabilities.partners.update,
		canDelete: capabilities.partners.delete
	};
};
