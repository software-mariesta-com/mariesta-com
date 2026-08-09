<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import {
		EMPLOYMENT_TYPE_LABELS,
		SALARY_UNIT_LABELS,
		WORKPLACE_TYPE_LABELS,
		type EmploymentType,
		type SalaryUnit,
		type WorkplaceType
	} from '#lib/constants/career';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { breadcrumbJsonLd } from '#lib/tool/seo';
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
	let job = $derived(data.job as unknown as CareerJob);

	const path = $derived(`/careers/${job.slug}`);
	const title = $derived(`${job.title} | Careers | MARIESTA`);
	const metaDescription = $derived(
		job.description.length > 155 ? `${job.description.slice(0, 152)}...` : job.description
	);
	const jsonLd = $derived([
		buildJobPostingJsonLd(job, `https://mariesta.com${path}`),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Careers', path: '/careers' },
			{ name: job.title, path }
		])
	]);

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

	function pageMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.job-back', { y: 10, autoAlpha: 0, duration: 0.35 })
					.from('.job-brand', { y: 18, autoAlpha: 0, duration: 0.5 }, '-=0.2')
					.from('.job-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.3')
					.from('.job-meta', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.25')
					.from('.job-body', { y: 14, autoAlpha: 0, duration: 0.45 }, '-=0.2')
					.from('.job-apply', { y: 10, autoAlpha: 0, duration: 0.35 }, '-=0.18');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}
</script>

<SeoHead {title} description={metaDescription} {path} {jsonLd} />

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<article
		class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
		{@attach pageMotion}
	>
		<p class="job-back mb-4">
			<a href={localizeHref('/careers')} class="link link-hover cursor-pointer text-sm"
				>Back to openings</a
			>
		</p>

		<header class="mb-8">
			<p class="job-brand logo-wordmark text-2xl">MARIESTA</p>
			<h1 class="job-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">{job.title}</h1>
			{#if job.business?.name || job.departmentLabel}
				<p class="text-base-content/60 mt-1 text-sm">
					{[job.business?.name, job.departmentLabel].filter(Boolean).join(' · ')}
				</p>
			{/if}
			<div class="job-meta mt-4 flex flex-wrap gap-2">
				<span class="badge badge-outline">{job.location}</span>
				<span class="badge badge-outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
				<span class="badge badge-outline">{WORKPLACE_TYPE_LABELS[job.workplaceType]}</span>
				{#if salaryLabel}
					<span class="badge badge-outline">{salaryLabel}</span>
				{/if}
			</div>
		</header>

		<div class="job-body prose prose-base text-base-content max-w-none whitespace-pre-wrap">
			{job.description}
		</div>

		{#if applyHref}
			<div class="job-apply mt-10">
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
