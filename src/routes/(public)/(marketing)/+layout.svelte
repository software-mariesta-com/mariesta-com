<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';
	import BackToTopFab from '#lib/components/BackToTopFab.svelte';
	import PublicFooter from '#lib/components/PublicFooter.svelte';
	import PublicNavbar from '#lib/components/PublicNavbar.svelte';

	let { children, data }: { children: Snippet; data: LayoutData } = $props();
</script>

<div class="bg-base-200 flex min-h-svh flex-col">
	<PublicNavbar />
	<div class="flex-1">{@render children()}</div>
	<PublicFooter businesses={data.businesses} />
	<BackToTopFab />
</div>
