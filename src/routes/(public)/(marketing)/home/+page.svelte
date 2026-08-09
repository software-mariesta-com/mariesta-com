<script lang="ts">
	import MariestaGroupIllustration from '#lib/components/MariestaGroupIllustration.svelte';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import {
		breadcrumbJsonLd,
		organizationJsonLd,
		websiteJsonLd
	} from '#lib/tool/seo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const title = 'MARIESTA | Own your craft. Share the upside. Grow in community.';
	const description =
		'MARIESTA is a community of businesses built on expression, culture, sharing, and ownership. Steady pay, shared upside, and room to grow a life.';
	const jsonLd = [
		organizationJsonLd(),
		websiteJsonLd(),
		breadcrumbJsonLd([{ name: 'Home', path: '/home' }])
	];

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

				tl.from('.hero-brand', { y: 28, autoAlpha: 0, duration: 0.7 })
					.from('.hero-lead', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.3')
					.from('.hero-cta', { y: 12, autoAlpha: 0, duration: 0.45 }, '-=0.22')
					.from('.hero-illu', { y: 24, autoAlpha: 0, duration: 0.65 }, '-=0.35')
					.from(
						'.illu-hub',
						{ scale: 0.72, autoAlpha: 0, duration: 0.65, transformOrigin: '50% 50%' },
						'-=0.5'
					)
					.from(
						'.illu-node',
						{
							scale: 0.85,
							autoAlpha: 0,
							duration: 0.5,
							stagger: 0.08,
							transformOrigin: '50% 50%'
						},
						'-=0.4'
					)
					.from('.illu-spoke, .illu-orbit', { autoAlpha: 0, duration: 0.6 }, '-=0.35');

				let hubTween: { kill: () => void } | undefined;
				let glowTween: { kill: () => void } | undefined;

				const startAmbient = () => {
					if (hubTween || glowTween) return;
					hubTween = gsap.to('.illu-hub', {
						y: -6,
						duration: 2.8,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1
					});
					glowTween = gsap.to('.illu-glow', {
						scale: 1.06,
						duration: 3.4,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1,
						transformOrigin: '50% 50%'
					});
				};

				const stopAmbient = () => {
					hubTween?.kill();
					glowTween?.kill();
					hubTween = undefined;
					glowTween = undefined;
					gsap.set('.illu-hub', { y: 0 });
					gsap.set('.illu-glow', { scale: 1 });
				};

				const io = new IntersectionObserver(
					(entries) => {
						for (const entry of entries) {
							if (entry.isIntersecting) startAmbient();
							else stopAmbient();
						}
					},
					{ threshold: 0.15 }
				);
				io.observe(node);

				const prevRevert = () => ctx.revert();
				revert = () => {
					io.disconnect();
					stopAmbient();
					prevRevert();
				};
			}, node);
			if (!revert) revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}
</script>

<SeoHead {title} {description} path="/home" {jsonLd} />

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%),radial-gradient(ellipse_at_80%_40%,color-mix(in_oklab,var(--color-primary)_8%,transparent),transparent_45%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10">
		<section
			class="hero home-section min-h-[calc(100svh-4rem)] overflow-x-hidden"
			aria-labelledby="mariesta-brand"
			{@attach heroMotion}
		>
			<div
				class="hero-content relative w-full max-w-6xl flex-col gap-10 text-center lg:flex-row-reverse lg:gap-12 lg:text-left"
			>
				<div class="hero-illu mx-auto hidden w-full max-w-md shrink-0 sm:max-w-lg lg:mx-0 lg:block lg:max-w-xl">
					<MariestaGroupIllustration />
				</div>

				<div class="max-w-xl lg:max-w-lg">
					<h1
						id="mariesta-brand"
						class="hero-brand logo-wordmark text-5xl sm:text-6xl md:text-7xl"
					>
						MARIESTA
					</h1>
					<p class="hero-lead mx-auto mt-6 max-w-lg space-y-1.5 lg:mx-0">
						<span
							class="text-base-content block text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl"
						>
							Own your craft.
						</span>
						<span
							class="text-primary block text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl"
						>
							Share the upside.
						</span>
						<span
							class="text-base-content block text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl"
						>
							Grow in community.
						</span>
					</p>
					<div class="hero-cta mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
						<a href="/companies" class="btn btn-primary cursor-pointer">Explore businesses</a>
						<a href="/about" class="btn btn-ghost cursor-pointer">About us</a>
					</div>
				</div>
			</div>
		</section>

		{#await import('#lib/components/OurBusinesses.svelte') then { default: OurBusinesses }}
			<OurBusinesses businesses={data.businesses} />
		{/await}
		<div class="divider mx-auto max-w-6xl px-6" role="separator"></div>
		{#await import('#lib/components/OurPartners.svelte') then { default: OurPartners }}
			<OurPartners partners={data.partners} />
		{/await}
		<div class="divider mx-auto max-w-6xl px-6" role="separator"></div>
		{#await import('#lib/components/OurMembers.svelte') then { default: OurMembers }}
			<OurMembers members={data.members} />
		{/await}
		<div class="divider mx-auto max-w-6xl px-6" role="separator"></div>
		{#await import('#lib/components/JoinCommunity.svelte') then { default: JoinCommunity }}
			<JoinCommunity />
		{/await}
	</div>
</div>
