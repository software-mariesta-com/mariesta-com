<script lang="ts">
	import {
		EMPLOYMENT_TYPE_LABELS,
		WORKPLACE_TYPE_LABELS,
		type EmploymentType,
		type WorkplaceType
	} from '#lib/constants/career';
	import { localizeHref } from '#lib/paraglide/runtime';
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
</script>

<svelte:head>
	<title>Careers at MARIESTA | Open roles</title>
	<meta
		name="description"
		content="Explore open roles at MARIESTA. Join a community of businesses built on craft, ownership, and shared upside."
	/>
	<link rel="canonical" href="https://mariesta.org/careers" />
	<meta property="og:title" content="Careers at MARIESTA | Open roles" />
	<meta
		property="og:description"
		content="Explore open roles at MARIESTA. Join a community of businesses built on craft, ownership, and shared upside."
	/>
	<meta property="og:url" content="https://mariesta.org/careers" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.org/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Careers at MARIESTA | Open roles" />
	<meta
		name="twitter:description"
		content="Explore open roles at MARIESTA. Join a community of businesses built on craft, ownership, and shared upside."
	/>
</svelte:head>

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10">
			<p class="logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="mt-3 text-2xl font-bold text-base-content sm:text-3xl">Careers</h1>
			<p class="text-base-content/70 mt-2 max-w-xl text-base">
				Open roles across the MARIESTA community. Own your craft. Share the upside.
			</p>
		</header>

		{#if data.loadError}
			<div class="alert alert-error">
				<span>{data.loadError}</span>
			</div>
		{:else if items.length === 0}
			<p class="text-base-content/60 text-center py-16">
				No open positions right now. Check back soon.
			</p>
		{:else}
			<ul class="flex flex-col gap-3">
				{#each items as item (item.id)}
					<li>
						<a
							href={localizeHref(`/careers/${item.slug}`)}
							class="border-base-300 bg-base-100 hover:border-primary/40 block rounded-box border p-4 transition-colors cursor-pointer sm:p-5"
						>
							<div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
								<div>
									<h2 class="text-lg font-semibold text-base-content">{item.title}</h2>
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
