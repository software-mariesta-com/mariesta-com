<script lang="ts">
	import type { Snippet } from 'svelte';
	import { AUTH_ROUTES } from '#lib/constants/auth-routes';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="relative flex min-h-svh flex-col items-center justify-center bg-base-200 px-4 py-10"
>
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mb-8">
		<a href="/home" class="logo-wordmark cursor-pointer text-3xl sm:text-4xl">MARIESTA</a>
	</div>

	<div class="relative z-10 w-full max-w-md">
		{@render children()}
	</div>

	<p class="relative z-10 mt-8 text-center text-sm text-base-content/60">
		<a class="link link-hover cursor-pointer" href="/home">Back to home</a>
		<span class="mx-2" aria-hidden="true">·</span>
		<a class="link link-hover cursor-pointer" href={AUTH_ROUTES.login}>Login</a>
	</p>
</div>
