<script lang="ts">
	import gsap from 'gsap';
	import { localizeHref } from '#lib/paraglide/runtime';

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
			tl.from('.about-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
				.from('.about-headline', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.28')
				.from('.about-cta', { y: 10, autoAlpha: 0, duration: 0.4 }, '-=0.18');
		}, node);

		return () => ctx.revert();
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
			name: 'Software',
			body: 'Products and platforms built with care for the people who use them and the teams who ship them.'
		}
	] as const;

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'AboutPage',
		name: 'About MARIESTA',
		url: 'https://mariesta.org/about',
		description:
			'MARIESTA is a community of businesses built on expression, culture, sharing, and ownership.',
		mainEntity: {
			'@type': 'Organization',
			name: 'MARIESTA',
			url: 'https://mariesta.org',
			slogan: 'Own your craft. Share the upside. Grow in community.',
			description:
				'A community of businesses built on expression, culture, sharing, and ownership.'
		}
	};

</script>

<svelte:head>
	<title>About MARIESTA</title>
	<meta
		name="description"
		content="MARIESTA is a community of businesses built on expression, culture, sharing, and ownership. Steady pay, shared upside, and room to grow a life."
	/>
	<link rel="canonical" href="https://mariesta.org/about" />
	<meta property="og:title" content="About MARIESTA" />
	<meta
		property="og:description"
		content="A community of ventures where people create freely, own together, and share success."
	/>
	<meta property="og:url" content="https://mariesta.org/about" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.org/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About MARIESTA" />
	<meta
		name="twitter:description"
		content="A community of ventures where people create freely, own together, and share success."
	/>
	<script type="application/ld+json">
		{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="relative bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%),radial-gradient(ellipse_at_85%_30%,color-mix(in_oklab,var(--color-primary)_7%,transparent),transparent_42%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10">
		<section
			class="mx-auto max-w-3xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8"
			aria-labelledby="about-heading"
			{@attach heroMotion}
		>
			<p class="about-brand logo-wordmark text-4xl sm:text-5xl md:text-6xl">MARIESTA</p>
			<h1
				id="about-heading"
				class="about-headline text-base-content/75 mt-5 max-w-xl text-lg leading-relaxed sm:text-xl"
			>
				We build and steward a community of ventures where people own their craft, share the
				upside, and grow together.
			</h1>
			<div class="about-cta mt-8 flex flex-wrap gap-3">
				<a
					href={localizeHref('/companies')}
					class="btn btn-primary cursor-pointer"
				>
					Explore businesses
				</a>
				<a href={localizeHref('/careers')} class="btn btn-ghost cursor-pointer">View openings</a>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="who-heading"
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2 id="who-heading" class="text-base-content text-xl font-bold sm:text-2xl">
					Who we are
				</h2>
				<p class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
					MARIESTA is not a single product company. It is a group of businesses that share a
					simple bet: when people create freely, own what they help build, and stay rooted in
					community, the work gets better and the upside can be shared.
				</p>
				<p class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
					We start and grow ventures across industries, then keep them connected through common
					standards, shared learning, and a culture that treats craft as serious work.
				</p>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="how-heading"
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2 id="how-heading" class="text-base-content text-xl font-bold sm:text-2xl">
					How we work
				</h2>
				<p class="text-base-content/70 mt-2 max-w-xl text-base">
					Four ideas guide every company in the group.
				</p>
				<ul class="mt-8 grid gap-8 sm:grid-cols-2">
					{#each pillars as pillar (pillar.title)}
						<li>
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
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2 id="where-heading" class="text-base-content text-xl font-bold sm:text-2xl">
					Where we build
				</h2>
				<p class="text-base-content/70 mt-2 max-w-xl text-base">
					Software is the lane we work in today.
				</p>
				<ul class="mt-8 flex flex-col gap-6">
					{#each industries as industry (industry.name)}
						<li class="border-base-300/80 border-l-2 border-primary/40 pl-4">
							<h3 class="text-base-content text-lg font-semibold">{industry.name}</h3>
							<p class="text-base-content/75 mt-1 text-base leading-relaxed">{industry.body}</p>
						</li>
					{/each}
				</ul>
				<p class="mt-8">
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
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<h2 id="people-heading" class="text-base-content text-xl font-bold sm:text-2xl">
					People and partners
				</h2>
				<p class="text-base-content/75 mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
					MARIESTA is made of the people inside the companies and the partners who work alongside
					us. Community is not a slogan here. It is how we hire, collaborate, and share success.
				</p>
				<div class="mt-6 flex flex-wrap gap-x-6 gap-y-2">
					<a
						href={`${localizeHref('/home')}#members`}
						class="link link-primary cursor-pointer font-medium"
					>
						Meet our members
					</a>
					<a
						href={`${localizeHref('/home')}#partners`}
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
		>
			<div class="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
				<h2 id="join-heading" class="text-base-content text-xl font-bold sm:text-2xl">
					Grow with us
				</h2>
				<p class="text-base-content/75 mt-4 max-w-xl text-base leading-relaxed sm:text-lg">
					If you want to own your craft, share the upside, and grow in community, we would like to
					meet you.
				</p>
				<a href={localizeHref('/careers')} class="btn btn-primary mt-8 cursor-pointer">
					View open roles
				</a>
			</div>
		</section>
	</div>
</div>
