/**
 * Better Auth tables (`auth_*` SQL names).
 * Export names stay `user` / `session` / … so Better Auth’s Drizzle adapter can find them.
 * After `npm run auth:schema`, re-apply the `auth_*` table name prefixes if the generator resets them.
 */
import { relations, sql } from 'drizzle-orm';
import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';
import type { UserPermissions } from '#lib/constants/permissions';
import { pagePermission } from './master';

const roleTimestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
};

/** Assignable roles (system + custom). `user.role` stores `slug`. */
export const appRole = pgTable('auth_app_role', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	description: text('description'),
	permissions: jsonb('permissions').$type<UserPermissions | null>(),
	isSystem: boolean('is_system').default(false).notNull(),
	sortOrder: integer('sort_order').notNull().default(0),
	...roleTimestamps
});

/** Junction: roles bound to page permission records. */
export const rolePagePermission = pgTable(
	'auth_role_page_permission',
	{
		roleId: uuid('role_id')
			.notNull()
			.references(() => appRole.id, { onDelete: 'cascade' }),
		permissionId: uuid('permission_id')
			.notNull()
			.references(() => pagePermission.id, { onDelete: 'cascade' })
	},
	(table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]
);

export const user = pgTable(
	'auth_user',
	{
		id: text('id').primaryKey(),
		name: text('name').notNull(),
		email: text('email').notNull().unique(),
		emailVerified: boolean('email_verified').default(false).notNull(),
		image: text('image'),
		twoFactorEnabled: boolean('two_factor_enabled').default(false),
		role: text('role')
			.notNull()
			.default('user')
			.references(() => appRole.slug, { onDelete: 'restrict' }),
		permissions: jsonb('permissions').$type<UserPermissions | null>(),
		tier: text('tier').notNull().default('starter'),
		developerMode: boolean('developer_mode').default(false).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [
		uniqueIndex('auth_user_one_owner_idx')
			.on(table.role)
			.where(sql`${table.role}::text = 'owner'`)
	]
);

export const session = pgTable(
	'auth_session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('auth_session_user_id_idx').on(table.userId)]
);

export const account = pgTable(
	'auth_account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('auth_account_user_id_idx').on(table.userId)]
);

export const verification = pgTable(
	'auth_verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('auth_verification_identifier_idx').on(table.identifier)]
);

export const twoFactor = pgTable(
	'auth_two_factor',
	{
		id: text('id').primaryKey(),
		secret: text('secret').notNull(),
		backupCodes: text('backup_codes').notNull(),
		verified: boolean('verified'),
		failedVerificationCount: integer('failed_verification_count'),
		lockedUntil: timestamp('locked_until'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('auth_two_factor_user_id_idx').on(table.userId)]
);

export const appRoleRelations = relations(appRole, ({ many }) => ({
	users: many(user),
	pagePermissionLinks: many(rolePagePermission)
}));

export const rolePagePermissionRelations = relations(rolePagePermission, ({ one }) => ({
	role: one(appRole, {
		fields: [rolePagePermission.roleId],
		references: [appRole.id]
	}),
	permission: one(pagePermission, {
		fields: [rolePagePermission.permissionId],
		references: [pagePermission.id]
	})
}));

export const pagePermissionRelations = relations(pagePermission, ({ many }) => ({
	roleLinks: many(rolePagePermission)
}));

export const userRelations = relations(user, ({ one, many }) => ({
	roleRef: one(appRole, {
		fields: [user.role],
		references: [appRole.slug]
	}),
	sessions: many(session),
	accounts: many(account),
	twofactors: many(twoFactor)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	})
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
	user: one(user, {
		fields: [twoFactor.userId],
		references: [user.id]
	})
}));
