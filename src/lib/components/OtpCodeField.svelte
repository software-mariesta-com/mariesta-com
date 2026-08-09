<script lang="ts">
	import { OTP_LENGTH } from '#lib/constants/otp';

	let {
		id = 'otp-code',
		name = 'otp',
		value = ''
	}: {
		id?: string;
		name?: string;
		value?: string;
	} = $props();
</script>

<label class="otp mx-auto" for={id}>
	{#each { length: OTP_LENGTH }, i (i)}
		<span></span>
	{/each}
	<input
		{id}
		{name}
		type="text"
		class="cursor-text"
		autocomplete="one-time-code"
		inputmode="numeric"
		maxlength={OTP_LENGTH}
		pattern={`[0-9]{${OTP_LENGTH}}`}
		{value}
		required
		aria-label="One-time code"
	/>
</label>
