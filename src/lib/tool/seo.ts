/** Sitewide SEO constants and JSON-LD builders for public marketing pages. */

export const SITE_ORIGIN = 'https://mariesta.com';
export const SITE_NAME = 'MARIESTA';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-default.jpg`;
export const DEFAULT_OG_IMAGE_ALT = 'MARIESTA: Own your craft. Share the upside. Grow in community.';

export function absoluteUrl(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${SITE_ORIGIN}${normalized === '/' ? '' : normalized}`;
}

export function organizationJsonLd(extra?: Record<string, unknown>) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': `${SITE_ORIGIN}/#organization`,
		name: SITE_NAME,
		url: SITE_ORIGIN,
		logo: `${SITE_ORIGIN}/apple-touch-icon.png`,
		slogan: 'Own your craft. Share the upside. Grow in community.',
		description:
			'MARIESTA is the head office that manages businesses across industries, where people own their craft, share the upside, and grow in community.',
		...extra
	};
}

export function websiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		'@id': `${SITE_ORIGIN}/#website`,
		name: SITE_NAME,
		url: SITE_ORIGIN,
		publisher: { '@id': `${SITE_ORIGIN}/#organization` },
		inLanguage: 'en'
	};
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path)
		}))
	};
}

export function collectionPageJsonLd(opts: {
	name: string;
	path: string;
	description: string;
	itemList?: { name: string; path?: string; url?: string }[];
}) {
	const page: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: opts.name,
		url: absoluteUrl(opts.path),
		description: opts.description,
		isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
		about: { '@id': `${SITE_ORIGIN}/#organization` }
	};

	if (opts.itemList && opts.itemList.length > 0) {
		page.mainEntity = {
			'@type': 'ItemList',
			itemListElement: opts.itemList.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.name,
				...(item.url
					? { url: item.url }
					: item.path
						? { url: absoluteUrl(item.path) }
						: {})
			}))
		};
	}

	return page;
}

export function webPageJsonLd(opts: {
	type?: 'WebPage' | 'AboutPage' | 'ContactPage';
	name: string;
	path: string;
	description: string;
}) {
	return {
		'@context': 'https://schema.org',
		'@type': opts.type ?? 'WebPage',
		name: opts.name,
		url: absoluteUrl(opts.path),
		description: opts.description,
		isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
		about: { '@id': `${SITE_ORIGIN}/#organization` }
	};
}
