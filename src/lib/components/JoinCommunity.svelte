<script lang="ts">
	import { sectionReveal } from '#lib/attachments/section-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';
</script>

<section
	id="join"
	class="home-section"
	aria-labelledby="join-heading"
	{@attach sectionReveal}
>
	<div class="home-section-inner mx-auto max-w-xl text-center">
		<h2
			id="join-heading"
			class="text-base-content text-3xl font-bold tracking-tight sm:text-4xl"
		>
			Join the community
		</h2>
		<p class="text-base-content/70 mt-4 text-base leading-relaxed">
			Own your craft, share the upside, and grow with people building across the MARIESTA group.
		</p>
		<a href={localizeHref('/careers')} class="btn btn-primary mt-8 cursor-pointer">
			View open roles
		</a>
	</div>
</section>
