<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';
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
				tl.from('.privacy-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
					.from('.privacy-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
					.from('.privacy-lede', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.28');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	const lastUpdated = '9 August 2026';
	const title = 'Privacy Policy | MARIESTA';
	const description =
		'Read how MARIESTA collects, uses, stores, and protects personal data on mariesta.com, including contact forms, accounts, and public profiles.';
	const jsonLd = [
		webPageJsonLd({
			name: title,
			path: '/privacy-policy',
			description
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Privacy policy', path: '/privacy-policy' }
		])
	];
</script>

<SeoHead {title} {description} path="/privacy-policy" {jsonLd} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_45%_0%,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent_50%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="privacy-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<h1 class="privacy-title text-base-content mt-3 text-2xl font-bold sm:text-3xl">
				Privacy policy
			</h1>
			<p class="privacy-lede text-base-content/70 mt-2 max-w-xl text-base">
				Last updated: {lastUpdated}. This policy explains how MARIESTA (“we”, “us”) handles
				personal data when you use mariesta.com.
			</p>
		</header>

		<nav
			class="border-base-300/80 bg-base-100/40 mb-10 rounded-box border p-4 sm:p-5"
			aria-label="On this page"
		>
			<p class="text-base-content text-sm font-semibold">On this page</p>
			<ul class="text-base-content/80 mt-3 grid gap-2 text-sm sm:grid-cols-2">
				<li><a class="link link-hover cursor-pointer" href="#who">Who we are</a></li>
				<li><a class="link link-hover cursor-pointer" href="#scope">Scope</a></li>
				<li><a class="link link-hover cursor-pointer" href="#collect">Data we collect</a></li>
				<li><a class="link link-hover cursor-pointer" href="#use">How we use data</a></li>
				<li><a class="link link-hover cursor-pointer" href="#legal">Legal bases</a></li>
				<li><a class="link link-hover cursor-pointer" href="#share">Sharing and processors</a></li>
				<li><a class="link link-hover cursor-pointer" href="#retain">Retention</a></li>
				<li><a class="link link-hover cursor-pointer" href="#security">Security</a></li>
				<li><a class="link link-hover cursor-pointer" href="#transfers">International transfers</a></li>
				<li><a class="link link-hover cursor-pointer" href="#rights">Your rights</a></li>
				<li><a class="link link-hover cursor-pointer" href="#children">Children</a></li>
				<li><a class="link link-hover cursor-pointer" href="#cookies">Cookies</a></li>
				<li><a class="link link-hover cursor-pointer" href="#changes">Changes</a></li>
				<li><a class="link link-hover cursor-pointer" href="#contact">Contact</a></li>
			</ul>
		</nav>

		<article class="space-y-10" {@attach scrollReveal}>
			<section data-reveal-item id="who" aria-labelledby="who-heading">
				<h2 id="who-heading" class="text-base-content text-xl font-bold">1. Who we are</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					MARIESTA is the head office that manages businesses of all kinds. This website
					(mariesta.com) is operated by MARIESTA for public information, careers, contact, and
					internal administration. For privacy questions, use the
					<a href={localizeHref('/contact')} class="link link-primary cursor-pointer">contact page</a
					>.
				</p>
			</section>

			<section data-reveal-item id="scope" aria-labelledby="scope-heading">
				<h2 id="scope-heading" class="text-base-content text-xl font-bold">2. Scope</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					This policy covers personal data processed through mariesta.com, including the public
					marketing site, the contact form, career listings, and the authenticated admin area. It
					does not cover third-party sites we link to (for example a business website, GitHub, or an
					external apply URL). Those services have their own policies.
				</p>
			</section>

			<section data-reveal-item id="collect" aria-labelledby="collect-heading">
				<h2 id="collect-heading" class="text-base-content text-xl font-bold">
					3. Data we collect
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We collect only what we need to run the site and respond to you. Depending on how you use
					MARIESTA, that may include:
				</p>

				<div class="mt-6 overflow-x-auto">
					<table class="table table-zebra [&_tbody_tr]:hover:bg-primary/40">
						<thead>
							<tr>
								<th>Category</th>
								<th>Examples</th>
								<th>When</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="align-top text-sm font-medium">Contact inquiries</td>
								<td class="align-top text-sm">
									Name, email, organization, topic, message content
								</td>
								<td class="align-top text-sm">When you submit the contact form</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Account and auth</td>
								<td class="align-top text-sm">
									Name, email, password hash or OAuth identifiers, role, session data, optional
									2FA settings
								</td>
								<td class="align-top text-sm">When you create or use an admin account</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Technical logs</td>
								<td class="align-top text-sm">
									IP address, user agent, and similar request metadata (for example in sessions)
								</td>
								<td class="align-top text-sm">When you browse or sign in</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Public profiles and media</td>
								<td class="align-top text-sm">
									Member name, role, photo; partner name and logo; business descriptions
								</td>
								<td class="align-top text-sm">When admins publish content for the public site</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Career applications</td>
								<td class="align-top text-sm">
									Data you send via mailto or an external apply link listed on a job post
								</td>
								<td class="align-top text-sm">
									When you apply (often outside this site; handled by the destination)
								</td>
							</tr>
							<tr>
								<td class="align-top text-sm font-medium">Preferences</td>
								<td class="align-top text-sm">
									Theme and language choices, cookie consent record (with your consent where
									required)
								</td>
								<td class="align-top text-sm">When you set preferences in the browser</td>
							</tr>
						</tbody>
					</table>
				</div>

				<p class="text-base-content/75 mt-4 text-base leading-relaxed">
					We do not intentionally collect special-category data (such as health or biometric data)
					through the public site. Please do not include sensitive personal information in contact
					messages unless it is necessary and you are comfortable sharing it.
				</p>
			</section>

			<section data-reveal-item id="use" aria-labelledby="use-heading">
				<h2 id="use-heading" class="text-base-content text-xl font-bold">4. How we use data</h2>
				<ul class="text-base-content/75 mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed">
					<li>Operate, secure, and improve mariesta.com and the admin tools.</li>
					<li>Respond to contact inquiries and route them inside the group when appropriate.</li>
					<li>Authenticate users, enforce roles, and protect accounts (including OTP and 2FA).</li>
					<li>Publish approved public content about businesses, partners, members, and careers.</li>
					<li>
						Store appearance and language preferences when you allow Preferences cookies.
					</li>
					<li>Comply with legal obligations and defend legitimate interests when required.</li>
				</ul>
				<p class="text-base-content/75 mt-4 text-base leading-relaxed">
					We do not sell your personal data. We do not use contact form submissions for unrelated
					marketing lists without a clear lawful basis and your expectation.
				</p>
			</section>

			<section data-reveal-item id="legal" aria-labelledby="legal-heading">
				<h2 id="legal-heading" class="text-base-content text-xl font-bold">5. Legal bases</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Where data protection law requires a legal basis, we typically rely on:
				</p>
				<ul class="text-base-content/75 mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed">
					<li>
						<strong>Contract / steps prior to contract:</strong> responding to inquiries and
						providing requested services.
					</li>
					<li>
						<strong>Legitimate interests:</strong> securing the site, preventing abuse, operating
						admin accounts, and publishing group information in a proportionate way.
					</li>
					<li>
						<strong>Consent:</strong> non-essential cookies and similar technologies (Preferences,
						Analytics) as described in our cookie policy.
					</li>
					<li>
						<strong>Legal obligation:</strong> when we must keep or disclose data to meet the law.
					</li>
				</ul>
			</section>

			<section data-reveal-item id="share" aria-labelledby="share-heading">
				<h2 id="share-heading" class="text-base-content text-xl font-bold">
					6. Sharing and processors
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We share personal data only with service providers that help us run the platform, under
					appropriate arrangements, or when the law requires it. Typical processors include:
				</p>
				<ul class="text-base-content/75 mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed">
					<li>
						<strong>Hosting and database:</strong> cloud infrastructure that stores application and
						account data (for example Postgres).
					</li>
					<li>
						<strong>Email delivery:</strong> SMTP providers used to send contact-form messages and
						auth emails (OTP, password reset).
					</li>
					<li>
						<strong>Object storage:</strong> services used to store uploaded images such as partner
						logos and member photos.
					</li>
					<li>
						<strong>Identity providers:</strong> if you sign in with GitHub OAuth, GitHub processes
						data under its own terms when you authorize the connection.
					</li>
				</ul>
				<p class="text-base-content/75 mt-4 text-base leading-relaxed">
					Staff inside MARIESTA and relevant businesses may access inquiry or admin data only as
					needed to respond or operate the system.
				</p>
			</section>

			<section data-reveal-item id="retain" aria-labelledby="retain-heading">
				<h2 id="retain-heading" class="text-base-content text-xl font-bold">7. Retention</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We keep personal data only as long as needed for the purposes above:
				</p>
				<ul class="text-base-content/75 mt-3 list-disc space-y-2 ps-5 text-base leading-relaxed">
					<li>
						<strong>Contact messages:</strong> retained in email/inbox systems for operational
						follow-up, then deleted or archived according to internal practice.
					</li>
					<li>
						<strong>Accounts:</strong> kept while the account is active; removed or anonymized when
						no longer needed after closure, subject to legal holds.
					</li>
					<li>
						<strong>Published profiles and media:</strong> kept while published; removed when
						unpublished or deleted by admins.
					</li>
					<li>
						<strong>Sessions and security logs:</strong> kept for limited periods needed for
						security and troubleshooting.
					</li>
					<li>
						<strong>Browser preferences:</strong> until you clear site data or withdraw Preferences
						consent.
					</li>
				</ul>
			</section>

			<section data-reveal-item id="security" aria-labelledby="security-heading">
				<h2 id="security-heading" class="text-base-content text-xl font-bold">8. Security</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We use technical and organizational measures appropriate to the risk, including encrypted
					transport (HTTPS), hashed passwords, session controls, optional two-factor authentication,
					and access limited by role. No method of transmission or storage is perfectly secure. If
					you believe your account or data has been compromised, contact us promptly.
				</p>
			</section>

			<section data-reveal-item id="transfers" aria-labelledby="transfers-heading">
				<h2 id="transfers-heading" class="text-base-content text-xl font-bold">
					9. International transfers
				</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Our providers may process data in countries other than where you live. When we transfer
					personal data internationally, we take steps designed to protect it in line with
					applicable law and our contracts with those providers.
				</p>
			</section>

			<section data-reveal-item id="rights" aria-labelledby="rights-heading">
				<h2 id="rights-heading" class="text-base-content text-xl font-bold">10. Your rights</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					Depending on where you live, you may have rights to access, correct, delete, or restrict
					processing of your personal data, to object to certain processing, and to data portability.
					Where processing is based on consent, you may withdraw consent at any time (for example via
					cookie settings for Preferences and Analytics). Withdrawal does not affect processing
					already carried out lawfully.
				</p>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					To exercise rights related to data we hold, contact us through the
					<a href={localizeHref('/contact')} class="link link-primary cursor-pointer">contact page</a
					>. We may need to verify your identity before responding. You may also have the right to
					lodge a complaint with a supervisory authority in your country.
				</p>
			</section>

			<section data-reveal-item id="children" aria-labelledby="children-heading">
				<h2 id="children-heading" class="text-base-content text-xl font-bold">11. Children</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					mariesta.com is not directed at children under 16 (or the equivalent minimum age in your
					jurisdiction). We do not knowingly collect personal data from children. If you believe a
					child has provided us data, contact us and we will take appropriate steps to delete it.
				</p>
			</section>

			<section data-reveal-item id="cookies" aria-labelledby="cookies-heading">
				<h2 id="cookies-heading" class="text-base-content text-xl font-bold">12. Cookies</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We use essential cookies for security and sign-in, and optional Preferences and Analytics
					technologies based on your choices. Details, category toggles, and how to change settings
					are in our
					<a href={localizeHref('/cookie-policy')} class="link link-primary cursor-pointer"
						>cookie policy</a
					>.
				</p>
			</section>

			<section data-reveal-item id="changes" aria-labelledby="changes-heading">
				<h2 id="changes-heading" class="text-base-content text-xl font-bold">13. Changes</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					We may update this privacy policy when our practices or the law change. The “Last updated”
					date at the top will change when we do. Material changes may also be highlighted on the
					site. Continued use after an update means you accept the revised policy.
				</p>
			</section>

			<section data-reveal-item id="contact" aria-labelledby="contact-heading">
				<h2 id="contact-heading" class="text-base-content text-xl font-bold">14. Contact</h2>
				<p class="text-base-content/75 mt-3 text-base leading-relaxed">
					For privacy requests or questions about this policy, write to the MARIESTA head office via
					the
					<a href={localizeHref('/contact')} class="link link-primary cursor-pointer">contact page</a
					>
					and choose a relevant topic so we can route your message.
				</p>
				<div class="mt-6 flex flex-wrap gap-3">
					<a href={localizeHref('/contact')} class="btn btn-primary cursor-pointer">Contact us</a>
					<a href={localizeHref('/cookie-policy')} class="btn btn-ghost cursor-pointer"
						>Cookie policy</a
					>
				</div>
			</section>
		</article>
	</div>
</div>
