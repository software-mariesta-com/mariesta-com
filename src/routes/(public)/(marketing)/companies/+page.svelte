<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import type { PageData } from './$types';
	import {
		breadcrumbJsonLd,
		collectionPageJsonLd
	} from '#lib/tool/seo';

	type BusinessListItem = {
		id: string;
		name: string;
		category: string;
		blurb: string;
		linkUrl: string | null;
	};

	let { data }: { data: PageData } = $props();
	let items = $derived(data.items as BusinessListItem[]);
	const isEmpty = $derived(!data.loadError && items.length === 0);

	const title = 'Businesses | MARIESTA';
	const description =
		'Explore every published business in the MARIESTA group. Learn what each venture builds and find links to their sites.';
	const jsonLd = $derived([
		collectionPageJsonLd({
			name: title,
			path: '/companies',
			description,
			itemList: items.map((b) => ({
				name: b.name,
				...(b.linkUrl ? { url: b.linkUrl } : {})
			}))
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Businesses', path: '/companies' }
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
				tl.from('.biz-brand', { y: 24, autoAlpha: 0, duration: 0.65 }).from(
					'.biz-title',
					{ y: 16, autoAlpha: 0, duration: 0.5 },
					'-=0.35'
				);
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function gridReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.07, y: 22, start: 'top 88%' });
	}

	const cardClass =
		'card card-border bg-base-100 h-full transition-colors hover:border-primary/40';
</script>

<SeoHead {title} {description} path="/companies" {jsonLd} noindex={isEmpty} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10 max-w-3xl" {@attach heroMotion}>
			<p class="biz-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="biz-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">Our businesses</h1>
		</header>

		{#if data.loadError}
			<div class="alert alert-error">
				<span>{data.loadError}</span>
			</div>
		{:else if items.length === 0}
			<p class="text-base-content/60 py-16 text-center">
				No published businesses yet. Check back soon.
			</p>
		{:else}
			{#snippet cardBody(business: BusinessListItem)}
				<div class="card-body gap-3">
					<span class="badge badge-soft w-fit">{business.category}</span>
					<h2 class="card-title text-lg">{business.name}</h2>
					<p class="text-base-content/70 text-sm">{business.blurb}</p>
				</div>
			{/snippet}

			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" {@attach gridReveal}>
				{#each items as business (business.id)}
					<li data-reveal-item>
						{#if business.linkUrl}
							<a
								href={business.linkUrl}
								class="{cardClass} cursor-pointer"
								target="_blank"
								rel="noopener noreferrer"
							>
								{@render cardBody(business)}
							</a>
						{:else}
							<div class="{cardClass} cursor-default">
								{@render cardBody(business)}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
