<script lang="ts">
	import type { PageData } from './$types';

	type BusinessListItem = {
		id: string;
		name: string;
		category: string;
		blurb: string;
		linkUrl: string | null;
	};

	let { data }: { data: PageData } = $props();
	let items = $derived(data.items as BusinessListItem[]);

	const cardClass =
		'card card-border bg-base-100 h-full transition-colors hover:border-primary/40';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Businesses | MARIESTA',
		url: 'https://mariesta.org/companies',
		description:
			'Explore the businesses in the MARIESTA group. Software and ventures built on craft, ownership, and community.',
		isPartOf: {
			'@type': 'WebSite',
			name: 'MARIESTA',
			url: 'https://mariesta.org'
		}
	};
</script>

<svelte:head>
	<title>Businesses | MARIESTA</title>
	<meta
		name="description"
		content="Explore every published business in the MARIESTA group. Learn what each venture builds and find links to their sites."
	/>
	<link rel="canonical" href="https://mariesta.org/companies" />
	<meta property="og:title" content="Businesses | MARIESTA" />
	<meta
		property="og:description"
		content="Explore every published business in the MARIESTA group. Learn what each venture builds and find links to their sites."
	/>
	<meta property="og:url" content="https://mariesta.org/companies" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.org/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Businesses | MARIESTA" />
	<meta
		name="twitter:description"
		content="Explore every published business in the MARIESTA group. Learn what each venture builds and find links to their sites."
	/>
	<script type="application/ld+json">
		{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10 max-w-3xl">
			<p class="logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="mt-3 text-2xl font-bold text-base-content sm:text-3xl">Our businesses</h1>
			<p class="text-base-content/70 mt-2 max-w-xl text-base">
				Every published venture in the group. Explore what we build.
			</p>
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
					<p class="text-sm text-base-content/70">{business.blurb}</p>
				</div>
			{/snippet}

			<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each items as business (business.id)}
					<li>
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
