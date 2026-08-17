import { asc, eq, inArray, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { createRoleSchema, parseRolePermissions, updateRoleSchema } from '#lib/schemas/role';
import { uuidSchema } from '#lib/schemas/common';
import { ensureDefaultPagePermissions } from '#lib/server/ensure-default-page-permissions';
import { ensureDefaultRoles } from '#lib/server/ensure-default-roles';
import { db } from '#lib/server/db';
import { appRole, user } from '#lib/server/db/schema';
import {
	buildUserPermissionsFromRecords,
	getRolePermissionIds,
	permissionIdsFromUserPermissions,
	syncRolePagePermissions
} from '#lib/server/role-permissions';
import { pagePermission } from '#lib/server/db/schema/master';

const PROTECTED_SLUGS = new Set(['owner', 'admin']);

async function findRoleById(id: string) {
	const row = await db.query.appRole.findFirst({
		where: eq(appRole.id, id)
	});
	if (!row) error(404, 'Role not found');
	return row;
}

async function serializeRole(row: typeof appRole.$inferSelect) {
	const permissionIds = await getRolePermissionIds(row.id);
	return {
		...row,
		permissionIds
	};
}

async function resolvePermissionIds(input: {
	permissionIds?: string[];
	permissions?: ReturnType<typeof parseRolePermissions>;
}): Promise<string[] | undefined> {
	if (input.permissionIds !== undefined) {
		return input.permissionIds;
	}

	if (input.permissions !== undefined && input.permissions !== null) {
		await ensureDefaultPagePermissions();
		const all = await db.query.pagePermission.findMany({
			columns: { id: true, section: true, action: true }
		});
		return permissionIdsFromUserPermissions(input.permissions, all);
	}

	return undefined;
}

export const listRoles = query(async () => {
	await ensureDefaultRoles();
	const rows = await db.query.appRole.findMany({
		orderBy: [asc(appRole.sortOrder), asc(appRole.name)]
	});
	return Promise.all(
		rows.map(async (row) => ({
			...row,
			permissionIds: await getRolePermissionIds(row.id)
		}))
	);
});

export const getRole = query(uuidSchema, async (id) => {
	await ensureDefaultRoles();
	const row = await findRoleById(id);
	return serializeRole(row);
});

export const createRole = command(createRoleSchema, async (input) => {
	await ensureDefaultRoles();
	await ensureDefaultPagePermissions();

	if (PROTECTED_SLUGS.has(input.slug)) {
		error(400, 'This slug is reserved for a system role');
	}

	const existing = await db.query.appRole.findFirst({
		where: eq(appRole.slug, input.slug)
	});
	if (existing) error(400, 'A role with this slug already exists');

	const [maxOrder] = await db
		.select({ max: sql<number>`coalesce(max(${appRole.sortOrder}), -1)::int` })
		.from(appRole);

	const permissionIds = await resolvePermissionIds(input);
	let initialPermissions: ReturnType<typeof parseRolePermissions> = null;

	if (permissionIds !== undefined) {
		if (permissionIds.length > 0) {
			const records = await db
				.select({ section: pagePermission.section, action: pagePermission.action })
				.from(pagePermission)
				.where(inArray(pagePermission.id, permissionIds));
			initialPermissions = buildUserPermissionsFromRecords(records);
		} else {
			initialPermissions = buildUserPermissionsFromRecords([]);
		}
	} else if (input.permissions !== undefined) {
		initialPermissions = parseRolePermissions(input.permissions);
	}

	const [row] = await db
		.insert(appRole)
		.values({
			slug: input.slug,
			name: input.name,
			description: input.description ?? null,
			permissions: initialPermissions,
			isSystem: false,
			sortOrder: (maxOrder?.max ?? -1) + 1
		})
		.returning();

	if (!row) error(500, 'Failed to create role');

	if (permissionIds !== undefined) {
		await syncRolePagePermissions(row.id, permissionIds);
	}

	return serializeRole(row);
});

export const updateRole = command(updateRoleSchema, async ({ id, ...input }) => {
	await ensureDefaultRoles();
	await ensureDefaultPagePermissions();

	const existing = await findRoleById(id);

	if (input.slug !== undefined && input.slug !== existing.slug) {
		if (existing.isSystem) {
			error(400, 'Cannot change the slug of a system role');
		}
		if (PROTECTED_SLUGS.has(input.slug)) {
			error(400, 'This slug is reserved for a system role');
		}
		const taken = await db.query.appRole.findFirst({
			where: eq(appRole.slug, input.slug)
		});
		if (taken && taken.id !== id) {
			error(400, 'A role with this slug already exists');
		}
	}

	if (existing.slug === 'owner' && (input.permissions !== undefined || input.permissionIds !== undefined)) {
		error(400, 'Owner permissions cannot be edited');
	}

	const patch: {
		slug?: string;
		name?: string;
		description?: string | null;
		permissions?: ReturnType<typeof parseRolePermissions>;
		updatedAt: Date;
	} = { updatedAt: new Date() };

	if (input.slug !== undefined) patch.slug = input.slug;
	if (input.name !== undefined) patch.name = input.name;
	if (input.description !== undefined) patch.description = input.description ?? null;

	const permissionIds = await resolvePermissionIds(input);

	if (existing.slug === 'owner' || existing.slug === 'admin') {
		if (input.permissions !== undefined) {
			patch.permissions = null;
		}
	} else if (permissionIds !== undefined) {
		const synced = await syncRolePagePermissions(id, permissionIds);
		patch.permissions = synced;
	} else if (input.permissions !== undefined) {
		patch.permissions = parseRolePermissions(input.permissions);
	}

	const [row] = await db.update(appRole).set(patch).where(eq(appRole.id, id)).returning();
	if (!row) error(404, 'Role not found');
	return serializeRole(row);
});

export const deleteRole = command(z.object({ id: uuidSchema }), async ({ id }) => {
	await ensureDefaultRoles();

	const existing = await findRoleById(id);
	if (existing.isSystem) {
		error(400, 'System roles cannot be deleted');
	}

	const [usage] = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(user)
		.where(eq(user.role, existing.slug));

	if ((usage?.count ?? 0) > 0) {
		error(400, 'Cannot delete a role that is assigned to users');
	}

	const [row] = await db.delete(appRole).where(eq(appRole.id, id)).returning();
	if (!row) error(404, 'Role not found');
	return row;
});
