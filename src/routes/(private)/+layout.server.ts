import { eq } from 'drizzle-orm';
import { loginRedirectUrl } from '#lib/constants/auth-routes';
import { db } from '#lib/server/db';
import { user as userTable } from '#lib/server/db/schema';
import { ensureOwnerExists } from '#lib/server/ensure-owner';
import { buildCapabilities, normalizeRole, type AuthzUser } from '#lib/server/permissions';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		redirect(303, loginRedirectUrl(url.pathname));
	}

	await ensureOwnerExists();

	const row = await db.query.user.findFirst({
		where: eq(userTable.id, locals.user.id),
		columns: {
			id: true,
			role: true,
			permissions: true,
			twoFactorEnabled: true
		}
	});

	const authzUser: AuthzUser = {
		id: locals.user.id,
		role: row?.role ?? 'member',
		permissions: row?.permissions ?? null,
		twoFactorEnabled: row?.twoFactorEnabled ?? false
	};

	const capabilities = buildCapabilities(authzUser);
	const twoFactorEnabled = Boolean(authzUser.twoFactorEnabled);

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			role: normalizeRole(authzUser.role),
			twoFactorEnabled
		},
		session: locals.session,
		capabilities,
		twoFactorEnabled
	};
};
