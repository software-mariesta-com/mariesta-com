import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createPartnerSchema, updatePartnerSchema } from '#lib/schemas/partner';
import { db } from '#lib/server/db';
import { partner } from '#lib/server/db/schema';
import { toMediaUrl } from '#lib/server/storage/tigris';

function withMediaUrl<T extends { logoUrl: string | null }>(row: T): T {
	return { ...row, logoUrl: toMediaUrl(row.logoUrl) };
}

export const listPartners = query(async () => {
	const rows = await db.query.partner.findMany({
		orderBy: [asc(partner.sortOrder), asc(partner.name)]
	});
	return rows.map(withMediaUrl);
});

export const listPublishedPartners = query(async () => {
	const rows = await db.query.partner.findMany({
		where: eq(partner.status, 'published'),
		orderBy: [asc(partner.sortOrder), asc(partner.name)]
	});
	return rows.map(withMediaUrl);
});

export const getPartner = query(uuidSchema, async (id) => {
	const row = await db.query.partner.findFirst({
		where: eq(partner.id, id)
	});
	if (!row) error(404, 'Partner not found');
	return withMediaUrl(row);
});

export const createPartner = command(createPartnerSchema, async (input) => {
	const [row] = await db
		.insert(partner)
		.values({
			...input,
			logoUrl: input.logoUrl ?? null,
			linkUrl: input.linkUrl ?? null
		})
		.returning();
	return withMediaUrl(row);
});

export const updatePartner = command(updatePartnerSchema, async ({ id, ...input }) => {
	const [row] = await db.update(partner).set(input).where(eq(partner.id, id)).returning();
	if (!row) error(404, 'Partner not found');
	return withMediaUrl(row);
});

export const deletePartner = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(partner).where(eq(partner.id, id)).returning();
	if (!row) error(404, 'Partner not found');
	return row;
});
