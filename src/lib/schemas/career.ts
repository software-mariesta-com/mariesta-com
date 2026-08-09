import { z } from 'zod';
import {
	EMPLOYMENT_TYPES,
	SALARY_UNITS,
	WORKPLACE_TYPES
} from '#lib/constants/career';
import { uuidSchema } from '#lib/schemas/common';
import { optionalLinkUrlSchema } from '#lib/schemas/optional-link-url';
import { publishStatusSchema } from '#lib/schemas/publish-status';

const slugSchema = z
	.string()
	.trim()
	.min(1)
	.max(120)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
		message: 'Slug must be lowercase letters, numbers, and hyphens'
	});

const optionalEmailSchema = z
	.string()
	.trim()
	.optional()
	.nullable()
	.transform((v) => (!v ? null : v))
	.pipe(z.union([z.string().email(), z.null()]));

const optionalUuidSchema = z
	.string()
	.trim()
	.optional()
	.nullable()
	.transform((v) => (!v ? null : v))
	.pipe(uuidSchema.nullable());

const optionalIntSchema = z
	.union([z.number().int().nonnegative(), z.null(), z.literal('')])
	.optional()
	.transform((v) => (v === undefined || v === null || v === '' ? null : v));

const optionalExpiresAtSchema = z
	.union([z.string(), z.date(), z.null(), z.literal('')])
	.optional()
	.transform((v) => {
		if (v === undefined || v === null || v === '') return null;
		const d = v instanceof Date ? v : new Date(v);
		return Number.isNaN(d.getTime()) ? null : d;
	});

const careerFields = z.object({
	title: z.string().trim().min(1).max(200),
	slug: slugSchema,
	description: z.string().trim().min(1).max(20000),
	location: z.string().trim().min(1).max(200),
	locationCountry: z.string().trim().min(2).max(2).toUpperCase().default('MM'),
	employmentType: z.enum(EMPLOYMENT_TYPES).default('full_time'),
	workplaceType: z.enum(WORKPLACE_TYPES).default('onsite'),
	applyUrl: optionalLinkUrlSchema,
	applyEmail: optionalEmailSchema,
	businessId: optionalUuidSchema,
	departmentLabel: z
		.string()
		.trim()
		.max(200)
		.optional()
		.nullable()
		.transform((v) => (!v ? null : v)),
	salaryMin: optionalIntSchema,
	salaryMax: optionalIntSchema,
	salaryCurrency: z
		.string()
		.trim()
		.max(3)
		.optional()
		.nullable()
		.transform((v) => (!v ? null : v.toUpperCase())),
	salaryUnit: z.enum(SALARY_UNITS).optional().nullable(),
	expiresAt: optionalExpiresAtSchema,
	status: publishStatusSchema.default('draft'),
	sortOrder: z.coerce.number().int().default(0)
});

function refineCareer(data: z.infer<typeof careerFields>, ctx: z.RefinementCtx) {
	if (data.status === 'published' && !data.applyUrl && !data.applyEmail) {
		ctx.addIssue({
			code: 'custom',
			message: 'Published jobs need an apply URL or email',
			path: ['applyUrl']
		});
	}
	if (data.salaryMin != null && data.salaryMax != null && data.salaryMax < data.salaryMin) {
		ctx.addIssue({
			code: 'custom',
			message: 'Max salary must be greater than or equal to min',
			path: ['salaryMax']
		});
	}
	const hasSalary = data.salaryMin != null || data.salaryMax != null;
	if (hasSalary && !data.salaryUnit) {
		ctx.addIssue({
			code: 'custom',
			message: 'Salary unit is required when salary is set',
			path: ['salaryUnit']
		});
	}
	if (hasSalary && !data.salaryCurrency) {
		ctx.addIssue({
			code: 'custom',
			message: 'Currency is required when salary is set',
			path: ['salaryCurrency']
		});
	}
}

export const createCareerSchema = careerFields.superRefine(refineCareer);

export const updateCareerSchema = careerFields
	.partial()
	.extend({ id: uuidSchema })
	.superRefine((data, ctx) => {
		if (data.status === 'published' && data.applyUrl === null && data.applyEmail === null) {
			ctx.addIssue({
				code: 'custom',
				message: 'Published jobs need an apply URL or email',
				path: ['applyUrl']
			});
		}
		if (data.salaryMin != null && data.salaryMax != null && data.salaryMax < data.salaryMin) {
			ctx.addIssue({
				code: 'custom',
				message: 'Max salary must be greater than or equal to min',
				path: ['salaryMax']
			});
		}
	});

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
