<script lang="ts">
	import Building2 from '@lucide/svelte/icons/building-2';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Clock from '@lucide/svelte/icons/clock';
	import Handshake from '@lucide/svelte/icons/handshake';
	import Mail from '@lucide/svelte/icons/mail';
	import Megaphone from '@lucide/svelte/icons/megaphone';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Send from '@lucide/svelte/icons/send';
	import CrudToast from '#lib/components/CrudToast.svelte';
	import LoadingButton from '#lib/components/LoadingButton.svelte';
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import {
		contactTopicLabels,
		contactTopics,
		type ContactTopic
	} from '#lib/schemas/contact';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { breadcrumbJsonLd, organizationJsonLd, webPageJsonLd } from '#lib/tool/seo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.contact-brand', { y: 28, autoAlpha: 0, duration: 0.7 })
					.from('.contact-eyebrow', { y: 14, autoAlpha: 0, duration: 0.45 }, '-=0.4')
					.from('.contact-headline', { y: 18, autoAlpha: 0, duration: 0.55 }, '-=0.3')
					.from('.contact-lede', { y: 12, autoAlpha: 0, duration: 0.45 }, '-=0.28')
					.from(
						'.contact-hero-meta > *',
						{ y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.08 },
						'-=0.22'
					);

				let orbitTween: { kill: () => void } | undefined;
				let pulseTween: { kill: () => void } | undefined;

				const startAmbient = () => {
					if (orbitTween || pulseTween) return;
					orbitTween = gsap.to('.contact-orbit', {
						rotation: 360,
						duration: 48,
						ease: 'none',
						repeat: -1,
						transformOrigin: '50% 50%'
					});
					pulseTween = gsap.to('.contact-pulse', {
						scale: 1.08,
						autoAlpha: 0.55,
						duration: 2.4,
						ease: 'sine.inOut',
						yoyo: true,
						repeat: -1
					});
				};

				const stopAmbient = () => {
					orbitTween?.kill();
					pulseTween?.kill();
					orbitTween = undefined;
					pulseTween = undefined;
					gsap.set('.contact-orbit', { rotation: 0 });
					gsap.set('.contact-pulse', { scale: 1, autoAlpha: 1 });
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

				revert = () => {
					io.disconnect();
					stopAmbient();
					ctx.revert();
				};
			}, node);
			if (!revert) revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function formReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.06, y: 22 });
	}

	const publicEmail = $derived(data.publicEmail);

	const channels = $derived([
		{
			icon: Mail,
			title: 'Head office desk',
			body: 'Reach the MARIESTA head office for group-level questions, introductions, and routing to the right business.',
			href: `mailto:${publicEmail}`,
			cta: publicEmail
		},
		{
			icon: Handshake,
			title: 'Partnerships',
			body: 'Propose collaborations, vendor relationships, or joint work across the group. Tell us who you are and what you want to build together.',
			href: '#contact-form',
			cta: 'Start a partnership note'
		},
		{
			icon: Briefcase,
			title: 'Careers',
			body: 'Roles live with our businesses and the head office. Browse openings, then apply through the listing that fits.',
			href: localizeHref('/careers'),
			cta: 'View open roles'
		},
		{
			icon: Megaphone,
			title: 'Press and media',
			body: 'For interviews, brand assets, or coverage of MARIESTA and our companies, use the form with topic Press and media.',
			href: '#contact-form',
			cta: 'Request press contact'
		}
	] as const);

	let name = $state('');
	let email = $state('');
	let organization = $state('');
	let topic = $state<ContactTopic>('general');
	let message = $state('');
	let website = $state('');
	let sending = $state(false);
	let toastMessage = $state<string | null>(null);
	let toastKind = $state<'success' | 'error'>('success');
	let toastTimer: ReturnType<typeof setTimeout> | undefined;

	function showToast(kind: 'success' | 'error', msg: string) {
		toastKind = kind;
		toastMessage = msg;
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => {
			toastMessage = null;
		}, 4200);
	}

	async function onSubmit(e: Event) {
		e.preventDefault();
		if (sending) return;
		sending = true;
		try {
			const res = await fetch('/api/public/contact', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					organization,
					topic,
					message,
					website
				})
			});
			const payload = (await res.json().catch(() => null)) as { error?: string; ok?: boolean } | null;
			if (!res.ok) {
				showToast('error', payload?.error ?? 'Could not send your message.');
				return;
			}
			name = '';
			email = '';
			organization = '';
			topic = 'general';
			message = '';
			website = '';
			showToast('success', 'Message sent. We will get back to you soon.');
		} catch {
			showToast('error', 'Network error. Please try again.');
		} finally {
			sending = false;
		}
	}

	const title = 'Contact MARIESTA | Head office';
	const description =
		'Contact the MARIESTA head office for partnerships, press, careers routing, and group inquiries across businesses of all kinds.';
	const jsonLd = $derived([
		organizationJsonLd({
			email: publicEmail,
			contactPoint: {
				'@type': 'ContactPoint',
				contactType: 'customer support',
				email: publicEmail,
				url: 'https://mariesta.com/contact'
			}
		}),
		webPageJsonLd({
			type: 'ContactPage',
			name: title,
			path: '/contact',
			description
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Contact', path: '/contact' }
		])
	]);
