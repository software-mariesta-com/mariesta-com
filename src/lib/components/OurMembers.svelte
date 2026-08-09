<script lang="ts">
	import { sectionReveal } from '#lib/attachments/section-reveal';

	export type HomeMember = {
		id: string;
		name: string;
		role: string;
		photoUrl: string | null;
		linkUrl: string | null;
	};

	let { members = [] }: { members?: HomeMember[] } = $props();
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
			class="mx-auto text-3xl font-bold tracking-tight text-base-content sm:text-4xl"
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
					class="flex w-full max-w-6xl list-none flex-wrap justify-center p-8 sm:p-10 [&_.mask]:size-8 [&_.mask]:[transition:opacity_1s_ease-out_15s,scale_1s_ease-out_15s,filter_1s_ease-out_15s] [&_.mask]:pointer-fine:scale-70 [&_.mask]:pointer-fine:opacity-30 [&_.mask]:pointer-fine:contrast-70 [&_.mask]:pointer-fine:grayscale [&_.mask]:pointer-fine:group-hover:scale-120 [&_.mask]:pointer-fine:group-hover:opacity-100 [&_.mask]:pointer-fine:group-hover:contrast-100 [&_.mask]:pointer-fine:group-hover:grayscale-0 [&_.mask]:pointer-fine:group-hover:[transition:opacity_0s_ease-out_0s,scale_0.05s_ease-out_0s,filter_0s_ease-out_0s]"
					aria-label="Community members"
				>
					{#each members as member (member.id)}
						<li>
							{#if member.linkUrl}
								<a
									href={member.linkUrl}
									class="avatar tooltip group cursor-pointer p-1"
									data-tip="{member.name} · {member.role}"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="{member.name}, {member.role}"
								>
									<div
										class="mask mask-squircle bg-base-300"
										style="will-change: filter, opacity, transform, transition, scale;"
									>
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
												class="flex size-8 items-center justify-center text-xs font-semibold text-base-content"
												aria-hidden="true"
											>
												{member.name.slice(0, 1).toUpperCase()}
											</span>
										{/if}
									</div>
								</a>
							{:else}
								<div
									class="avatar tooltip group cursor-default p-1"
									data-tip="{member.name} · {member.role}"
								>
									<div
										class="mask mask-squircle bg-base-300"
										style="will-change: filter, opacity, transform, transition, scale;"
									>
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
												class="flex size-8 items-center justify-center text-xs font-semibold text-base-content"
												aria-hidden="true"
											>
												{member.name.slice(0, 1).toUpperCase()}
											</span>
										{/if}
									</div>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/if}

		<a href="/careers" class="btn btn-outline btn-primary mt-2 cursor-pointer">Join the community</a>
	</div>
</section>
