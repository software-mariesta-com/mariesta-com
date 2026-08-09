<script lang="ts">
	import { page } from '$app/state';

	const isNotFound = $derived(page.status === 404);
	const status = $derived(page.status);
	const message = $derived(
		isNotFound
			? 'This page does not exist or may have moved. Try home or explore our companies.'
			: (page.error?.message ?? 'Something went wrong')
	);
	const documentTitle = $derived(isNotFound ? 'Not found | MARIESTA' : `${status} | MARIESTA`);
	const heading = $derived(isNotFound ? 'Page not found' : String(status));
</script>

<svelte:head>
	<title>{documentTitle}</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div
	class="relative flex min-h-svh flex-col items-center justify-center bg-base-200 px-4 py-16"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto w-full max-w-lg text-center">
		<a href="/home" class="logo-wordmark cursor-pointer text-4xl sm:text-5xl">MARIESTA</a>

		<h1 class="text-base-content mt-8 text-2xl font-bold sm:text-3xl">{heading}</h1>
		<p class="text-base-content/70 mx-auto mt-4 max-w-md text-base leading-relaxed">
			{message}
		</p>

		<div class="mt-10 flex flex-wrap items-center justify-center gap-3">
			{#if isNotFound}
				<a href="/home" class="btn btn-primary cursor-pointer">Go home</a>
				<a href="/companies" class="btn btn-ghost cursor-pointer">Explore companies</a>
			{:else}
				<a href="/home" class="btn btn-primary cursor-pointer">Go home</a>
			{/if}
		</div>
	</div>
</div>
