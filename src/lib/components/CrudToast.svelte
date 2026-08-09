<script module lang="ts">
	export type CrudToastKind = 'success' | 'error' | 'warning' | 'info';
</script>

<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	let {
		message = null,
		kind = 'success'
	}: {
		message?: string | null;
		kind?: CrudToastKind;
	} = $props();
</script>

{#if message}
	<div class="toast toast-bottom toast-end z-[100]">
		{#if kind === 'success'}
			<div class="alert alert-success shadow-lg">
				<CircleCheck class="h-5 w-5 shrink-0" />
				<span>{message}</span>
			</div>
		{:else if kind === 'error'}
			<div class="alert alert-error shadow-lg">
				<CircleX class="h-5 w-5 shrink-0" />
				<span>{message}</span>
			</div>
		{:else if kind === 'warning'}
			<div class="alert alert-warning shadow-lg">
				<TriangleAlert class="h-5 w-5 shrink-0" />
				<span>{message}</span>
			</div>
		{:else}
			<div class="alert alert-info shadow-lg">
				<Info class="h-5 w-5 shrink-0" />
				<span>{message}</span>
			</div>
		{/if}
	</div>
{/if}
