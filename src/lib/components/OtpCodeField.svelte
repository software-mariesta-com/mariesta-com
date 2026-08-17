<script lang="ts">
	import { OTP_LENGTH } from '#lib/constants/otp';

	let {
		id = 'otp-code',
		name = 'otp',
		value = '',
		disabled = false,
		label = 'One-time code'
	}: {
		id?: string;
		name?: string;
		value?: string;
		disabled?: boolean;
		label?: string;
	} = $props();

	const initialDigits = () =>
		Array.from({ length: OTP_LENGTH }, (_, index) => value[index]?.replace(/\D/g, '') ?? '');

	let digits = $state<string[]>(initialDigits());

	const inputRefs: HTMLInputElement[] = [];

	const combined = $derived(digits.join(''));
	const isComplete = $derived(combined.length === OTP_LENGTH && /^\d+$/.test(combined));

	function setInputRef(node: HTMLInputElement, index: number) {
		inputRefs[index] = node;
		return {
			destroy() {
				delete inputRefs[index];
			}
		};
	}

	function focusAt(index: number) {
		const input = inputRefs[index];
		if (!input) return;
		input.focus();
		input.select();
	}

	function fillDigits(raw: string, startIndex = 0) {
		const clean = raw.replace(/\D/g, '').slice(0, OTP_LENGTH - startIndex);
		for (let i = 0; i < clean.length; i++) {
			digits[startIndex + i] = clean[i] ?? '';
		}
		const focusIndex = Math.min(startIndex + Math.max(clean.length - 1, 0), OTP_LENGTH - 1);
		focusAt(focusIndex);
	}

	function handleInput(index: number, event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const raw = input.value.replace(/\D/g, '');

		if (!raw) {
			digits[index] = '';
			return;
		}

		if (raw.length > 1) {
			fillDigits(raw, index);
			return;
		}

		digits[index] = raw;
		if (index < OTP_LENGTH - 1) {
			focusAt(index + 1);
		}
	}

	function handleKeydown(index: number, event: KeyboardEvent) {
		if (event.key === 'Backspace') {
			event.preventDefault();
			if (digits[index]) {
				digits[index] = '';
				return;
			}
			if (index > 0) {
				digits[index - 1] = '';
				focusAt(index - 1);
			}
			return;
		}

		if (event.key === 'ArrowLeft' && index > 0) {
			event.preventDefault();
			focusAt(index - 1);
			return;
		}

		if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
			event.preventDefault();
			focusAt(index + 1);
			return;
		}

		if (event.key === 'Enter') {
			if (!isComplete) {
				event.preventDefault();
				return;
			}
			const form = inputRefs[index]?.closest('form');
			form?.requestSubmit();
		}
	}

	function handlePaste(index: number, event: ClipboardEvent) {
		event.preventDefault();
		const text = event.clipboardData?.getData('text') ?? '';
		fillDigits(text, index);
	}

	function handleFocus(event: FocusEvent) {
		(event.currentTarget as HTMLInputElement).select();
	}
</script>

<input
	type="hidden"
	{name}
	value={combined}
	required
	pattern={`[0-9]{${OTP_LENGTH}}`}
	{disabled}
/>

{#snippet otpDigit(index: number)}
	<input
		use:setInputRef={index}
		id={index === 0 ? id : undefined}
		type="text"
		inputmode="numeric"
		autocomplete={index === 0 ? 'one-time-code' : 'off'}
		class="input join-item h-14 min-h-14 w-12 cursor-text px-0 text-center font-mono text-xl"
		maxlength={index === 0 ? OTP_LENGTH : 1}
		value={digits[index]}
		{disabled}
		aria-label="Digit {index + 1} of {OTP_LENGTH}"
		oninput={(event) => handleInput(index, event)}
		onkeydown={(event) => handleKeydown(index, event)}
		onpaste={(event) => handlePaste(index, event)}
		onfocus={handleFocus}
	/>
{/snippet}

<div
	class="mx-auto flex w-fit items-center gap-2 sm:gap-3"
	role="group"
	aria-label={label}
>
	<div class="join join-horizontal">
		{@render otpDigit(0)}
		{@render otpDigit(1)}
		{@render otpDigit(2)}
	</div>
	<span class="text-base-content/60 select-none px-0.5 font-mono text-xl" aria-hidden="true">-</span>
	<div class="join join-horizontal">
		{@render otpDigit(3)}
		{@render otpDigit(4)}
		{@render otpDigit(5)}
	</div>
</div>
