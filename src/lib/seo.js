/**
 * Configuration SEO centralisée pour SkromaPASS
 */

export const siteConfig = {
	name: "SkromaPASS",
	title: "SkromaPASS - Gestionnaire de Mots de Passe Sécurisé",
	description:
		"Gestionnaire de mots de passe open-source avec chiffrement AES-256, authentification à deux facteurs (2FA), générateur de mots de passe sécurisés et organisation par dossiers.",
	url: process.env.NEXT_PUBLIC_APP_URL || "https://skromapass.fr",
	ogImage: "/icon-512.png",
	author: {
		name: "SkromaPASS",
		url: "https://skromapass.fr",
	},
	keywords: [
		"gestionnaire mots de passe",
		"password manager",
		"sécurité",
		"chiffrement AES-256",
		"2FA",
		"authentification deux facteurs",
		"générateur mot de passe",
		"gestionnaire credentials",
		"coffre-fort numérique",
		"sécurité en ligne",
		"protection données",
		"open source",
		"auto-hébergé",
	],
	socialLinks: {
		twitter: "https://twitter.com/skromapass",
		github: "https://github.com/MattBuchs/SkromaPASS",
	},
};

/**
 * Détecte la locale depuis les cookies/headers (côté serveur, pour generateMetadata).
 * Priorité : cookie mkp_locale → Accept-Language → "fr"
 */
export async function getMetadataLocale() {
	try {
		const { cookies, headers } = await import("next/headers");
		const cookieStore = await cookies();
		const localeCookie = cookieStore.get("mkp_locale")?.value;
		if (localeCookie === "fr" || localeCookie === "en") return localeCookie;

		const headersList = await headers();
		const acceptLang = headersList.get("accept-language") ?? "";
		return acceptLang.toLowerCase().startsWith("fr") ? "fr" : "en";
	} catch {
		return "fr";
	}
}

/**
 * Génère les metadata de base pour une page
 * @param {object} options - title, description, keywords, image, noIndex, canonical
 * @param {"fr"|"en"} locale - locale courante (détermine openGraph.locale)
 */
export function createPageMetadata(
	{ title, description, keywords, image, noIndex = false, canonical },
	locale = "fr",
) {
	const fullTitle = title
		? `${title} | ${siteConfig.name}`
		: siteConfig.title;
	const metaDescription = description || siteConfig.description;
	const imageUrl = image
		? `${siteConfig.url}${image}`
		: `${siteConfig.url}${siteConfig.ogImage}`;
	const canonicalUrl = canonical || siteConfig.url;
	const ogLocale = locale === "en" ? "en_US" : "fr_FR";

	return {
		title: fullTitle,
		description: metaDescription,
		keywords: keywords
			? [...siteConfig.keywords, ...keywords].join(", ")
			: siteConfig.keywords.join(", "),
		authors: [siteConfig.author],
		creator: siteConfig.author.name,
		publisher: siteConfig.author.name,
		robots: noIndex
			? { index: false, follow: false }
			: {
					index: true,
					follow: true,
					googleBot: {
						index: true,
						follow: true,
						"max-video-preview": -1,
						"max-image-preview": "large",
						"max-snippet": -1,
					},
				},
		alternates: {
			canonical: canonicalUrl,
		},
		openGraph: {
			type: "website",
			locale: ogLocale,
			url: canonicalUrl,
			title: fullTitle,
			description: metaDescription,
			siteName: siteConfig.name,
			images: [
				{
					url: imageUrl,
					width: 1200,
					height: 630,
					alt: fullTitle,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title: fullTitle,
			description: metaDescription,
			images: [imageUrl],
			creator: "@skromapass",
			site: "@skromapass",
		},
	};
}

/**
 * Génère les données structurées JSON-LD pour Schema.org
 */
export function generateWebApplicationSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "WebApplication",
		name: siteConfig.name,
		description: siteConfig.description,
		url: siteConfig.url,
		applicationCategory: "SecurityApplication",
		operatingSystem: "Web Browser",
		offers: {
			"@type": "Offer",
			price: "0",
			priceCurrency: "EUR",
		},
		featureList: [
			"Chiffrement AES-256",
			"Authentification à deux facteurs (2FA)",
			"Générateur de mots de passe sécurisés",
			"Organisation par dossiers et catégories",
			"Recherche avancée",
			"Journaux de sécurité",
			"Analyse de force des mots de passe",
		],
		screenshot: `${siteConfig.url}/screenshot.jpg`,
		softwareVersion: "1.0.0",
	};
}

/**
 * Génère les données structurées pour la page d'accueil (Organization)
 */
export function generateOrganizationSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: siteConfig.name,
		url: siteConfig.url,
		logo: `${siteConfig.url}/logo.png`,
		description: siteConfig.description,
		sameAs: [siteConfig.socialLinks.twitter, siteConfig.socialLinks.github],
		contactPoint: {
			"@type": "ContactPoint",
			contactType: "Customer Support",
			availableLanguage: ["French"],
		},
	};
}

/**
 * Génère les données structurées pour une page Article/BlogPosting
 */
export function generateArticleSchema({
	title,
	description,
	image,
	datePublished,
	dateModified,
}) {
	return {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
		description: description,
		image: image ? `${siteConfig.url}${image}` : undefined,
		datePublished: datePublished,
		dateModified: dateModified || datePublished,
		author: {
			"@type": "Organization",
			name: siteConfig.author.name,
		},
		publisher: {
			"@type": "Organization",
			name: siteConfig.author.name,
			logo: {
				"@type": "ImageObject",
				url: `${siteConfig.url}/logo.png`,
			},
		},
	};
}

/**
 * Génère les données structurées FAQPage
 */
export function generateFAQSchema(faqs) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer,
			},
		})),
	};
}

/**
 * Génère les données structurées BreadcrumbList
 */
export function generateBreadcrumbSchema(breadcrumbs) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: breadcrumbs.map((crumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: crumb.name,
			item: `${siteConfig.url}${crumb.path}`,
		})),
	};
}
