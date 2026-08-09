import gsap from 'gsap';

/** Soft fade-up when a home section enters the viewport. */
export function sectionReveal(node: HTMLElement) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	const target = node.querySelector<HTMLElement>('.home-section-inner') ?? node;
	gsap.set(target, { autoAlpha: 0, y: 32 });

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				gsap.to(target, {
					autoAlpha: 1,
					y: 0,
					duration: 0.8,
					ease: 'power2.out'
				});
				io.disconnect();
			}
		},
		{ threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
	);

	io.observe(node);
	return () => {
		io.disconnect();
		gsap.killTweensOf(target);
	};
}
