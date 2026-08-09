<script lang="ts">
	import {
		DEFAULT_OG_IMAGE,
		DEFAULT_OG_IMAGE_ALT,
		SITE_NAME,
		absoluteUrl
	} from '#lib/tool/seo';

	type JsonLd = Record<string, unknown> | Record<string, unknown>[];

	let {
		title,
		description,
		path,
		type = 'website',
		image = DEFAULT_OG_IMAGE,
		imageAlt = DEFAULT_OG_IMAGE_ALT,
		noindex = false,
		jsonLd
	}: {
		title: string;
		description: string;
		/** Pathname starting with `/`, e.g. `/home`. */
		path: string;
		type?: string;
		image?: string;
		imageAlt?: string;
		noindex?: boolean;
		jsonLd?: JsonLd;
	} = $props();

	const url = $derived(absoluteUrl(path));
	const blocks = $derived(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}
		<meta name="robots" content="noindex, follow" />
	{:else}
		<meta
			name="robots"
			content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
		/>
	{/if}

	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />
	<meta property="og:image" content={image} />
	<meta property="og:image:alt" content={imageAlt} />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={imageAlt} />

	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />

	{#each blocks as block}
		{@html `<script type="application/ld+json">${JSON.stringify(block)}</script>`}
	{/each}
</svelte:head>
