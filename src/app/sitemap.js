import { siteConfig } from "@/lib/seo";

export default function sitemap() {
	const baseUrl = siteConfig.url;

	const staticPages = [
		{
			url: baseUrl,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/register`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/login`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/password-generator`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${baseUrl}/legal/legal-notice`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "yearly",
			priority: 0.2,
		},
		{
			url: `${baseUrl}/legal/privacy-policy`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "yearly",
			priority: 0.2,
		},
		{
			url: `${baseUrl}/legal/cookie-policy`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "yearly",
			priority: 0.2,
		},
		{
			url: `${baseUrl}/legal/terms-of-service`,
			lastModified: "2026-03-24T00:00:00.000Z",
			changeFrequency: "yearly",
			priority: 0.2,
		},
	];

	return staticPages;
}
