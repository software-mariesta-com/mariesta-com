/**
 * Fade-up + optional stagger when a section enters the viewport.
 * CSS + IntersectionObserver only (no GSAP / ScrollTrigger). Content stays visible without JS.
 */
export function scrollReveal(
	node: HTMLElement,
	options?: {
		selector?: string;
		stagger?: number;
		y?: number;
		duration?: number;
		/** Kept for call-site compatibility; mapped loosely to rootMargin. */
		start?: string;
	}
) {
	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduceMotion) return;

	const selector = options?.selector ?? '[data-reveal-item]';
	const stagger = options?.stagger ?? 0.08;
	const y = options?.y ?? 28;
	const duration = options?.duration ?? 0.7;

	const items = node.querySelectorAll<HTMLElement>(selector);
	const hasItems = items.length > 0;

	node.style.setProperty('--reveal-y', `${y}px`);
	node.style.setProperty('--reveal-duration', `${duration}s`);
	node.style.setProperty('--reveal-stagger', `${stagger}s`);

	if (hasItems) {
		items.forEach((el, i) => {
			el.style.setProperty('--reveal-i', String(i));
		});
		node.classList.add('scroll-reveal-pending');
	} else {
		node.classList.add('scroll-reveal-pending', 'scroll-reveal-self');
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				node.classList.remove('scroll-reveal-pending');
				node.classList.add('scroll-reveal-ready');
				io.disconnect();
			}
		},
		{ threshold: 0.08, rootMargin: '0px 0px -12% 0px' }
	);

	io.observe(node);
	return () => {
		io.disconnect();
	};
}
