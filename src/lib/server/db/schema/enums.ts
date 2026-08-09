import { pgEnum } from 'drizzle-orm/pg-core';

export const authRoles = ['owner', 'admin', 'member'] as const;
export type AuthRole = (typeof authRoles)[number];

export const authRoleEnum = pgEnum('auth_role', authRoles);

export const publishStatuses = ['draft', 'published'] as const;
export type PublishStatus = (typeof publishStatuses)[number];

export const publishStatusEnum = pgEnum('master_publish_status', publishStatuses);

export const employmentTypes = [
	'full_time',
	'part_time',
	'contractor',
	'temporary',
	'intern',
	'volunteer',
	'other'
] as const;
export type EmploymentType = (typeof employmentTypes)[number];

export const employmentTypeEnum = pgEnum('master_employment_type', employmentTypes);

export const workplaceTypes = ['onsite', 'hybrid', 'remote'] as const;
export type WorkplaceType = (typeof workplaceTypes)[number];

export const workplaceTypeEnum = pgEnum('master_workplace_type', workplaceTypes);

export const salaryUnits = ['year', 'month', 'hour'] as const;
export type SalaryUnit = (typeof salaryUnits)[number];

export const salaryUnitEnum = pgEnum('master_salary_unit', salaryUnits);
