<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { breadcrumbJsonLd, webPageJsonLd } from '#lib/tool/seo';

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.terms-brand', { y: 24, autoAlpha: 0, duration: 0.65 }).from(
					'.terms-title',
					{ y: 16, autoAlpha: 0, duration: 0.5 },
					'-=0.35'
				);
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	const title = 'Terms of Use | MARIESTA';
	const description =
		'Terms of use for mariesta.com. How you may access and use the MARIESTA website and related public materials.';
	const jsonLd = [
		webPageJsonLd({
			name: title,
			path: '/terms-of-use',
			description
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Terms of use', path: '/terms-of-use' }
		])
	];
</script>

<SeoHead {title} {description} path="/terms-of-use" {jsonLd} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="terms-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="terms-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">
				Terms of use
			</h1>
			<p class="text-base-content/60 mt-2 text-sm">Last updated: 9 August 2026</p>
		</header>

		<article class="prose prose-neutral dark:prose-invert max-w-none space-y-8" {@attach scrollReveal}>
			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Agreement</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					By accessing mariesta.com (the Site), you agree to these Terms of use. If you do not
					agree, do not use the Site. MARIESTA may update these terms; the date above shows the
					latest revision.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Who we are</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					MARIESTA is the head office that manages businesses across the group. The Site provides
					information about the group, our businesses, partners, members, careers, and ways to
					contact us.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Using the Site</h2>
				<ul class="text-base-content/75 mt-2 list-disc space-y-2 pl-5 text-base leading-relaxed">
					<li>Use the Site only for lawful purposes and in a way that does not harm others.</li>
					<li>Do not attempt to disrupt, scrape abusively, or gain unauthorized access to systems.</li>
					<li>Do not misuse contact forms (spam, malware, or deceptive content).</li>
				</ul>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Content and IP</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					Site content (text, branding, layout, and media) is owned by MARIESTA or its licensors.
					You may view and share links for personal or professional reference. You may not copy,
					republish, or commercially exploit Site content without prior written permission, except
					where law allows.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Third-party links</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					The Site may link to businesses, partners, members, or other third-party sites. Those
					sites have their own terms and privacy practices. MARIESTA is not responsible for their
					content or policies.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Careers and applications</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					Job listings describe opportunities in the MARIESTA community. Applying through an
					external apply URL or email means you also follow that destination’s process and terms.
					Listing a role does not guarantee an offer.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Disclaimer</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					The Site is provided as is for general information. We aim for accuracy but do not
					warrant that content is complete, current, or error-free. To the fullest extent allowed
					by law, MARIESTA is not liable for indirect or consequential loss from use of the Site.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Privacy and cookies</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					How we handle personal data and cookies is described in our
					<a class="link link-primary cursor-pointer" href="/privacy-policy">Privacy policy</a>
					and
					<a class="link link-primary cursor-pointer" href="/cookie-policy">Cookie policy</a>.
				</p>
			</section>

			<section data-reveal-item>
				<h2 class="text-base-content text-lg font-bold">Contact</h2>
				<p class="text-base-content/75 mt-2 text-base leading-relaxed">
					Questions about these terms:
					<a class="link link-primary cursor-pointer" href="/contact">Contact head office</a>.
				</p>
			</section>
		</article>
	</div>
</div>
