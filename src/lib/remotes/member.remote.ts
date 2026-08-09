import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { z } from 'zod';
import { uuidSchema } from '#lib/schemas/common';
import { createMemberSchema, updateMemberSchema } from '#lib/schemas/member';
import { db } from '#lib/server/db';
import { member } from '#lib/server/db/schema';
import { toMediaUrl } from '#lib/server/storage/tigris';

function withMediaUrl<T extends { photoUrl: string | null }>(row: T): T {
	return { ...row, photoUrl: toMediaUrl(row.photoUrl) };
}

const listMembersInput = z.object({
	departmentId: uuidSchema.optional()
});

export const listMembers = query(listMembersInput, async ({ departmentId }) => {
	const rows = await db.query.member.findMany({
		where: departmentId ? eq(member.departmentId, departmentId) : undefined,
		with: {
			department: {
				with: {
					facility: {
						with: { business: true }
					}
				}
			}
		},
		orderBy: [asc(member.name)]
	});
	return rows.map(withMediaUrl);
});

export const listPublishedMembers = query(async () => {
	const rows = await db.query.member.findMany({
		where: eq(member.status, 'published'),
		orderBy: [asc(member.createdAt)]
	});
	return rows.map(withMediaUrl);
});

export const getMember = query(uuidSchema, async (id) => {
	const row = await db.query.member.findFirst({
		where: eq(member.id, id),
		with: {
			department: {
				with: {
					facility: {
						with: { business: true }
					}
				}
			}
		}
	});
	if (!row) error(404, 'Member not found');
	return withMediaUrl(row);
});

export const createMember = command(createMemberSchema, async (input) => {
	const [row] = await db
		.insert(member)
		.values({
			...input,
			photoUrl: input.photoUrl ?? null,
			linkUrl: input.linkUrl ?? null
		})
		.returning();
	return withMediaUrl(row);
});

export const updateMember = command(updateMemberSchema, async ({ id, ...input }) => {
	const [row] = await db.update(member).set(input).where(eq(member.id, id)).returning();
	if (!row) error(404, 'Member not found');
	return withMediaUrl(row);
});

export const deleteMember = command(z.object({ id: uuidSchema }), async ({ id }) => {
	const [row] = await db.delete(member).where(eq(member.id, id)).returning();
	if (!row) error(404, 'Member not found');
	return row;
});
