/** Fade-up + optional stagger when a section enters the viewport (GSAP + ScrollTrigger). */
export function scrollReveal(
	node: HTMLElement,
	options?: {
		selector?: string;
		stagger?: number;
		y?: number;
		duration?: number;
		start?: string;
	}
) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	const selector = options?.selector ?? '[data-reveal-item]';
	const stagger = options?.stagger ?? 0.08;
	const y = options?.y ?? 28;
	const duration = options?.duration ?? 0.7;
	const start = options?.start ?? 'top 84%';

	let cancelled = false;
	let revert: (() => void) | undefined;

	void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
		([{ default: gsap }, { ScrollTrigger }]) => {
			if (cancelled) return;
			gsap.registerPlugin(ScrollTrigger);

			const items = node.querySelectorAll<HTMLElement>(selector);
			const targets = items.length > 0 ? Array.from(items) : [node];

			const ctx = gsap.context(() => {
				gsap.from(targets, {
					autoAlpha: 0,
					y,
					duration,
					ease: 'power3.out',
					stagger,
					clearProps: 'transform',
					scrollTrigger: {
						trigger: node,
						start,
						toggleActions: 'play none none none',
						once: true
					}
				});
			}, node);

			revert = () => ctx.revert();
		}
	);

	return () => {
		cancelled = true;
		revert?.();
	};
}
