<script lang="ts">
	import { sectionReveal } from '#lib/attachments/section-reveal';

	export type HomeBusiness = {
		id: string;
		name: string;
		category: string;
		blurb: string;
		linkUrl: string | null;
	};

	let { businesses = [] }: { businesses?: HomeBusiness[] } = $props();

	const cardClass =
		'card card-border bg-base-100 w-72 shrink-0 transition-shadow hover:shadow-md';
</script>

<section
	id="businesses"
	class="home-section"
	aria-labelledby="businesses-heading"
	{@attach sectionReveal}
>
	<div class="home-section-inner w-full">
		<div class="mx-auto mb-10 max-w-6xl text-center">
			<h2
				id="businesses-heading"
				class="text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
			>
				Our businesses
			</h2>
		</div>

		{#if businesses.length === 0}
			<p class="text-base-content/60 mx-auto max-w-md text-center text-sm">
				Published businesses will appear here.
			</p>
		{:else}
			<ul class="sr-only">
				{#each businesses as business (business.id)}
					<li>
						{business.name}: {business.category}. {business.blurb}
					</li>
				{/each}
			</ul>

			{#snippet businessCardBody(business: HomeBusiness)}
				<div class="card-body gap-3">
					<span class="badge badge-soft w-fit">{business.category}</span>
					<h3 class="card-title text-lg">{business.name}</h3>
					<p class="text-sm text-base-content/70">{business.blurb}</p>
				</div>
			{/snippet}

			{#snippet businessCard(business: HomeBusiness)}
				{#if business.linkUrl}
					<a
						href={business.linkUrl}
						class="{cardClass} cursor-pointer"
						target="_blank"
						rel="noopener noreferrer"
						tabindex="-1"
					>
						{@render businessCardBody(business)}
					</a>
				{:else}
					<div class="{cardClass} cursor-default" tabindex="-1">
						{@render businessCardBody(business)}
					</div>
				{/if}
			{/snippet}

			<div class="marquee w-full overflow-hidden py-4">
				<div class="marquee-track" aria-hidden="true">
					<div class="marquee-set">
						{#each businesses as business (business.id)}
							{@render businessCard(business)}
						{/each}
					</div>
					<div class="marquee-set marquee-set-clone">
						{#each businesses as business (`${business.id}-clone`)}
							{@render businessCard(business)}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.marquee-track {
		display: flex;
		width: max-content;
		animation: businesses-marquee 45s linear infinite;
	}

	.marquee:hover .marquee-track {
		animation-play-state: paused;
	}

	.marquee-set {
		display: flex;
		gap: 1rem;
		padding-block: 0.25rem;
		padding-inline: 0.5rem;
	}

	@keyframes businesses-marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.marquee {
			overflow: visible;
		}

		.marquee-track {
			animation: none;
			width: 100%;
			transform: none;
			justify-content: center;
		}

		.marquee-set {
			flex-wrap: wrap;
			justify-content: center;
			padding-inline: 0;
		}

		.marquee-set-clone {
			display: none;
		}
	}
</style>
