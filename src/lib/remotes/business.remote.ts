import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createBusinessSchema, updateBusinessSchema } from '#lib/schemas/business';
import { db } from '#lib/server/db';
import { business } from '#lib/server/db/schema';

export const listBusinesses = query(async () => {
	return db.query.business.findMany({
		orderBy: [asc(business.name)]
	});
});

export const listPublishedBusinesses = query(async () => {
	return db.query.business.findMany({
		where: eq(business.status, 'published'),
		orderBy: [asc(business.name)]
	});
});

export const getBusiness = query(uuidSchema, async (id) => {
	const row = await db.query.business.findFirst({
		where: eq(business.id, id)
	});
	if (!row) error(404, 'Business not found');
	return row;
});

export const createBusiness = command(createBusinessSchema, async (input) => {
	const [row] = await db
		.insert(business)
		.values({
			...input,
			linkUrl: input.linkUrl ?? null
		})
		.returning();
	return row;
});

export const updateBusiness = command(updateBusinessSchema, async ({ id, ...input }) => {
	const [row] = await db.update(business).set(input).where(eq(business.id, id)).returning();
	if (!row) error(404, 'Business not found');
	return row;
});

export const deleteBusiness = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(business).where(eq(business.id, id)).returning();
	if (!row) error(404, 'Business not found');
	return row;
});
