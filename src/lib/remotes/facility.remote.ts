import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createFacilitySchema, updateFacilitySchema } from '#lib/schemas/facility';
import { db } from '#lib/server/db';
import { facility } from '#lib/server/db/schema';

const listFacilitiesInput = z.object({
	businessId: uuidSchema.optional()
});

export const listFacilities = query(listFacilitiesInput, async ({ businessId }) => {
	return db.query.facility.findMany({
		where: businessId ? eq(facility.businessId, businessId) : undefined,
		with: { business: true },
		orderBy: [asc(facility.name)]
	});
});

export const getFacility = query(uuidSchema, async (id) => {
	const row = await db.query.facility.findFirst({
		where: eq(facility.id, id),
		with: { business: true }
	});
	if (!row) error(404, 'Facility not found');
	return row;
});

export const createFacility = command(createFacilitySchema, async (input) => {
	const [row] = await db.insert(facility).values(input).returning();
	return row;
});

export const updateFacility = command(updateFacilitySchema, async ({ id, ...input }) => {
	const [row] = await db.update(facility).set(input).where(eq(facility.id, id)).returning();
	if (!row) error(404, 'Facility not found');
	return row;
});

export const deleteFacility = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(facility).where(eq(facility.id, id)).returning();
	if (!row) error(404, 'Facility not found');
	return row;
});
