/** Soft fade-up when a home section enters the viewport. Content stays visible without JS. */
export function sectionReveal(node: HTMLElement) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	const target = node.querySelector<HTMLElement>('.home-section-inner') ?? node;
	target.classList.add('section-reveal-pending');

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				target.classList.remove('section-reveal-pending');
				target.classList.add('section-reveal-ready');
				io.disconnect();
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
	);

	io.observe(node);
	return () => {
		io.disconnect();
	};
}
