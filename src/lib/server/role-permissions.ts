import { eq, inArray } from 'drizzle-orm';
import {
	PERMISSION_ACTIONS,
	PERMISSION_SECTIONS,
	defaultUserPermissions,
	emptySectionPermissions,
	fullPermissions,
	type PermissionAction,
	type PermissionSection,
	type UserPermissions
} from '#lib/constants/permissions';
import { db } from '#lib/server/db';
import { appRole, rolePagePermission } from '#lib/server/db/schema';
import { pagePermission } from '#lib/server/db/schema/master';

export function isElevatedRole(role: string | null | undefined): boolean {
	return role === 'owner' || role === 'admin';
}

type PermissionRecord = {
	section: string;
	action: string;
};

export function buildUserPermissionsFromRecords(records: PermissionRecord[]): UserPermissions {
	const permissions: UserPermissions = {};
	for (const section of PERMISSION_SECTIONS) {
		permissions[section] = emptySectionPermissions();
	}
	permissions.profile = { view: true, create: false, update: false, delete: false };

	for (const record of records) {
		const section = record.section as PermissionSection;
		const action = record.action as PermissionAction;
		if (!PERMISSION_SECTIONS.includes(section)) continue;
		if (!PERMISSION_ACTIONS.includes(action)) continue;
		const current = permissions[section] ?? emptySectionPermissions();
		permissions[section] = { ...current, [action]: true };
	}

	return permissions;
}

export function permissionIdsFromUserPermissions(
	permissions: UserPermissions,
	allPermissions: Array<{ id: string; section: string; action: string }>
): string[] {
	const ids: string[] = [];
	for (const perm of allPermissions) {
		const sectionPerms = permissions[perm.section as PermissionSection];
		if (sectionPerms?.[perm.action as PermissionAction]) {
			ids.push(perm.id);
		}
	}
	return ids;
}

export async function getRolePermissionRecords(roleSlug: string): Promise<PermissionRecord[]> {
	const role = await db.query.appRole.findFirst({
		where: eq(appRole.slug, roleSlug),
		with: {
			pagePermissionLinks: {
				with: {
					permission: {
						columns: {
							section: true,
							action: true
						}
					}
				}
			}
		}
	});

	if (!role) return [];

	return role.pagePermissionLinks.map((link) => link.permission);
}

export async function resolveRolePermissions(roleSlug: string): Promise<UserPermissions> {
	if (isElevatedRole(roleSlug)) {
		return fullPermissions();
	}

	const role = await db.query.appRole.findFirst({
		where: eq(appRole.slug, roleSlug),
		columns: {
			permissions: true
		},
		with: {
			pagePermissionLinks: {
				with: {
					permission: {
						columns: {
							section: true,
							action: true
						}
					}
				}
			}
		}
	});

	if (!role) {
		return defaultUserPermissions();
	}

	if (role.pagePermissionLinks.length > 0) {
		return buildUserPermissionsFromRecords(
			role.pagePermissionLinks.map((link) => link.permission)
		);
	}

	if (role.permissions) {
		return { ...defaultUserPermissions(), ...role.permissions };
	}

	return defaultUserPermissions();
}

export async function syncRolePagePermissions(
	roleId: string,
	permissionIds: string[]
): Promise<UserPermissions> {
	const uniqueIds = [...new Set(permissionIds)];

	if (uniqueIds.length > 0) {
		const rows = await db
			.select({ id: pagePermission.id })
			.from(pagePermission)
			.where(inArray(pagePermission.id, uniqueIds));
		if (rows.length !== uniqueIds.length) {
			throw new Error('One or more permission ids are invalid');
		}
	}

	await db.delete(rolePagePermission).where(eq(rolePagePermission.roleId, roleId));

	if (uniqueIds.length > 0) {
		await db.insert(rolePagePermission).values(
			uniqueIds.map((permissionId) => ({
				roleId,
				permissionId
			}))
		);
	}

	const records = await db
		.select({
			section: pagePermission.section,
			action: pagePermission.action
		})
		.from(rolePagePermission)
		.innerJoin(pagePermission, eq(rolePagePermission.permissionId, pagePermission.id))
		.where(eq(rolePagePermission.roleId, roleId));

	const permissions = buildUserPermissionsFromRecords(records);

	await db
		.update(appRole)
		.set({ permissions, updatedAt: new Date() })
		.where(eq(appRole.id, roleId));

	return permissions;
}

export async function getRolePermissionIds(roleId: string): Promise<string[]> {
	const rows = await db
		.select({ permissionId: rolePagePermission.permissionId })
		.from(rolePagePermission)
		.where(eq(rolePagePermission.roleId, roleId));
	return rows.map((row) => row.permissionId);
}
