<script lang="ts">
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.about-brand', { y: 28, autoAlpha: 0, duration: 0.7 })
					.from('.about-rule', { y: 14, autoAlpha: 0, duration: 0.45 }, '-=0.4')
					.from('.about-headline', { y: 18, autoAlpha: 0, duration: 0.55 }, '-=0.3')
					.from('.about-cta a', { y: 12, autoAlpha: 0, duration: 0.4, stagger: 0.08 }, '-=0.2');

				gsap.to('.about-glow', {
					scale: 1.12,
					autoAlpha: 0.9,
					duration: 3.2,
					ease: 'sine.inOut',
					yoyo: true,
					repeat: -1
				});
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function pillarsReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.1, y: 24 });
	}

	const pillars = [
		{
			title: 'Expression',
			body: 'People do their best work when they can make things their own way. We leave room for craft, taste, and a clear point of view.'
		},
		{
			title: 'Culture',
			body: 'Each venture keeps its character. Shared standards for honesty and care hold the group together without flattening what makes each company distinct.'
		},
		{
			title: 'Sharing',
			body: 'Knowledge, tools, and upside move across the group. Wins compound when people teach each other and success is not locked inside one silo.'
		},
		{
			title: 'Ownership',
			body: 'Steady pay matters. So does a real stake in what you help build. We design roles and ventures so people can grow a life, not only a job.'
		}
	] as const;

	const industries = [
		{
			name: 'Across industries',
			body: 'Businesses span software and other fields. Each keeps its own brand and operations under shared group standards.'
		}
	] as const;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About MARIESTA',
		url: 'https://mariesta.com/about',
		description:
			'MARIESTA is the head office that manages businesses of all kinds, built on expression, culture, sharing, and ownership.',
		mainEntity: {
			'@type': 'Organization',
			name: 'MARIESTA',
			url: 'https://mariesta.com',
			slogan: 'Own your craft. Share the upside. Grow in community.',
			description:
				'A head office that manages businesses of all kinds, built on expression, culture, sharing, and ownership.'
		}
	};
</script>

