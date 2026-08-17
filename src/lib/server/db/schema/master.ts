/**
 * Master / reference tables (`master_*`).
 * Status enums live in `enums.ts`; FK-backed org tables live here.
 */
import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import {
	employmentTypeEnum,
	publishStatusEnum,
	salaryUnitEnum,
	workplaceTypeEnum
} from './enums';

const timestamps = {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull()
};

export const business = pgTable('master_business', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	category: text('category').notNull(),
	blurb: text('blurb').notNull(),
	linkUrl: text('link_url'),
	status: publishStatusEnum('status').notNull().default('draft'),
	...timestamps
});

export const facility = pgTable('master_facility', {
	id: uuid('id').primaryKey().defaultRandom(),
	businessId: uuid('business_id')
		.notNull()
		.references(() => business.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	status: publishStatusEnum('status').notNull().default('draft'),
	...timestamps
});

export const department = pgTable('master_department', {
	id: uuid('id').primaryKey().defaultRandom(),
	facilityId: uuid('facility_id')
		.notNull()
		.references(() => facility.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	status: publishStatusEnum('status').notNull().default('draft'),
	...timestamps
});

export const member = pgTable('master_member', {
	id: uuid('id').primaryKey().defaultRandom(),
	departmentId: uuid('department_id')
		.notNull()
		.references(() => department.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	role: text('role').notNull(),
	photoUrl: text('photo_url'),
	linkUrl: text('link_url'),
	status: publishStatusEnum('status').notNull().default('draft'),
	...timestamps
});

export const partner = pgTable('master_partner', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	logoUrl: text('logo_url'),
	linkUrl: text('link_url'),
	status: publishStatusEnum('status').notNull().default('draft'),
	sortOrder: integer('sort_order').notNull().default(0),
	...timestamps
});

/** Route / section permission records bound to roles via `auth_role_page_permission`. */
export const pagePermission = pgTable('master_page_permission', {
	id: uuid('id').primaryKey().defaultRandom(),
	slug: text('slug').notNull().unique(),
	name: text('name').notNull(),
	routePattern: text('route_pattern').notNull(),
	section: text('section').notNull(),
	action: text('action').notNull(),
	description: text('description'),
	sortOrder: integer('sort_order').notNull().default(0),
	...timestamps
});

export const career = pgTable('master_career', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description').notNull(),
	location: text('location').notNull(),
	locationCountry: text('location_country').notNull().default('MM'),
	employmentType: employmentTypeEnum('employment_type').notNull().default('full_time'),
	workplaceType: workplaceTypeEnum('workplace_type').notNull().default('onsite'),
	applyUrl: text('apply_url'),
	applyEmail: text('apply_email'),
	businessId: uuid('business_id').references(() => business.id, { onDelete: 'set null' }),
	departmentLabel: text('department_label'),
	salaryMin: integer('salary_min'),
	salaryMax: integer('salary_max'),
	salaryCurrency: text('salary_currency'),
	salaryUnit: salaryUnitEnum('salary_unit'),
	expiresAt: timestamp('expires_at', { withTimezone: true }),
	status: publishStatusEnum('status').notNull().default('draft'),
	sortOrder: integer('sort_order').notNull().default(0),
	...timestamps
});

export const businessRelations = relations(business, ({ many }) => ({
	facilities: many(facility),
	careers: many(career)
}));

export const facilityRelations = relations(facility, ({ one, many }) => ({
	business: one(business, {
		fields: [facility.businessId],
		references: [business.id]
	}),
	departments: many(department)
}));

export const departmentRelations = relations(department, ({ one, many }) => ({
	facility: one(facility, {
		fields: [department.facilityId],
		references: [facility.id]
	}),
	members: many(member)
}));

export const memberRelations = relations(member, ({ one }) => ({
	department: one(department, {
		fields: [member.departmentId],
		references: [department.id]
	})
}));

export const careerRelations = relations(career, ({ one }) => ({
	business: one(business, {
		fields: [career.businessId],
		references: [business.id]
	})
}));
