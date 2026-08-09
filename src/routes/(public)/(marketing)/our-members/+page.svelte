<script lang="ts">
	import SeoHead from '#lib/components/SeoHead.svelte';
	import { scrollReveal } from '#lib/attachments/scroll-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';
	import { breadcrumbJsonLd, collectionPageJsonLd } from '#lib/tool/seo';
	import type { PageData } from './$types';

	type MemberItem = {
		id: string;
		name: string;
		role: string;
		photoUrl: string | null;
		linkUrl: string | null;
	};

	let { data }: { data: PageData } = $props();
	let items = $derived(data.items as MemberItem[]);
	const isEmpty = $derived(!data.loadError && items.length === 0);

	const title = 'Members | MARIESTA';
	const description =
		'Meet members across the MARIESTA group. People building businesses with craft, ownership, and shared upside.';
	const jsonLd = $derived([
		collectionPageJsonLd({
			name: title,
			path: '/our-members',
			description,
			itemList: items.map((m) => ({
				name: m.name,
				...(m.linkUrl ? { url: m.linkUrl } : {})
			}))
		}),
		breadcrumbJsonLd([
			{ name: 'Home', path: '/home' },
			{ name: 'Members', path: '/our-members' }
		])
	]);

	function heroMotion(node: HTMLElement) {
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		let cancelled = false;
		let revert: (() => void) | undefined;

		void import('gsap').then(({ default: gsap }) => {
			if (cancelled) return;
			const ctx = gsap.context(() => {
				const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
				tl.from('.members-brand', { y: 24, autoAlpha: 0, duration: 0.65 })
					.from('.members-title', { y: 16, autoAlpha: 0, duration: 0.5 }, '-=0.35')
					.from('.members-cta', { y: 12, autoAlpha: 0, duration: 0.4 }, '-=0.28');
			}, node);
			revert = () => ctx.revert();
		});

		return () => {
			cancelled = true;
			revert?.();
		};
	}

	function gridReveal(node: HTMLElement) {
		return scrollReveal(node, { stagger: 0.04, y: 20, start: 'top 88%' });
	}

	const cardClass =
		'rounded-box border border-base-300/80 bg-base-100/40 flex flex-col items-center gap-3 p-5 transition-colors hover:border-primary/40 hover:bg-base-100';
</script>

<SeoHead {title} {description} path="/our-members" {jsonLd} noindex={isEmpty} />

<div class="relative overflow-hidden bg-base-200">
	<div
		class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_60%_0%,color-mix(in_oklab,var(--color-primary)_12%,transparent),transparent_52%)]"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
		<header class="mb-10" {@attach heroMotion}>
			<p class="members-brand logo-wordmark text-3xl sm:text-4xl">MARIESTA</p>
			<div class="mt-3 flex w-full items-center justify-between gap-3 sm:gap-4">
				<h1
					class="members-title text-base-content min-w-0 text-2xl leading-none font-bold sm:text-3xl"
				>
					Our members
				</h1>
				<a
					href={localizeHref('/careers')}
					class="members-cta btn btn-primary shrink-0 self-center cursor-pointer"
				>
					Join the community
				</a>
			</div>
		</header>

		{#if data.loadError}
			<div class="alert alert-error">
				<span>{data.loadError}</span>
			</div>
		{:else if items.length === 0}
			<p class="text-base-content/60 py-16 text-center">
				No published members yet. Check back soon.
			</p>
		{:else}
			<ul
				class="grid list-none gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
				aria-label="Community members"
				{@attach gridReveal}
			>
				{#each items as member (member.id)}
					<li data-reveal-item>
						{#snippet cardBody()}
							<div class="avatar">
								<div class="mask mask-squircle bg-base-300 h-20 w-20">
									{#if member.photoUrl}
										<img
											src={member.photoUrl}
											alt={member.name}
											width="80"
											height="80"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<span
											class="text-base-content flex h-full w-full items-center justify-center text-xl font-semibold"
											aria-hidden="true"
										>
											{member.name.slice(0, 1).toUpperCase()}
										</span>
									{/if}
								</div>
							</div>
							<div class="text-center">
								<p class="text-base-content font-semibold">{member.name}</p>
								<p class="text-base-content/65 mt-0.5 text-sm">{member.role}</p>
							</div>
						{/snippet}

						{#if member.linkUrl}
							<a
								href={member.linkUrl}
								class="{cardClass} cursor-pointer"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="{member.name}, {member.role}"
							>
								{@render cardBody()}
							</a>
						{:else}
							<div class="{cardClass} cursor-default">
								{@render cardBody()}
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
