<script lang="ts">
	import type { Snippet } from 'svelte';
	import BackToTopFab from '#lib/components/BackToTopFab.svelte';
	import PublicFooter from '#lib/components/PublicFooter.svelte';
	import PublicNavbar from '#lib/components/PublicNavbar.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="bg-base-200 flex min-h-svh flex-col">
	<PublicNavbar />
	<div class="flex-1">{@render children()}</div>
	<PublicFooter />
	<BackToTopFab />
</div>
