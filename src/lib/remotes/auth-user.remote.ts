import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { command, query } from '$app/server';
import { hashPassword } from 'better-auth/crypto';
import { generateId } from '@better-auth/core/utils/id';
import { z } from 'zod';
import { ORIGIN } from '$app/env/private';
import { AUTH_ROUTES } from '#lib/constants/auth-routes';
import {
	inviteUserSchema,
	parsePermissions,
	updateAuthUserSchema
} from '#lib/schemas/auth-user';
import { auth } from '#lib/server/auth';
import { db } from '#lib/server/db';
import { account, user } from '#lib/server/db/schema';
import { ensureOwnerExists } from '#lib/server/ensure-owner';
import { normalizeRole } from '#lib/server/permissions';

const userListColumns = {
	id: true,
	name: true,
	email: true,
	role: true,
	permissions: true,
	twoFactorEnabled: true,
	emailVerified: true,
	createdAt: true,
	updatedAt: true
} as const;

async function findAuthUserById(id: string) {
	const row = await db.query.user.findFirst({
		where: eq(user.id, id),
		columns: userListColumns
	});
	if (!row) error(404, 'User not found');
	return row;
}

export const listAuthUsers = query(async () => {
	await ensureOwnerExists();
	return db.query.user.findMany({
		orderBy: [asc(user.createdAt)],
		columns: userListColumns
	});
});

export const getAuthUser = query(z.object({ id: z.string().min(1) }), async ({ id }) => {
	return findAuthUserById(id);
});

export const inviteAuthUser = command(inviteUserSchema, async (input) => {
	await ensureOwnerExists();

	const email = input.email.toLowerCase();
	const existing = await db.query.user.findFirst({
		where: eq(user.email, email)
	});
	if (existing) error(400, 'A user with this email already exists');

	const id = generateId();
	const now = new Date();
	const hashed = await hashPassword(generateId(32));
	const permissions = input.role === 'member' ? parsePermissions(input.permissions) : null;

	await db.insert(user).values({
		id,
		name: input.name,
		email,
		emailVerified: true,
		role: input.role,
		permissions,
		twoFactorEnabled: false,
		createdAt: now,
		updatedAt: now
	});

	await db.insert(account).values({
		id: generateId(),
		accountId: id,
		providerId: 'credential',
		userId: id,
		password: hashed,
		createdAt: now,
		updatedAt: now
	});

	await auth.api.requestPasswordReset({
		body: {
			email,
			redirectTo: `${ORIGIN}${AUTH_ROUTES.resetPassword}`
		}
	});

	return findAuthUserById(id);
});

export const updateAuthUser = command(updateAuthUserSchema, async ({ id, ...input }) => {
	await ensureOwnerExists();

	const existing = await findAuthUserById(id);
	const currentRole = normalizeRole(existing.role);

	if (currentRole === 'owner') {
		if (input.role) {
			error(400, 'Cannot change the owner role');
		}
	}

	const patch: {
		name?: string;
		role?: 'admin' | 'member';
		permissions?: ReturnType<typeof parsePermissions> | null;
		updatedAt: Date;
	} = { updatedAt: new Date() };

	if (input.name !== undefined) patch.name = input.name;

	if (input.role !== undefined) {
		if (currentRole === 'owner') {
			error(400, 'Cannot change the owner role');
		}
		patch.role = input.role;
		patch.permissions =
			input.role === 'member'
				? parsePermissions(input.permissions ?? existing.permissions)
				: null;
	} else if (input.permissions !== undefined && currentRole === 'member') {
		patch.permissions = parsePermissions(input.permissions);
	}

	const [row] = await db.update(user).set(patch).where(eq(user.id, id)).returning({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		permissions: user.permissions,
		twoFactorEnabled: user.twoFactorEnabled,
		emailVerified: user.emailVerified,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt
	});

	if (!row) error(404, 'User not found');
	return row;
});

export const deleteAuthUser = command(z.object({ id: z.string().min(1) }), async ({ id }) => {
	await ensureOwnerExists();

	const existing = await findAuthUserById(id);
	if (normalizeRole(existing.role) === 'owner') {
		error(400, 'Cannot delete the owner');
	}

	const [row] = await db.delete(user).where(eq(user.id, id)).returning({ id: user.id });
	if (!row) error(404, 'User not found');
	return row;
});

export const resendAuthUserInvite = command(z.object({ id: z.string().min(1) }), async ({ id }) => {
	const existing = await findAuthUserById(id);
	await auth.api.requestPasswordReset({
		body: {
			email: existing.email,
			redirectTo: `${ORIGIN}${AUTH_ROUTES.resetPassword}`
		}
	});
	return { ok: true as const };
});

/** Promote another user to owner and demote the current owner to admin. */
export const transferOwnership = command(
	z.object({
		fromOwnerId: z.string().min(1),
		toUserId: z.string().min(1)
	}),
	async ({ fromOwnerId, toUserId }) => {
		if (fromOwnerId === toUserId) error(400, 'Already the owner');

		const from = await findAuthUserById(fromOwnerId);
		const to = await findAuthUserById(toUserId);

		if (normalizeRole(from.role) !== 'owner') {
			error(403, 'Only the owner can transfer ownership');
		}

		await db.transaction(async (tx) => {
			await tx
				.update(user)
				.set({ role: 'admin', permissions: null, updatedAt: new Date() })
				.where(eq(user.id, fromOwnerId));
			await tx
				.update(user)
				.set({ role: 'owner', permissions: null, updatedAt: new Date() })
				.where(eq(user.id, toUserId));
		});

		return { ownerId: to.id };
	}
);
