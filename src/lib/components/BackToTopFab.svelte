<script lang="ts">
	import { onMount } from 'svelte';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';

	/** Show once the top of the page is out of view (roughly past the first viewport). */
	const SHOW_AFTER_PX = 320;

	let visible = $state(false);

	function onScroll() {
		visible = window.scrollY > SHOW_AFTER_PX;
	}

	function goToTop() {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
	}

	onMount(() => {
		onScroll();
	});
</script>

<svelte:window onscroll={onScroll} />

<div
	class={[
		'fab z-50 transition-[opacity,transform] duration-300',
		visible
			? 'pointer-events-auto opacity-100 translate-y-0'
			: 'pointer-events-none opacity-0 translate-y-3'
	]}
	aria-hidden={!visible}
>
	<div class="tooltip tooltip-left tooltip-primary" data-tip="Back to top">
		<button
			type="button"
			class="btn btn-circle btn-primary btn-lg cursor-pointer"
			aria-label="Back to top"
			tabindex={visible ? 0 : -1}
			onclick={goToTop}
		>
			<ArrowUp class="h-5 w-5" aria-hidden="true" />
		</button>
	</div>
</div>
