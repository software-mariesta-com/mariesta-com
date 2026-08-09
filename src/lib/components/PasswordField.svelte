<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';

	type Props = {
		id: string;
		name: string;
		label: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		minlength?: number;
		required?: boolean;
		value?: string;
		/** When false, password stays masked with no show/hide toggle. Default true. */
		revealable?: boolean;
	};

	let {
		id,
		name,
		label,
		autocomplete = 'current-password',
		minlength,
		required = true,
		value = '',
		revealable = true
	}: Props = $props();

	let visible = $state(false);
	const tip = $derived(visible ? 'Hide password' : 'Show password');
</script>

<fieldset class="fieldset">
	<legend class="fieldset-legend">
		{label}{#if required}<span
				class="text-error align-top text-sm leading-none"
				aria-hidden="true">*</span
			>{/if}
	</legend>
	{#if revealable}
		<div class="join w-full">
			<input
				{id}
				{name}
				type={visible ? 'text' : 'password'}
				class="input join-item w-full cursor-text"
				{autocomplete}
				{minlength}
				{required}
				{value}
			/>
			<button
				type="button"
				class="btn join-item btn-square cursor-pointer"
				aria-label={tip}
				aria-pressed={visible}
				onclick={() => (visible = !visible)}
			>
				{#if visible}
					<EyeOff class="h-4 w-4" aria-hidden="true" />
				{:else}
					<Eye class="h-4 w-4" aria-hidden="true" />
				{/if}
			</button>
		</div>
	{:else}
		<input
			{id}
			{name}
			type="password"
			class="input w-full cursor-text"
			{autocomplete}
			{minlength}
			{required}
			{value}
		/>
	{/if}
</fieldset>
