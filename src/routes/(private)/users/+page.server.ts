import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.users.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [usersRes, rolesRes] = await Promise.all([fetch('/api/users'), fetch('/api/user-roles')]);

	if (!usersRes.ok) {
		return {
			items: [],
			roles: [],
			loadError: 'Failed to load users',
			canCreate: capabilities.users.create,
			canUpdate: capabilities.users.update,
			canDelete: capabilities.users.delete
		};
	}

	const roles = rolesRes.ok ? await rolesRes.json() : [];

	return {
		items: await usersRes.json(),
		roles,
		loadError: null as string | null,
		canCreate: capabilities.users.create,
		canUpdate: capabilities.users.update,
		canDelete: capabilities.users.delete
	};
};
