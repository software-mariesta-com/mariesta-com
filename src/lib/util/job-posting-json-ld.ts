import {
	EMPLOYMENT_TYPE_SCHEMA,
	SALARY_UNIT_SCHEMA,
	type EmploymentType,
	type SalaryUnit,
	type WorkplaceType
} from '#lib/constants/career';

type JobForSchema = {
	title: string;
	description: string;
	location: string;
	locationCountry: string;
	employmentType: EmploymentType;
	workplaceType: WorkplaceType;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryCurrency: string | null;
	salaryUnit: SalaryUnit | null;
	expiresAt: string | Date | null;
	createdAt: string | Date;
	business?: { name: string } | null;
};

export function buildJobPostingJsonLd(job: JobForSchema, pageUrl: string) {
	const orgName = job.business?.name ?? 'MARIESTA';
	const datePosted =
		job.createdAt instanceof Date
			? job.createdAt.toISOString().slice(0, 10)
			: String(job.createdAt).slice(0, 10);

	const posting: Record<string, unknown> = {
		'@context': 'https://schema.org/',
		'@type': 'JobPosting',
		title: job.title,
		description: job.description,
		datePosted,
		employmentType: EMPLOYMENT_TYPE_SCHEMA[job.employmentType],
		hiringOrganization: {
			'@type': 'Organization',
			name: orgName,
			sameAs: 'https://mariesta.com'
		},
		jobLocation: {
			'@type': 'Place',
			address: {
				'@type': 'PostalAddress',
				addressLocality: job.location,
				addressCountry: job.locationCountry
			}
		},
		url: pageUrl
	};

	if (job.workplaceType === 'remote') {
		posting.jobLocationType = 'TELECOMMUTE';
		posting.applicantLocationRequirements = {
			'@type': 'Country',
			name: job.locationCountry
		};
	}

	if (job.expiresAt) {
		const expires =
			job.expiresAt instanceof Date
				? job.expiresAt.toISOString()
				: new Date(job.expiresAt).toISOString();
		posting.validThrough = expires;
	}

	if (
		(job.salaryMin != null || job.salaryMax != null) &&
		job.salaryCurrency &&
		job.salaryUnit
	) {
		const value: Record<string, unknown> = {
			'@type': 'QuantitativeValue',
			unitText: SALARY_UNIT_SCHEMA[job.salaryUnit]
		};
		if (job.salaryMin != null) value.minValue = job.salaryMin;
		if (job.salaryMax != null) value.maxValue = job.salaryMax;
		if (job.salaryMin != null && job.salaryMax == null) value.value = job.salaryMin;
		posting.baseSalary = {
			'@type': 'MonetaryAmount',
			currency: job.salaryCurrency,
			value
		};
	}

	return posting;
}
