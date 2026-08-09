<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		busy?: boolean;
		class?: string;
		type?: HTMLButtonAttributes['type'];
		disabled?: boolean;
		onclick?: HTMLButtonAttributes['onclick'];
		'aria-label'?: string;
		children: Snippet;
	};

	let {
		busy = false,
		class: className = 'btn btn-primary',
		type = 'submit',
		disabled = false,
		onclick,
		'aria-label': ariaLabel,
		children
	}: Props = $props();

	const isDisabled = $derived(disabled || busy);
</script>

<button
	{type}
	class="{className} {busy ? 'cursor-wait' : isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}"
	disabled={isDisabled}
	aria-busy={busy}
	aria-label={ariaLabel}
	{onclick}
>
	{#if busy}
		<span class="loading loading-spinner loading-sm"></span>
	{/if}
	{@render children()}
</button>
