<script lang="ts">
	import { onMount, type Component, type Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import NavProgress from '#lib/components/NavProgress.svelte';
	import PublicFooter from '#lib/components/PublicFooter.svelte';
	import PublicNavbar from '#lib/components/PublicNavbar.svelte';
	import { hasConsentRecord } from '#lib/store/local-storage/cookie-consent';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();

	let CookieConsentComp = $state<Component | null>(null);
	let BackToTopComp = $state<Component | null>(null);

	onMount(() => {
		let idleId: number | undefined;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;

		const mountChrome = async () => {
			const [{ default: CookieConsent }, { default: BackToTopFab }] = await Promise.all([
				import('#lib/components/CookieConsent.svelte'),
				import('#lib/components/BackToTopFab.svelte')
			]);
			if (cancelled) return;
			CookieConsentComp = CookieConsent;
			BackToTopComp = BackToTopFab;
		};

		const schedule = (fn: () => void) => {
			if ('requestIdleCallback' in window) {
				idleId = window.requestIdleCallback(fn, { timeout: 2000 });
			} else {
				timeoutId = setTimeout(fn, 1);
			}
		};

		// First-visit banner: mount soon. Returning visitors: defer off critical path.
		if (!hasConsentRecord()) {
			void mountChrome();
		} else {
			schedule(() => {
				void mountChrome();
			});
		}

		return () => {
			cancelled = true;
			if (idleId !== undefined && 'cancelIdleCallback' in window) {
				window.cancelIdleCallback(idleId);
			}
			if (timeoutId !== undefined) clearTimeout(timeoutId);
		};
	});
</script>

<div class="bg-base-200 flex min-h-svh flex-col">
	<NavProgress />
	<PublicNavbar />
	<div class="flex-1">{@render children()}</div>
	<PublicFooter businesses={data.businesses} />
	{#if BackToTopComp}
		<BackToTopComp />
	{/if}
	{#if CookieConsentComp}
		<CookieConsentComp />
	{/if}
</div>
