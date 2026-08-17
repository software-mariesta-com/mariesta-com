import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PermissionAction, PermissionSection } from '#lib/constants/permissions';
import { db } from '#lib/server/db';
import { user } from '#lib/server/db/schema';
import { can, canMutate, normalizeRole, type AuthzUser } from '#lib/server/permissions';
import { isElevatedRole, resolveRolePermissions } from '#lib/server/role-permissions';

type UserAuthRow = {
	id: string;
	role: string;
	permissions: AuthzUser['permissions'];
	twoFactorEnabled: boolean | null;
};

/** Merge role-based permissions into an authz user row. */
export async function hydrateAuthzUser(row: UserAuthRow): Promise<AuthzUser> {
	const permissions = isElevatedRole(row.role)
		? null
		: await resolveRolePermissions(row.role);

	return {
		id: row.id,
		role: row.role,
		permissions,
		twoFactorEnabled: row.twoFactorEnabled
	};
}

/** Require a signed-in user for private API routes. Reloads role/permissions from DB. */
export async function requireApiUser(event: RequestEvent): Promise<AuthzUser> {
	if (!event.locals.user) {
		error(401, 'Unauthorized');
	}

	const row = await db.query.user.findFirst({
		where: eq(user.id, event.locals.user.id),
		columns: {
			id: true,
			role: true,
			permissions: true,
			twoFactorEnabled: true
		}
	});

	if (!row) {
		error(401, 'Unauthorized');
	}

	return hydrateAuthzUser(row);
}

/** Require 2FA for create / update / delete mutations. */
export function require2FA(user: AuthzUser) {
	if (!user.twoFactorEnabled) {
		error(403, 'Two-factor authentication is required for this action');
	}
}

/** Require a permission (view does not need 2FA; mutations do). */
export function requirePermission(
	user: AuthzUser,
	section: PermissionSection,
	action: PermissionAction
) {
	if (action === 'view') {
		if (!can(user, section, 'view')) {
			error(403, 'Forbidden');
		}
		return;
	}

	if (!canMutate(user, section, action)) {
		if (!user.twoFactorEnabled) {
			error(403, 'Two-factor authentication is required for this action');
		}
		error(403, 'Forbidden');
	}
}

/** Owner or admin only (e.g. user management). */
export function requireOwnerOrAdmin(user: AuthzUser) {
	const role = normalizeRole(user.role);
	if (role !== 'owner' && role !== 'admin') {
		error(403, 'Forbidden');
	}
}
