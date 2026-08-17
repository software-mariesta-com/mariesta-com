import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.page_permissions.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const res = await fetch('/api/page-permissions');
	if (!res.ok) {
		return {
			items: [],
			loadError: 'Failed to load page permissions',
			canCreate: capabilities.page_permissions.create,
			canUpdate: capabilities.page_permissions.update,
			canDelete: capabilities.page_permissions.delete
		};
	}

	return {
		items: await res.json(),
		loadError: null as string | null,
		canCreate: capabilities.page_permissions.create,
		canUpdate: capabilities.page_permissions.update,
		canDelete: capabilities.page_permissions.delete
	};
};
