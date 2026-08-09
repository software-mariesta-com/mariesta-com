<script lang="ts">
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';
	import type { PageData } from './$types';

	type PartnerItem = {
		id: string;
		name: string;
		logoUrl: string | null;
		linkUrl: string | null;
	};

	let { data }: { data: PageData } = $props();
	let items = $derived(data.items as PartnerItem[]);

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.partners-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
					.from('.partners-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
					.from('.partners-cta', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.28');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function gridReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.05, y: 18, start: 'top 88%' });
	}

	const logoBoxClass =
		'flex h-24 w-full items-center justify-center rounded-box border border-base-300 bg-base-100 px-5 transition-colors hover:border-primary/40 sm:h-28';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Partners | MARIESTA',
		url: 'https://mariesta.com/our-partners',
		description:
			'Organizations that collaborate with the MARIESTA head office and our businesses.',
		isPartOf: {
			'@type': 'WebSite',
			name: 'MARIESTA',
			url: 'https://mariesta.com'
		}
	};
</script>

<svelte:head>
	<title>Partners | MARIESTA</title>
	<meta
		name="description"
		content="Meet the partners who work with MARIESTA and our businesses across the group."
	/>
	<link rel="canonical" href="https://mariesta.com/our-partners" />
	<meta property="og:title" content="Partners | MARIESTA" />
	<meta
		property="og:description"
		content="Meet the partners who work with MARIESTA and our businesses across the group."
	/>
	<meta property="og:url" content="https://mariesta.com/our-partners" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.com/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Partners | MARIESTA" />
	<meta
		name="twitter:description"
		content="Meet the partners who work with MARIESTA and our businesses across the group."
	/>
	<script type="application/ld+json">
		{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_40%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="partners-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<div class="mt-3 flex w-full items-center justify-between gap-3 sm:gap-4">
				<h1
					class="partners-title text-base-content min-w-0 text-2xl leading-none font-bold sm:text-3xl"
				>
					Our partners
				</h1>
				<a
					href={localizeHref('/contact')}
					class="partners-cta btn btn-primary shrink-0 self-center cursor-pointer"
				>
					Partner with us
				</a>
			</div>
		</header>

		{#if data.loadError}
			<div class="alert alert-error">
				<span>{data.loadError}</span>
			</div>
		{:else if items.length === 0}
			<p class="text-base-content/60 py-16 text-center">
				No published partners yet. Check back soon.
			</p>
		{:else}
			<ul
				class="grid list-none gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
				aria-label="Partners"
				{@attach gridReveal}
			>
				{#each items as partner (partner.id)}
					<li data-reveal-item>
						{#if partner.linkUrl}
							<a
								href={partner.linkUrl}
								class="{logoBoxClass} cursor-pointer"
								target="_blank"
								rel="noopener noreferrer"
								aria-label={partner.name}
							>
								{#if partner.logoUrl}
									<img
										src={partner.logoUrl}
										alt=""
										class="max-h-14 max-w-full object-contain"
										width="180"
										height="56"
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<span class="text-base-content px-2 text-center text-sm font-medium"
										>{partner.name}</span
									>
								{/if}
							</a>
						{:else}
							<div class="{logoBoxClass} cursor-default" aria-label={partner.name}>
								{#if partner.logoUrl}
									<img
										src={partner.logoUrl}
										alt=""
										class="max-h-14 max-w-full object-contain"
										width="180"
										height="56"
										loading="lazy"
										decoding="async"
									/>
								{:else}
									<span class="text-base-content px-2 text-center text-sm font-medium"
										>{partner.name}</span
									>
								{/if}
							</div>
						{/if}
						<p class="text-base-content/70 mt-2 text-center text-sm">{partner.name}</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
