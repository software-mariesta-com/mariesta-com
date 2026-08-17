<script lang="ts">
	import {
		extractProfileAuraColorsFromImage,
		type ProfileAuraColors
	} from '#lib/tool/profile-aura-colors';

	type Props = {
		src?: string | null;
		initials: string;
		alt?: string;
	};

	let { src = null, initials, alt = '' }: Props = $props();

	let extractedColors = $state<ProfileAuraColors | null>(null);
	let extractedForSrc = $state<string | null>(null);

	function onImageLoad(event: Event) {
		if (!src) return;
		const img = event.currentTarget as HTMLImageElement;
		extractedColors = extractProfileAuraColorsFromImage(img);
		extractedForSrc = src;
	}

	function onImageError() {
		extractedColors = null;
		extractedForSrc = src;
	}

	const auraColors = $derived(
		src && extractedForSrc === src ? extractedColors : null
	);

	const usesThemeFallback = $derived(!src || auraColors === null);

	const auraClass = $derived(
		usesThemeFallback
			? 'aura aura-dual aura-sm text-primary bg-primary/25'
			: 'aura aura-dual aura-sm'
	);

	const auraStyle = $derived.by(() => {
		const radius = '--aura-radius: 1.5rem;';
		if (usesThemeFallback || !auraColors) return radius;
		return `${radius} color: ${auraColors.tone1}; background-color: ${auraColors.tone2};`;
	});
</script>

<div class={auraClass} style={auraStyle}>
	<div class="avatar placeholder">
		<div
			class="flex h-32 w-32 items-center justify-center rounded-3xl bg-base-200 text-3xl font-semibold text-base-content/70"
		>
			{#if src}
				{#key src}
					<img
						{src}
						{alt}
						class="h-full w-full rounded-3xl object-cover"
						onload={onImageLoad}
						onerror={onImageError}
					/>
				{/key}
			{:else}
				<span aria-hidden="true">{initials}</span>
			{/if}
		</div>
	</div>
</div>
