<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { sectionReveal } from '#lib/attachments/section-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';

	export type HomePartner = {
		id: string;
		name: string;
		logoUrl: string | null;
		linkUrl: string | null;
	};

	const PREVIEW = 8;

	let { partners = [] }: { partners?: HomePartner[] } = $props();

	const preview = $derived(partners.slice(0, PREVIEW));
	const hasMore = $derived(partners.length > PREVIEW);

	const logoBoxClass =
		'partner-logo flex h-20 w-44 items-center justify-center rounded-box border border-base-300 bg-base-100 px-5 sm:h-24 sm:w-56';
</script>

<section
	id="partners"
	class="home-section"
	aria-labelledby="partners-heading"
	{@attach sectionReveal}
>
	<div class="home-section-inner w-full">
		<div class="mx-auto mb-10 max-w-6xl text-center">
			<h2
				id="partners-heading"
				class="text-base-content text-3xl font-bold tracking-tight sm:text-4xl"
			>
				Our partners
			</h2>
		</div>

		{#if partners.length === 0}
			<p class="text-base-content/60 mx-auto max-w-md text-center text-sm">
				Published partners will appear here.
			</p>
		{:else}
			<ul
				class="mx-auto flex max-w-5xl list-none flex-wrap items-center justify-center gap-3 p-4 sm:gap-4 sm:p-6 md:gap-5 [&_.partner-logo]:[transition:opacity_1s_ease-out_15s,scale_1s_ease-out_15s,filter_1s_ease-out_15s] [&_.partner-logo]:pointer-fine:scale-90 [&_.partner-logo]:pointer-fine:opacity-40 [&_.partner-logo]:pointer-fine:contrast-70 [&_.partner-logo]:pointer-fine:grayscale [&_.partner-logo]:pointer-fine:group-hover:scale-110 [&_.partner-logo]:pointer-fine:group-hover:opacity-100 [&_.partner-logo]:pointer-fine:group-hover:contrast-100 [&_.partner-logo]:pointer-fine:group-hover:grayscale-0 [&_.partner-logo]:pointer-fine:group-hover:[transition:opacity_0s_ease-out_0s,scale_0.05s_ease-out_0s,filter_0s_ease-out_0s]"
				aria-label="Partners"
			>
				{#each preview as partner (partner.id)}
					<li>
						<div class="tooltip group" data-tip={partner.name}>
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
											class="max-h-12 max-w-full object-contain sm:max-h-14"
											width="160"
											height="56"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<span class="text-base-content text-sm font-medium">{partner.name}</span>
									{/if}
								</a>
							{:else}
								<div class="{logoBoxClass} cursor-default" aria-label={partner.name}>
									{#if partner.logoUrl}
										<img
											src={partner.logoUrl}
											alt=""
											class="max-h-12 max-w-full object-contain sm:max-h-14"
											width="160"
											height="56"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<span class="text-base-content text-sm font-medium">{partner.name}</span>
									{/if}
								</div>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
			{#if hasMore}
				<p class="text-base-content/55 mt-4 text-center text-sm">
					Showing {preview.length} of {partners.length}
				</p>
			{/if}
			<div class="mt-8 flex justify-center">
				<a href={localizeHref('/our-partners')} class="btn btn-secondary btn-sm cursor-pointer">
					See more
					<ArrowRight class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		{/if}
	</div>
</section>
