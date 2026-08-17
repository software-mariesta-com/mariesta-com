import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { ADMIN_ROUTES } from '#lib/constants/admin-routes';

export const load: PageServerLoad = async ({ parent, fetch }) => {
	const { capabilities } = await parent();
	if (!capabilities.roles.view) {
		redirect(303, ADMIN_ROUTES.dashboard);
	}

	const [rolesRes, permissionsRes] = await Promise.all([
		fetch('/api/roles'),
		fetch('/api/page-permissions')
	]);

	if (!rolesRes.ok) {
		return {
			items: [],
			pagePermissions: [],
			loadError: 'Failed to load roles',
			canCreate: capabilities.roles.create,
			canUpdate: capabilities.roles.update,
			canDelete: capabilities.roles.delete
		};
	}

	const pagePermissions = permissionsRes.ok ? await permissionsRes.json() : [];

	return {
		items: await rolesRes.json(),
		pagePermissions,
		loadError: null as string | null,
		canCreate: capabilities.roles.create,
		canUpdate: capabilities.roles.update,
		canDelete: capabilities.roles.delete
	};
};
