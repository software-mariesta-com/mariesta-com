<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import {
		EMPLOYMENT_TYPE_LABELS,
		WORKPLACE_TYPE_LABELS,
		type EmploymentType,
		type WorkplaceType
	} from '#lib/constants/career';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { breadcrumbJsonLd, collectionPageJsonLd } from '#lib/tool/seo';
	import type { PageData } from './$types';

	type CareerListItem = {
		id: string;
		title: string;
		slug: string;
		location: string;
		employmentType: EmploymentType;
		workplaceType: WorkplaceType;
		departmentLabel: string | null;
		business?: { id: string; name: string } | null;
	};

	let { data }: { data: PageData } = $props();
	let items = $derived(data.items as CareerListItem[]);
	const isEmpty = $derived(!data.loadError && items.length === 0);

	const title = 'Careers at MARIESTA | Open roles';
	const description =
		'Explore open roles at MARIESTA. Join a community of businesses built on craft, ownership, and shared upside.';
	const jsonLd = $derived([
		collectionPageJsonLd({
			name: title,
			path: '/careers',
			description,
			itemList: items.map((item) => ({
				name: item.title,
				path: `/careers/${item.slug}`
			}))
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Careers', path: '/careers' }
		])
	]);

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.careers-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
					.from('.careers-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
					.from('.careers-lede', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.28');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function listReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.07, y: 18, start: 'top 88%' });
	}
</script>

<SeoHead {title} {description} path="/careers" {jsonLd} noindex={isEmpty} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="careers-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="careers-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">Careers</h1>
			<p class="careers-lede text-base-content/70 mt-2 max-w-xl text-base">
				Open roles across the MARIESTA community. Own your craft. Share the upside.
			</p>
		</header>

		{#if data.loadError}
			<div class="alert alert-error">
				<span>{data.loadError}</span>
			</div>
		{:else if items.length === 0}
			<p class="text-base-content/60 py-16 text-center">
				No open positions right now. Check back soon.
			</p>
		{:else}
			<ul class="flex flex-col gap-3" {@attach listReveal}>
				{#each items as item (item.id)}
					<li data-reveal-item>
						<a
							href={localizeHref(`/careers/${item.slug}`)}
							class="border-base-300 bg-base-100 hover:border-primary/40 block rounded-box border p-4 transition-colors cursor-pointer sm:p-5"
						>
							<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<h2 class="text-base-content text-lg font-semibold">{item.title}</h2>
									{#if item.business?.name || item.departmentLabel}
										<p class="text-base-content/60 mt-0.5 text-sm">
											{[item.business?.name, item.departmentLabel].filter(Boolean).join(' · ')}
										</p>
									{/if}
								</div>
								<div class="flex flex-wrap gap-2">
									<span class="badge badge-ghost badge-sm">{item.location}</span>
									<span class="badge badge-ghost badge-sm"
										>{EMPLOYMENT_TYPE_LABELS[item.employmentType]}</span
									>
									<span class="badge badge-ghost badge-sm"
										>{WORKPLACE_TYPE_LABELS[item.workplaceType]}</span
									>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
