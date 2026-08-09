<script lang="ts">
	type FooterBusiness = {
		id: string;
		name: string;
		linkUrl: string | null;
	};

	let { businesses = [] }: { businesses?: FooterBusiness[] } = $props();
</script>

<footer class="footer sm:footer-horizontal bg-base-200 text-base-content p-10">
	<aside>
		<a href="/home" class="logo-wordmark text-2xl cursor-pointer">MARIESTA</a>
		<p class="text-base-content/60 mt-2 max-w-xs text-sm">
			Own your craft. Share the upside. Grow in community.
		</p>
	</aside>
	<nav aria-label="Businesses">
		<h6 class="footer-title">Business</h6>
		{#if businesses.length === 0}
			<a href="/companies" class="link link-hover cursor-pointer">Our businesses</a>
		{:else}
			{#each businesses as business (business.id)}
				{#if business.linkUrl}
					<a
						href={business.linkUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="link link-hover cursor-pointer"
					>
						{business.name}
					</a>
				{:else}
					<a href="/companies" class="link link-hover cursor-pointer">{business.name}</a>
				{/if}
			{/each}
		{/if}
	</nav>
	<nav aria-label="Company">
		<h6 class="footer-title">Company</h6>
		<a href="/about" class="link link-hover cursor-pointer">About us</a>
		<a href="/our-partners" class="link link-hover cursor-pointer">Our partners</a>
		<a href="/our-members" class="link link-hover cursor-pointer">Our members</a>
		<a href="/contact" class="link link-hover cursor-pointer">Contact</a>
		<a href="/careers" class="link link-hover cursor-pointer">Careers</a>
	</nav>
	<nav aria-label="Legal">
		<h6 class="footer-title">Legal</h6>
		<a href="/privacy-policy" class="link link-hover cursor-pointer">Privacy policy</a>
		<a href="/cookie-policy" class="link link-hover cursor-pointer">Cookie policy</a>
	</nav>
</footer>
