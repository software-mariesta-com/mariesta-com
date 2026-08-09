import { and, asc, eq, gt, isNull, or } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { getPublishedBusinesses } from '#lib/server/businesses';
import { db } from '#lib/server/db';
import { career, member, partner } from '#lib/server/db/schema';
import { absoluteUrl } from '#lib/tool/seo';

type SitemapEntry = {
	loc: string;
	lastmod?: string;
	changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
	priority?: string;
};

const STATIC_PATHS: { path: string; changefreq: SitemapEntry['changefreq']; priority: string }[] = [
	{ path: '/home', changefreq: 'weekly', priority: '1.0' },
	{ path: '/about', changefreq: 'monthly', priority: '0.9' },
	{ path: '/companies', changefreq: 'weekly', priority: '0.9' },
	{ path: '/our-partners', changefreq: 'weekly', priority: '0.8' },
	{ path: '/our-members', changefreq: 'weekly', priority: '0.8' },
	{ path: '/careers', changefreq: 'daily', priority: '0.9' },
	{ path: '/contact', changefreq: 'monthly', priority: '0.8' },
	{ path: '/privacy-policy', changefreq: 'yearly', priority: '0.4' },
	{ path: '/cookie-policy', changefreq: 'yearly', priority: '0.4' },
	{ path: '/terms-of-use', changefreq: 'yearly', priority: '0.4' }
];

function xmlEscape(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function toIsoDate(value: Date | string | null | undefined): string | undefined {
	if (!value) return undefined;
	const d = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(d.getTime())) return undefined;
	return d.toISOString().slice(0, 10);
}

function renderSitemap(entries: SitemapEntry[]): string {
	const body = entries
		.map((entry) => {
			const parts = [`    <loc>${xmlEscape(entry.loc)}</loc>`];
			if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
			if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
			if (entry.priority) parts.push(`    <priority>${entry.priority}</priority>`);
			return `  <url>\n${parts.join('\n')}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export const GET: RequestHandler = async () => {
	const entries: SitemapEntry[] = STATIC_PATHS.map((item) => ({
		loc: absoluteUrl(item.path),
		changefreq: item.changefreq,
		priority: item.priority
	}));

	try {
		const now = new Date();
		const [jobs, members, partners, businesses] = await Promise.all([
			db.query.career.findMany({
				columns: { slug: true, updatedAt: true },
				where: and(
					eq(career.status, 'published'),
					or(isNull(career.expiresAt), gt(career.expiresAt, now))
				),
				orderBy: [asc(career.sortOrder), asc(career.title)]
			}),
			db.query.member.findMany({
				columns: { updatedAt: true },
				where: eq(member.status, 'published')
			}),
			db.query.partner.findMany({
				columns: { updatedAt: true },
				where: eq(partner.status, 'published')
			}),
			getPublishedBusinesses()
		]);

		for (const job of jobs) {
			entries.push({
				loc: absoluteUrl(`/careers/${job.slug}`),
				lastmod: toIsoDate(job.updatedAt),
				changefreq: 'weekly',
				priority: '0.7'
			});
		}

		// Touch collection lastmod hints via newest child (optional enrichment on static rows)
		const newestMember = members
			.map((m) => m.updatedAt)
			.filter(Boolean)
			.sort((a, b) => +new Date(b!) - +new Date(a!))[0];
		const newestPartner = partners
			.map((p) => p.updatedAt)
			.filter(Boolean)
			.sort((a, b) => +new Date(b!) - +new Date(a!))[0];
		const newestBusiness = businesses
			.map((b) => b.updatedAt)
			.filter(Boolean)
			.sort((a, b) => +new Date(b!) - +new Date(a!))[0];

		const patchLastmod = (path: string, date: Date | string | null | undefined) => {
			const loc = absoluteUrl(path);
			const entry = entries.find((e) => e.loc === loc);
			if (entry) entry.lastmod = toIsoDate(date);
		};
		patchLastmod('/our-members', newestMember);
		patchLastmod('/our-partners', newestPartner);
		patchLastmod('/companies', newestBusiness);
	} catch (err) {
		console.error('Sitemap dynamic URLs failed; serving static paths only', err);
	}

	const xml = renderSitemap(entries);
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		}
	});
};
