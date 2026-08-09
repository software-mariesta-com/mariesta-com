import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createDepartmentSchema, updateDepartmentSchema } from '#lib/schemas/department';
import { db } from '#lib/server/db';
import { department } from '#lib/server/db/schema';

const listDepartmentsInput = z.object({
	facilityId: uuidSchema.optional()
});

export const listDepartments = query(listDepartmentsInput, async ({ facilityId }) => {
	return db.query.department.findMany({
		where: facilityId ? eq(department.facilityId, facilityId) : undefined,
		with: {
			facility: {
				with: { business: true }
			}
		},
		orderBy: [asc(department.name)]
	});
});

export const getDepartment = query(uuidSchema, async (id) => {
	const row = await db.query.department.findFirst({
		where: eq(department.id, id),
		with: {
			facility: {
				with: { business: true }
			}
		}
	});
	if (!row) error(404, 'Department not found');
	return row;
});

export const createDepartment = command(createDepartmentSchema, async (input) => {
	const [row] = await db.insert(department).values(input).returning();
	return row;
});

export const updateDepartment = command(updateDepartmentSchema, async ({ id, ...input }) => {
	const [row] = await db.update(department).set(input).where(eq(department.id, id)).returning();
	if (!row) error(404, 'Department not found');
	return row;
});

export const deleteDepartment = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(department).where(eq(department.id, id)).returning();
	if (!row) error(404, 'Department not found');
	return row;
});
