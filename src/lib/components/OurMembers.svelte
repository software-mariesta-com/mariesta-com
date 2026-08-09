<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { sectionReveal } from '#lib/attachments/section-reveal';
	import { localizeHref } from '#lib/paraglide/runtime';

	export type HomeMember = {
		id: string;
		name: string;
		role: string;
		photoUrl: string | null;
		linkUrl: string | null;
	};

	const PREVIEW = 18;

	let { members = [] }: { members?: HomeMember[] } = $props();

	const preview = $derived(members.slice(0, PREVIEW));
	const hasMore = $derived(members.length > PREVIEW);

	const avatarShellClass = 'member-avatar avatar p-1';
</script>

<section
	id="members"
	class="home-section overflow-hidden"
	aria-labelledby="members-heading"
	{@attach sectionReveal}
>
	<div class="home-section-inner w-full text-center">
		<h2
			id="members-heading"
			class="text-base-content mx-auto text-3xl font-bold tracking-tight sm:text-4xl"
		>
			Our members
		</h2>

		{#if members.length === 0}
			<p class="text-base-content/60 mx-auto mt-8 max-w-md text-sm">
				Published members will appear here.
			</p>
		{:else}
			<div class="mt-8 flex w-full justify-center">
				<ul
					class="flex w-full max-w-6xl list-none flex-wrap justify-center p-8 sm:p-10 [&_.member-avatar_.mask]:size-8 [&_.member-avatar_.mask]:[transition:opacity_1s_ease-out_15s,scale_1s_ease-out_15s,filter_1s_ease-out_15s] [&_.member-avatar_.mask]:pointer-fine:scale-70 [&_.member-avatar_.mask]:pointer-fine:opacity-30 [&_.member-avatar_.mask]:pointer-fine:contrast-70 [&_.member-avatar_.mask]:pointer-fine:grayscale [&_.group:hover_.member-avatar_.mask]:pointer-fine:scale-120 [&_.group:hover_.member-avatar_.mask]:pointer-fine:opacity-100 [&_.group:hover_.member-avatar_.mask]:pointer-fine:contrast-100 [&_.group:hover_.member-avatar_.mask]:pointer-fine:grayscale-0 [&_.group:hover_.member-avatar_.mask]:pointer-fine:[transition:opacity_0s_ease-out_0s,scale_0.05s_ease-out_0s,filter_0s_ease-out_0s]"
					aria-label="Community members"
				>
					{#each preview as member (member.id)}
						<li>
							<div class="tooltip group" data-tip="{member.name} · {member.role}">
								{#if member.linkUrl}
									<a
										href={member.linkUrl}
										class="{avatarShellClass} cursor-pointer"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="{member.name}, {member.role}"
									>
										<div class="mask mask-squircle bg-base-300">
											{#if member.photoUrl}
												<img
													src={member.photoUrl}
													alt={member.name}
													width="64"
													height="64"
													loading="lazy"
													decoding="async"
												/>
											{:else}
												<span
													class="text-base-content flex size-8 items-center justify-center text-xs font-semibold"
													aria-hidden="true"
												>
													{member.name.slice(0, 1).toUpperCase()}
												</span>
											{/if}
										</div>
									</a>
								{:else}
									<div
										class="{avatarShellClass} cursor-default"
										aria-label="{member.name}, {member.role}"
									>
										<div class="mask mask-squircle bg-base-300">
											{#if member.photoUrl}
												<img
													src={member.photoUrl}
													alt={member.name}
													width="64"
													height="64"
													loading="lazy"
													decoding="async"
												/>
											{:else}
												<span
													class="text-base-content flex size-8 items-center justify-center text-xs font-semibold"
													aria-hidden="true"
												>
													{member.name.slice(0, 1).toUpperCase()}
												</span>
											{/if}
										</div>
									</div>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</div>
			{#if hasMore}
				<p class="text-base-content/55 text-sm">
					Showing {preview.length} of {members.length}
				</p>
			{/if}
			<div class="mt-6 flex justify-center">
				<a href={localizeHref('/our-members')} class="btn btn-secondary btn-sm cursor-pointer">
					See more
					<ArrowRight class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		{/if}
	</div>
</section>