</script>

<SeoHead {title} {description} path="/contact" {jsonLd} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,color-mix(in_oklab,var(--color-primary)_14%,transparent),transparent_48%),radial-gradient(ellipse_at_90%_20%,color-mix(in_oklab,var(--color-secondary)_10%,transparent),transparent_40%),linear-gradient(180deg,transparent,color-mix(in_oklab,var(--color-base-300)_35%,transparent))]"
		aria-hidden="true"
	></div>
	<div
		class="contact-orbit pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full border border-primary/20 sm:h-96 sm:w-96"
		aria-hidden="true"
	>
		<div class="contact-pulse absolute top-1/2 left-0 h-3 w-3 -translate-y-1/2 rounded-full bg-primary/70"></div>
	</div>

	<div class="relative z-10">
		<section
			class="mx-auto max-w-6xl px-4 pt-14 pb-12 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8"
			aria-labelledby="contact-heading"
			{@attach heroMotion}
		>
			<p class="contact-brand logo-wordmark text-4xl sm:text-5xl md:text-6xl">MARIESTA</p>
			<p class="contact-eyebrow text-base-content/60 mt-4 text-sm font-medium tracking-wide uppercase sm:text-base">
				Head office correspondence
			</p>
			<h1
				id="contact-heading"
				class="contact-headline text-base-content mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
			>
				Talk to the office that stewards the group
			</h1>
			<p class="contact-lede text-base-content/75 mt-4 max-w-2xl text-lg leading-relaxed">
				MARIESTA is the head office for businesses of all kinds. Use this desk for
				routing, partnerships, press, and serious introductions. We read carefully and connect
				you to the right team when we can.
			</p>
			<div class="contact-hero-meta mt-8 flex flex-wrap gap-3">
				<div class="border-base-300/80 bg-base-100/40 rounded-box flex items-center gap-2 border px-3 py-2 text-sm">
					<Clock class="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
					<span class="text-base-content/80">Typical reply: within 2 business days</span>
				</div>
				<div class="border-base-300/80 bg-base-100/40 rounded-box flex items-center gap-2 border px-3 py-2 text-sm">
					<Building2 class="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
					<span class="text-base-content/80">Group routing across businesses</span>
				</div>
				<div class="border-base-300/80 bg-base-100/40 rounded-box flex items-center gap-2 border px-3 py-2 text-sm">
					<MessageSquare class="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
					<span class="text-base-content/80">English preferred for first contact</span>
				</div>
			</div>
		</section>

		<section
			class="border-base-300/60 border-t"
			aria-labelledby="channels-heading"
			{@attach scrollReveal}
		>
			<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
				<div data-reveal-item>
					<h2 id="channels-heading" class="text-base-content text-xl font-bold sm:text-2xl">
						How to reach us
					</h2>
					<p class="text-base-content/70 mt-2 max-w-2xl text-base">
						Choose the path that matches your intent. Most group matters can start with the form
						below.
					</p>
				</div>
				<ul class="mt-10 grid gap-6 sm:grid-cols-2">
					{#each channels as channel (channel.title)}
						<li
							data-reveal-item
							class="border-base-300/70 bg-base-100/30 hover:border-primary/50 rounded-box border p-5 transition-colors"
						>
							<div class="flex items-start gap-3">
								<span class="bg-primary/10 text-primary mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center">
									<channel.icon class="h-5 w-5" aria-hidden="true" />
								</span>
								<div class="min-w-0">
									<h3 class="text-base-content text-lg font-semibold">{channel.title}</h3>
									<p class="text-base-content/75 mt-2 text-sm leading-relaxed sm:text-base">
										{channel.body}
									</p>
									<a href={channel.href} class="link link-primary mt-3 inline-flex cursor-pointer text-sm font-medium">
										{channel.cta}
									</a>
								</div>
							</div>
						</li>
					{/each}
				</ul>
			</div>
		</section>

		<section
			id="contact-form"
			class="border-base-300/60 border-t"
			aria-labelledby="form-heading"
			{@attach formReveal}
		>
			<div class="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-12 lg:px-8">
				<div class="lg:col-span-5" data-reveal-item>
					<h2 id="form-heading" class="text-base-content text-xl font-bold sm:text-2xl">
						Write the head office
					</h2>
					<p class="text-base-content/75 mt-3 text-base leading-relaxed">
						Share enough context for us to route well: who you are, which business or
						topic you mean, and what a useful next step looks like.
					</p>
					<ul class="text-base-content/70 mt-6 space-y-3 text-sm leading-relaxed">
						<li class="flex gap-2">
							<span class="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
							Include a working reply email and organization name when relevant.
						</li>
						<li class="flex gap-2">
							<span class="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
							For careers, name the role or link the listing when you can.
						</li>
						<li class="flex gap-2">
							<span class="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true"></span>
							We do not sell contact data. Messages are used only to respond and route.
						</li>
					</ul>
					<p class="text-base-content/60 mt-8 text-sm">
						Prefer email directly?
						<a class="link link-primary cursor-pointer ms-1" href={`mailto:${publicEmail}`}
							>{publicEmail}</a
						>
					</p>
				</div>

				<div class="lg:col-span-7" data-reveal-item>
					<form
						class="border-base-300/80 bg-base-100 relative card card-border shadow-sm"
						onsubmit={onSubmit}
					>
						<div class="card-body gap-5">
							<h3 class="card-title text-primary font-bold">Send a message</h3>

							<!-- Honeypot -->
							<div class="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
								<label for="contact-website">Website</label>
								<input
									id="contact-website"
									class="input"
									name="website"
									tabindex="-1"
									autocomplete="off"
									bind:value={website}
								/>
							</div>

							<div class="grid gap-4 sm:grid-cols-2">
								<fieldset class="fieldset">
									<legend class="fieldset-legend">
										Name<span
											class="text-error align-top text-sm leading-none"
											aria-hidden="true">*</span
										>
									</legend>
									<input
										id="contact-name"
										class="input w-full cursor-text"
										name="name"
										type="text"
										autocomplete="name"
										required
										maxlength="120"
										disabled={sending}
										bind:value={name}
									/>
								</fieldset>

								<fieldset class="fieldset">
									<legend class="fieldset-legend">
										Email<span
											class="text-error align-top text-sm leading-none"
											aria-hidden="true">*</span
										>
									</legend>
									<input
										id="contact-email"
										class="input w-full cursor-text"
										name="email"
										type="email"
										autocomplete="email"
										required
										maxlength="254"
										disabled={sending}
										bind:value={email}
									/>
								</fieldset>
							</div>

							<fieldset class="fieldset">
								<legend class="fieldset-legend">Organization</legend>
								<input
									id="contact-org"
									class="input w-full cursor-text"
									name="organization"
									type="text"
									autocomplete="organization"
									maxlength="160"
									disabled={sending}
									bind:value={organization}
								/>
							</fieldset>

							<fieldset class="fieldset">
								<legend class="fieldset-legend">
									Topic<span
										class="text-error align-top text-sm leading-none"
										aria-hidden="true">*</span
									>
								</legend>
								<select
									id="contact-topic"
									class="select w-full cursor-pointer"
									name="topic"
									required
									disabled={sending}
									bind:value={topic}
								>
									{#each contactTopics as t (t)}
										<option value={t}>{contactTopicLabels[t]}</option>
									{/each}
								</select>
							</fieldset>

							<fieldset class="fieldset">
								<legend class="fieldset-legend">
									Message<span
										class="text-error align-top text-sm leading-none"
										aria-hidden="true">*</span
									>
								</legend>
								<textarea
									id="contact-message"
									class="textarea w-full min-h-36 cursor-text"
									name="message"
									required
									minlength="20"
									maxlength="5000"
									disabled={sending}
									bind:value={message}
									placeholder="Context, timing, and what a good reply looks like…"
								></textarea>
							</fieldset>

							<div class="flex flex-wrap items-center justify-between gap-3">
								<p class="text-base-content/55 text-xs sm:text-sm">
									By sending, you agree we may reply by email about this inquiry.
								</p>
								<LoadingButton busy={sending} class="btn btn-primary">
									<Send class="h-4 w-4" aria-hidden="true" />
									{sending ? 'Sending…' : 'Send message'}
								</LoadingButton>
							</div>
						</div>
					</form>
				</div>
			</div>
		</section>
	</div>
</div>

<CrudToast message={toastMessage} kind={toastKind} />
