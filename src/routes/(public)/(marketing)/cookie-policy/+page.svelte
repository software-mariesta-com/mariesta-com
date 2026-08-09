<script lang="ts">
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { openCookieSettings } from '#lib/store/local-storage/cookie-consent';

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.cookie-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
					.from('.cookie-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
					.from('.cookie-lede', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.28');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	const lastUpdated = '9 August 2026';

	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: 'Cookie Policy | MARIESTA',
		url: 'https://mariesta.com/cookie-policy',
		description:
			'How MARIESTA uses cookies and similar technologies on mariesta.com, including consent choices for preferences and analytics.',
		isPartOf: {
			'@type': 'WebSite',
			name: 'MARIESTA',
			url: 'https://mariesta.com'
		},
		dateModified: '2026-08-09'
	};
</script>

<svelte:head>
	<title>Cookie Policy | MARIESTA</title>
	<meta
		name="description"
		content="Learn how MARIESTA uses cookies, what is essential, and how to manage Preferences and Analytics consent on mariesta.com."
	/>
	<link rel="canonical" href="https://mariesta.com/cookie-policy" />
	<meta property="og:title" content="Cookie Policy | MARIESTA" />
	<meta
		property="og:description"
		content="Learn how MARIESTA uses cookies and how to manage your consent choices."
	/>
	<meta property="og:url" content="https://mariesta.com/cookie-policy" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://mariesta.com/og-default.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Cookie Policy | MARIESTA" />
	<meta
		name="twitter:description"
		content="Learn how MARIESTA uses cookies and how to manage your consent choices."
	/>
	<script type="application/ld+json">
		{JSON.stringify(jsonLd)}
	</script>
</svelte:head>

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_50%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="cookie-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="cookie-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">
				Cookie policy
			</h1>
			<p class="cookie-lede text-base-content/70 mt-2 max-w-xl text-base">
				Last updated: {lastUpdated}. This page explains how we use cookies and similar
				technologies on mariesta.com, and how your consent choices work.
			</p>
		</header>

		<article class="space-y-10" {@attach scrollReveal}>
			<section data-reveal-item aria-labelledby="cookie-what">
				<h2 id="cookie-what" class="text-base-content text-xl font-bold">What are cookies?</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Cookies are small text files stored on your device when you visit a website. Similar
					technologies include local storage entries that keep preferences on your browser. We use
					these tools so the site can work securely and, with your consent, remember choices such
					as theme and language.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-consent">
				<h2 id="cookie-consent" class="text-base-content text-xl font-bold">Your consent</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					On your first visit we show a cookie banner. You can Accept all, Reject non-essential, or
					Customize Preferences and Analytics. Essential cookies stay on. Your choice is stored in
					<code class="bg-base-300 rounded-field px-1.5 py-0.5 text-sm">mariesta-cookie-consent</code
					>.
				</p>
				<p class="mt-4">
					<button
						type="button"
						class="btn btn-secondary btn-sm cursor-pointer"
						onclick={() => openCookieSettings()}
					>
						Open cookie settings
					</button>
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-who">
				<h2 id="cookie-who" class="text-base-content text-xl font-bold">Who this applies to</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					This policy covers visitors to the public MARIESTA website and people who sign in to the
					admin area. Contact us if you have questions about how we handle cookies for your account.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-types">
				<h2 id="cookie-types" class="text-base-content text-xl font-bold">
					Cookies and similar technologies we use
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We keep cookie use limited. Analytics scripts load only if you allow Analytics. We do not
					currently run advertising cookies on the public site.
				</p>

				<div class="mt-6 overflow-x-auto">
					<table class="table table-zebra [&_tbody_tr]:hover:bg-primary/40">
						<thead>
							<tr>
								<th>Name / storage</th>
								<th>Category</th>
								<th>Purpose</th>
								<th>When used</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="align-top text-sm font-medium">Better Auth session cookies</td>
								<td class="align-top text-sm">Essential</td>
								<td class="align-top text-sm">
									Keep you signed in to the MARIESTA admin area and protect account sessions.
								</td>
								<td class="align-top text-sm">Always (required for auth)</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">mariesta-cookie-consent</td>
								<td class="align-top text-sm">Essential</td>
								<td class="align-top text-sm">
									Stores your Accept / Reject / Customize choices so we can honor them.
								</td>
								<td class="align-top text-sm">After you choose</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">mariesta-theme (localStorage)</td>
								<td class="align-top text-sm">Preferences</td>
								<td class="align-top text-sm">
									Remembers Light, Dark, or System appearance across visits.
								</td>
								<td class="align-top text-sm">Only if Preferences is On</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">PARAGLIDE_LOCALE</td>
								<td class="align-top text-sm">Preferences</td>
								<td class="align-top text-sm">
									Remembers language (for example English or Myanmar) across visits.
								</td>
								<td class="align-top text-sm">Only if Preferences is On</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Analytics (reserved)</td>
								<td class="align-top text-sm">Analytics</td>
								<td class="align-top text-sm">
									Optional usage measurement. No analytics scripts load unless you allow this.
								</td>
								<td class="align-top text-sm">Only if Analytics is On</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<section data-reveal-item aria-labelledby="cookie-essential">
				<h2 id="cookie-essential" class="text-base-content text-xl font-bold">
					Essential cookies
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Essential cookies are required for security, signed-in features, and remembering your
					cookie choices. Without them, login and session protection cannot work reliably. These are
					not used for marketing.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-preferences">
				<h2 id="cookie-preferences" class="text-base-content text-xl font-bold">Preferences</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					If Preferences is Off, theme changes apply for the current visit only and are not saved.
					Language cannot be persisted until Preferences is On. You can change this anytime in
					Cookie settings.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-third">
				<h2 id="cookie-third" class="text-base-content text-xl font-bold">
					Third-party cookies
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					The public site does not load third-party advertising cookies. If you sign in with GitHub
					OAuth, GitHub may set its own cookies under github.com according to GitHub’s policies. We
					do not control those cookies.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-manage">
				<h2 id="cookie-manage" class="text-base-content text-xl font-bold">
					How to manage cookies
				</h2>
				<ul class="text-base-content/75 mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed">
					<li>
						Use <strong>Open cookie settings</strong> on this page to change Preferences and
						Analytics.
					</li>
					<li>
						Use your browser settings to block or delete cookies. Blocking essential cookies may
						break sign-in.
					</li>
					<li>
						Clear site data for mariesta.com to reset consent and stored preferences.
					</li>
				</ul>
			</section>

			<section data-reveal-item aria-labelledby="cookie-changes">
				<h2 id="cookie-changes" class="text-base-content text-xl font-bold">Changes</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We may update this policy when our practices change. The “Last updated” date at the top
					will change when we do. Continued use of the site after updates means you accept the
					revised policy.
				</p>
			</section>

			<section data-reveal-item aria-labelledby="cookie-contact">
				<h2 id="cookie-contact" class="text-base-content text-xl font-bold">Contact</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Questions about cookies or this policy? Reach the MARIESTA head office through our
					<a href={localizeHref('/contact')} class="link link-primary cursor-pointer">contact page</a
					>.
				</p>
			</section>
		</article>
	</div>
</div>
