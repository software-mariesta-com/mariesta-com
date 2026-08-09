/** Soft fade-up when a home section enters the viewport. Content stays visible without JS. */
export function sectionReveal(node: HTMLElement) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	const target = node.querySelector<HTMLElement>('.home-section-inner') ?? node;
	let played = false;

	const io = new IntersectionObserver(
		async (entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting || played) continue;
				played = true;
				io.disconnect();
				const { default: gsap } = await import('gsap');
				gsap.fromTo(
					target,
					{ autoAlpha: 0.92, y: 20 },
					{ autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out', clearProps: 'transform' }
				);
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
	);

	io.observe(node);
	return () => {
		io.disconnect();
	};
}
