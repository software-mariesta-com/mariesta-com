import { and, asc, eq, gt, isNull, or } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createCareerSchema, updateCareerSchema } from '#lib/schemas/career';
import { db } from '#lib/server/db';
import { career } from '#lib/server/db/schema';

export const listCareers = query(async () => {
	return db.query.career.findMany({
		with: { business: true },
		orderBy: [asc(career.sortOrder), asc(career.title)]
	});
});

export const listPublishedCareers = query(async () => {
	const now = new Date();
	return db.query.career.findMany({
		where: and(
			eq(career.status, 'published'),
			or(isNull(career.expiresAt), gt(career.expiresAt, now))
		),
		with: { business: { columns: { id: true, name: true } } },
		orderBy: [asc(career.sortOrder), asc(career.title)]
	});
});

export const getCareer = query(uuidSchema, async (id) => {
	const row = await db.query.career.findFirst({
		where: eq(career.id, id),
		with: { business: true }
	});
	if (!row) error(404, 'Career not found');
	return row;
});

export const getPublishedCareerBySlug = query(z.string().trim().min(1), async (slug) => {
	const now = new Date();
	const row = await db.query.career.findFirst({
		where: and(
			eq(career.slug, slug),
			eq(career.status, 'published'),
			or(isNull(career.expiresAt), gt(career.expiresAt, now))
		),
		with: { business: { columns: { id: true, name: true } } }
	});
	if (!row) error(404, 'Career not found');
	return row;
});

export const createCareer = command(createCareerSchema, async (input) => {
	try {
		const [row] = await db
			.insert(career)
			.values({
				...input,
				applyUrl: input.applyUrl ?? null,
				applyEmail: input.applyEmail ?? null,
				businessId: input.businessId ?? null,
				departmentLabel: input.departmentLabel ?? null,
				salaryMin: input.salaryMin ?? null,
				salaryMax: input.salaryMax ?? null,
				salaryCurrency: input.salaryCurrency ?? null,
				salaryUnit: input.salaryUnit ?? null,
				expiresAt: input.expiresAt ?? null
			})
			.returning();
		return row;
	} catch (err) {
		if (isUniqueViolation(err)) error(409, 'Slug already exists');
		throw err;
	}
});

export const updateCareer = command(updateCareerSchema, async ({ id, ...input }) => {
	try {
		const [row] = await db.update(career).set(input).where(eq(career.id, id)).returning();
		if (!row) error(404, 'Career not found');
		return row;
	} catch (err) {
		if (isUniqueViolation(err)) error(409, 'Slug already exists');
		throw err;
	}
});

export const deleteCareer = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(career).where(eq(career.id, id)).returning();
	if (!row) error(404, 'Career not found');
	return row;
});

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code?: string }).code === '23505'
	);
}
