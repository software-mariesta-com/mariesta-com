<script lang="ts">
	import {
		EMPLOYMENT_TYPE_LABELS,
		SALARY_UNIT_LABELS,
		WORKPLACE_TYPE_LABELS,
		type EmploymentType,
		type SalaryUnit,
		type WorkplaceType
	} from '#lib/constants/career';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { buildJobPostingJsonLd } from '#lib/util/job-posting-json-ld';
	import type { PageData } from './$types';

	type CareerJob = {
		id: string;
		title: string;
		slug: string;
		description: string;
		location: string;
		locationCountry: string;
		employmentType: EmploymentType;
		workplaceType: WorkplaceType;
		applyUrl: string | null;
		applyEmail: string | null;
		departmentLabel: string | null;
		salaryMin: number | null;
		salaryMax: number | null;
		salaryCurrency: string | null;
		salaryUnit: SalaryUnit | null;
		expiresAt: string | null;
		createdAt: string;
		business?: { id: string; name: string } | null;
	};

	let { data }: { data: PageData } = $props();
	let job = $derived(data.job as CareerJob);

	const pageUrl = $derived(`https://mariesta.org/careers/${job.slug}`);
	const jsonLd = $derived(buildJobPostingJsonLd(job, pageUrl));
	const metaDescription = $derived(
		job.description.length > 155 ? `${job.description.slice(0, 152)}...` : job.description
	);

	const applyHref = $derived(
		job.applyUrl ?? (job.applyEmail ? `mailto:${job.applyEmail}` : null)
	);

	const salaryLabel = $derived.by(() => {
		if (job.salaryMin == null && job.salaryMax == null) return null;
		const currency = job.salaryCurrency ?? '';
		const unit = job.salaryUnit ? SALARY_UNIT_LABELS[job.salaryUnit] : '';
		if (job.salaryMin != null && job.salaryMax != null) {
			return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} ${unit}`.trim();
		}
		const amount = (job.salaryMin ?? job.salaryMax)!.toLocaleString();
		return `${currency} ${amount} ${unit}`.trim();
	});
</script>

<svelte:head>
	<title>{job.title} | Careers | MARIESTA</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content="{job.title} | Careers | MARIESTA" />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.org/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="{job.title} | Careers | MARIESTA" />
	<meta name="twitter:description" content={metaDescription} />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<article class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<p class="mb-4">
			<a href={localizeHref('/careers')} class="link link-hover text-sm cursor-pointer"
				>Back to openings</a
			>
		</p>

		<header class="mb-8">
			<p class="logo-wordmark text-2xl">MARIESTA</p>
			<h1 class="mt-3 text-2xl font-bold text-base-content sm:text-3xl">{job.title}</h1>
			{#if job.business?.name || job.departmentLabel}
				<p class="text-base-content/60 mt-1 text-sm">
					{[job.business?.name, job.departmentLabel].filter(Boolean).join(' · ')}
				</p>
			{/if}
			<div class="mt-4 flex flex-wrap gap-2">
				<span class="badge badge-outline">{job.location}</span>
				<span class="badge badge-outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
				<span class="badge badge-outline">{WORKPLACE_TYPE_LABELS[job.workplaceType]}</span>
				{#if salaryLabel}
					<span class="badge badge-outline">{salaryLabel}</span>
				{/if}
			</div>
		</header>

		<div class="prose prose-base max-w-none whitespace-pre-wrap text-base-content">
			{job.description}
		</div>

		{#if applyHref}
			<div class="mt-10">
				<a
					href={applyHref}
					class="btn btn-primary cursor-pointer"
					target={job.applyUrl ? '_blank' : undefined}
					rel={job.applyUrl ? 'noopener noreferrer' : undefined}
				>
					Apply now
				</a>
			</div>
		{/if}
	</article>
</div>
