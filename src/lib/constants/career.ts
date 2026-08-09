export const EMPLOYMENT_TYPES = [
	'full_time',
	'part_time',
	'contractor',
	'temporary',
	'intern',
	'volunteer',
	'other'
] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
	full_time: 'Full-time',
	part_time: 'Part-time',
	contractor: 'Contractor',
	temporary: 'Temporary',
	intern: 'Intern',
	volunteer: 'Volunteer',
	other: 'Other'
};

/** schema.org JobPosting employmentType values */
export const EMPLOYMENT_TYPE_SCHEMA: Record<EmploymentType, string> = {
	full_time: 'FULL_TIME',
	part_time: 'PART_TIME',
	contractor: 'CONTRACTOR',
	temporary: 'TEMPORARY',
	intern: 'INTERN',
	volunteer: 'VOLUNTEER',
	other: 'OTHER'
};

export const WORKPLACE_TYPES = ['onsite', 'hybrid', 'remote'] as const;
export type WorkplaceType = (typeof WORKPLACE_TYPES)[number];

export const WORKPLACE_TYPE_LABELS: Record<WorkplaceType, string> = {
	onsite: 'On-site',
	hybrid: 'Hybrid',
	remote: 'Remote'
};

export const SALARY_UNITS = ['year', 'month', 'hour'] as const;
export type SalaryUnit = (typeof SALARY_UNITS)[number];

export const SALARY_UNIT_LABELS: Record<SalaryUnit, string> = {
	year: 'Per year',
	month: 'Per month',
	hour: 'Per hour'
};

export const SALARY_UNIT_SCHEMA: Record<SalaryUnit, string> = {
	year: 'YEAR',
	month: 'MONTH',
	hour: 'HOUR'
};
