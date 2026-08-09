<script lang="ts">
	import { navigating } from '$app/state';
</script>

{#if navigating.to}
	<div
		class="bg-primary fixed inset-x-0 top-0 z-[200] h-0.5 animate-pulse"
		role="progressbar"
		aria-label="Loading page"
	></div>
{/if}
