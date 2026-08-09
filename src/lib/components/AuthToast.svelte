<script lang="ts">
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import CircleX from '@lucide/svelte/icons/circle-x';
	import Info from '@lucide/svelte/icons/info';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';

	type ToastKind = 'success' | 'error' | 'warning' | 'info';

	let {
		message = null,
		kind = 'info'
	}: {
		message?: string | null;
		kind?: ToastKind;
	} = $props();

	const Icon = $derived(
		kind === 'success'
			? CircleCheck
			: kind === 'error'
				? CircleX
				: kind === 'warning'
					? TriangleAlert
					: Info
	);

	const alertClass = $derived(
		kind === 'success'
			? 'alert-success'
			: kind === 'error'
				? 'alert-error'
				: kind === 'warning'
					? 'alert-warning'
					: 'alert-info'
	);
</script>

{#if message}
	<div class="toast toast-bottom toast-end z-[100]">
		<div class="alert {alertClass} shadow-lg">
			<Icon class="h-5 w-5 shrink-0" />
			<span>{message}</span>
		</div>
	</div>
{/if}
