import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import {
	createPagePermissionSchema,
	updatePagePermissionSchema
} from '#lib/schemas/page-permission';
import { uuidSchema } from '#lib/schemas/common';
import { ensureDefaultPagePermissions } from '#lib/server/ensure-default-page-permissions';
import { db } from '#lib/server/db';
import { pagePermission } from '#lib/server/db/schema/master';

async function findPagePermissionById(id: string) {
	const row = await db.query.pagePermission.findFirst({
		where: eq(pagePermission.id, id)
	});
	if (!row) error(404, 'Page permission not found');
	return row;
}

export const listPagePermissions = query(async () => {
	await ensureDefaultPagePermissions();
	return db.query.pagePermission.findMany({
		orderBy: [asc(pagePermission.sortOrder), asc(pagePermission.name)]
	});
});

export const getPagePermission = query(uuidSchema, async (id) => {
	await ensureDefaultPagePermissions();
	return findPagePermissionById(id);
});

export const createPagePermission = command(createPagePermissionSchema, async (input) => {
	await ensureDefaultPagePermissions();

	const existing = await db.query.pagePermission.findFirst({
		where: eq(pagePermission.slug, input.slug)
	});
	if (existing) error(400, 'A permission with this slug already exists');

	const [row] = await db
		.insert(pagePermission)
		.values({
			slug: input.slug,
			name: input.name,
			routePattern: input.routePattern,
			section: input.section,
			action: input.action,
			description: input.description ?? null,
			sortOrder: input.sortOrder ?? 0
		})
		.returning();

	return row;
});

export const updatePagePermission = command(updatePagePermissionSchema, async ({ id, ...input }) => {
	await ensureDefaultPagePermissions();

	const existing = await findPagePermissionById(id);

	if (input.slug !== undefined && input.slug !== existing.slug) {
		const taken = await db.query.pagePermission.findFirst({
			where: eq(pagePermission.slug, input.slug)
		});
		if (taken && taken.id !== id) {
			error(400, 'A permission with this slug already exists');
		}
	}

	const patch: {
		slug?: string;
		name?: string;
		routePattern?: string;
		section?: string;
		action?: string;
		description?: string | null;
		sortOrder?: number;
		updatedAt: Date;
	} = { updatedAt: new Date() };

	if (input.slug !== undefined) patch.slug = input.slug;
	if (input.name !== undefined) patch.name = input.name;
	if (input.routePattern !== undefined) patch.routePattern = input.routePattern;
	if (input.section !== undefined) patch.section = input.section;
	if (input.action !== undefined) patch.action = input.action;
	if (input.description !== undefined) patch.description = input.description ?? null;
	if (input.sortOrder !== undefined) patch.sortOrder = input.sortOrder;

	const [row] = await db.update(pagePermission).set(patch).where(eq(pagePermission.id, id)).returning();
	if (!row) error(404, 'Page permission not found');
	return row;
});

export const deletePagePermission = command(z.object({ id: uuidSchema }), async ({ id }) => {
	await ensureDefaultPagePermissions();

	await findPagePermissionById(id);
	const [row] = await db.delete(pagePermission).where(eq(pagePermission.id, id)).returning();
	if (!row) error(404, 'Page permission not found');
	return row;
});
