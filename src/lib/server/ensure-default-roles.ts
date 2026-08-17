import { asc, eq } from 'drizzle-orm';
import {
	defaultEmployeePermissions,
	defaultUserPermissions,
	type UserPermissions
} from '#lib/constants/permissions';
import { db } from '#lib/server/db';
import { appRole, rolePagePermission } from '#lib/server/db/schema';
import { ensureDefaultPagePermissions } from '#lib/server/ensure-default-page-permissions';
import {
	permissionIdsFromUserPermissions,
	syncRolePagePermissions
} from '#lib/server/role-permissions';

const SYSTEM_ROLES = [
	{
		slug: 'owner',
		name: 'Owner',
		description: 'Exactly one account with full access.',
		permissions: null,
		sortOrder: 0
	},
	{
		slug: 'admin',
		name: 'Admin',
		description: 'Full access including user management.',
		permissions: null,
		sortOrder: 1
	},
	{
		slug: 'user',
		name: 'User',
		description: 'Default role for regular accounts (non-employee).',
		permissions: defaultUserPermissions(),
		sortOrder: 2
	},
	{
		slug: 'member',
		name: 'Employee',
		description: 'Internal staff with access to employee sections.',
		permissions: defaultEmployeePermissions(),
		sortOrder: 3
	}
] as const;

async function seedRolePagePermissions(
	roleId: string,
	permissions: UserPermissions
): Promise<void> {
	const linkCount = await db.query.rolePagePermission.findMany({
		where: eq(rolePagePermission.roleId, roleId),
		columns: { permissionId: true }
	});
	if (linkCount.length > 0) return;

	const all = await db.query.pagePermission.findMany({
		columns: { id: true, section: true, action: true }
	});
	const permissionIds = permissionIdsFromUserPermissions(permissions, all);
	await syncRolePagePermissions(roleId, permissionIds);
}

/** Ensure system roles exist. Safe to call repeatedly. */
export async function ensureDefaultRoles(): Promise<void> {
	await ensureDefaultPagePermissions();

	for (const role of SYSTEM_ROLES) {
		const existing = await db.query.appRole.findFirst({
			where: eq(appRole.slug, role.slug)
		});

		if (!existing) {
			const [row] = await db
				.insert(appRole)
				.values({
					slug: role.slug,
					name: role.name,
					description: role.description,
					permissions: role.permissions,
					isSystem: true,
					sortOrder: role.sortOrder
				})
				.returning();

			if (row && role.permissions) {
				await seedRolePagePermissions(row.id, role.permissions);
			}
			continue;
		}

		await db
			.update(appRole)
			.set({
				name: role.name,
				description: role.description,
				sortOrder: role.sortOrder,
				updatedAt: new Date()
			})
			.where(eq(appRole.id, existing.id));

		if (role.permissions) {
			await seedRolePagePermissions(existing.id, role.permissions);
		}
	}
}

export async function listSystemRoleSlugs(): Promise<string[]> {
	await ensureDefaultRoles();
	const rows = await db
		.select({ slug: appRole.slug })
		.from(appRole)
		.where(eq(appRole.isSystem, true))
		.orderBy(asc(appRole.sortOrder));
	return rows.map((row) => row.slug);
}
