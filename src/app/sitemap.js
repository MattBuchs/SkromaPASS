import { siteConfig } from "@/lib/seo";

export default function sitemap() {
	const baseUrl = siteConfig.url;

	const staticPages = [
		{
			url: baseUrl,
			lastModified: "2026-01-01T00:00:00.000Z",
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${baseUrl}/register`,
			lastModified: "2026-01-01T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/password-generator`,
			lastModified: "2026-01-01T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.8,
		},
		{
			url: `${baseUrl}/contact`,
			lastModified: "2026-01-01T00:00:00.000Z",
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];

	return staticPages;
}