<svelte:head>
	<title>About MARIESTA</title>
	<meta
		name="description"
		content="MARIESTA is the head office that manages businesses of all kinds. Expression, culture, sharing, and ownership guide the group."
	/>
	<link rel="canonical" href="https://mariesta.com/about" />
	<meta property="og:title" content="About MARIESTA" />
	<meta
		property="og:description"
		content="The MARIESTA head office stewards businesses where people create freely, own together, and share success."
	/>
	<meta property="og:url" content="https://mariesta.com/about" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.com/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About MARIESTA" />
	<meta
		name="twitter:description"
		content="The MARIESTA head office stewards businesses where people create freely, own together, and share success."
	/>
	<script type="application/ld+json">
		{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%),radial-gradient(ellipse_at_85%_30%,color-mix(in_oklab,var(--color-primary)_7%,transparent),transparent_42%)]"
		aria-hidden="true"
	></div>
	<div
		class="about-glow pointer-events-none absolute top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl sm:h-56 sm:w-56"
		aria-hidden="true"
	></div>

	<div class="relative z-10">
		<section
			class="mx-auto max-w-3xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8"
			aria-labelledby="about-heading"
			{@attach heroMotion}
		>
			<p class="about-brand logo-wordmark text-4xl sm:text-5xl md:text-6xl">MARIESTA</p>
			<figure class="about-rule mt-5">
				<div
					class="ms-1 inline-grid grid-cols-[.75rem_1fr_.75rem] grid-rows-[.75rem_1fr_.75rem] align-middle"
				>
					<div class="border-primary border-s-2 border-t-2 [grid-area:1/1/2/2]" aria-hidden="true"></div>
					<div class="border-primary border-e-2 border-t-2 [grid-area:1/3/2/4]" aria-hidden="true"></div>
					<div class="border-primary border-s-2 border-b-2 [grid-area:3/1/4/2]" aria-hidden="true"></div>
					<div class="border-primary border-e-2 border-b-2 [grid-area:3/3/4/4]" aria-hidden="true"></div>
					<p
						class="text-primary border-primary m-2 border-2 px-1 text-center text-sm font-semibold leading-snug sm:text-base md:text-lg [grid-area:1/1/4/4]"
					>
						Ribbonize Organization v1: Rule & Regulation
					</p>
				</div>
			</figure>
			<h1
				id="about-heading"
				class="about-headline text-base-content/75 mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
			>
				We align with the statement above. MARIESTA is the head office that manages
				businesses of all kinds, where people own their craft, share the upside, and grow
				together.
			</h1>
			<div class="about-cta mt-8 flex flex-wrap gap-3">
				<a href={localizeHref('/companies')} class="btn btn-primary cursor-pointer">
					Explore businesses
				</a>
				<a href={localizeHref('/contact')} class="btn btn-ghost cursor-pointer">Contact head office</a>
				<a href={localizeHref('/careers')} class="btn btn-ghost cursor-pointer">View openings</a>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="who-heading"
			{@attach scrollReveal}
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2 id="who-heading" class="text-base-content text-xl font-bold sm:text-2xl" data-reveal-item>
					Who we are
				</h2>
				<p
					class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
					data-reveal-item
				>
					MARIESTA is the head office. We manage businesses of all sorts: each with its
					own work, brand, and team, held together by shared standards and a simple bet that when
					people create freely, own what they help build, and stay rooted in community, the work
					gets better and the upside can be shared.
				</p>
				<p
					class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
					data-reveal-item
				>
					We start and grow ventures across industries, then keep them connected through common
					practices, shared learning, and a culture that treats craft as serious work.
				</p>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="how-heading"
			{@attach pillarsReveal}
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div data-reveal-item>
					<h2 id="how-heading" class="text-base-content text-xl font-bold sm:text-2xl">
						How we work
					</h2>
					<p class="text-base-content/70 mt-2 max-w-xl text-base">
						Four ideas guide every company in the group.
					</p>
				</div>
				<ul class="mt-8 grid gap-8 sm:grid-cols-2">
					{#each pillars as pillar (pillar.title)}
						<li data-reveal-item>
							<h3 class="text-primary text-lg font-semibold tracking-tight">{pillar.title}</h3>
							<p class="text-base-content/75 mt-2 text-base leading-relaxed">{pillar.body}</p>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="where-heading"
			{@attach scrollReveal}
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div data-reveal-item>
					<h2 id="where-heading" class="text-base-content text-xl font-bold sm:text-2xl">
						Where we build
					</h2>
					<p class="text-base-content/70 mt-2 max-w-xl text-base">
						The head office stewards businesses across many kinds of work.
					</p>
				</div>
				<ul class="mt-8 flex flex-col gap-6">
					{#each industries as industry (industry.name)}
						<li class="border-base-300/80 border-l-2 border-primary/40 pl-4" data-reveal-item>
							<h3 class="text-base-content text-lg font-semibold">{industry.name}</h3>
							<p class="text-base-content/75 mt-1 text-base leading-relaxed">{industry.body}</p>
						</li>
					{/each}
				</ul>
				<p class="mt-8" data-reveal-item>
					<a
						href={localizeHref('/companies')}
						class="link link-primary cursor-pointer font-medium"
					>
						See our businesses
					</a>
				</p>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="people-heading"
			{@attach scrollReveal}
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2
					id="people-heading"
					class="text-base-content text-xl font-bold sm:text-2xl"
					data-reveal-item
				>
					People and partners
				</h2>
				<p
					class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg"
					data-reveal-item
				>
					MARIESTA is made of the people inside the companies and the partners who work alongside
					us. Community is not a slogan here. It is how we hire, collaborate, and share success.
				</p>
				<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2" data-reveal-item>
					<a
						href={localizeHref('/our-members')}
						class="link link-primary cursor-pointer font-medium"
					>
						Meet our members
					</a>
					<a
						href={localizeHref('/our-partners')}
						class="link link-primary cursor-pointer font-medium"
					>
						See our partners
					</a>
				</div>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="join-heading"
			{@attach scrollReveal}
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
				<h2 id="join-heading" class="text-base-content text-xl font-bold sm:text-2xl" data-reveal-item>
					Grow with us
				</h2>
				<p
					class="text-base-content/75 mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
					data-reveal-item
				>
					If you want to own your craft, share the upside, and grow in community, we would like to
					meet you.
				</p>
				<div class="mt-8 flex flex-wrap gap-3" data-reveal-item>
					<a href={localizeHref('/careers')} class="btn btn-primary cursor-pointer">
						View open roles
					</a>
					<a href={localizeHref('/contact')} class="btn btn-ghost cursor-pointer">Contact us</a>
				</div>
			</div>
		</section>
	</div>
</div>
