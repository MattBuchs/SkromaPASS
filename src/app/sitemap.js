import { siteConfig } from "@/lib/seo";

export default function sitemap() {
    const baseUrl = siteConfig.url;
    const currentDate = new Date().toISOString();

    // Pages statiques publiques
    const staticPages = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: "weekly",
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.8,
        },
        {
            url: `${baseUrl}/generator`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: currentDate,
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${baseUrl}/legal/mentions-legales`,
            lastModified: currentDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/politique-confidentialite`,
            lastModified: currentDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/cgu`,
            lastModified: currentDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${baseUrl}/legal/politique-cookies`,
            lastModified: currentDate,
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    return staticPages;
}
