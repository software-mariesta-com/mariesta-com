import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.users.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const res = await fetch('/api/users');
	if (!res.ok) {
		return {
			items: [],
			loadError: 'Failed to load users',
			canCreate: capabilities.users.create,
			canUpdate: capabilities.users.update,
			canDelete: capabilities.users.delete
		};
	}

	return {
		items: await res.json(),
		loadError: null as string | null,
		canCreate: capabilities.users.create,
		canUpdate: capabilities.users.update,
		canDelete: capabilities.users.delete
	};
};
