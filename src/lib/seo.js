/**
 * Configuration SEO centralisée pour SkromaPASS
 */

export const siteConfig = {
	name: "SkromaPASS",
	title: "SkromaPASS - Gestionnaire de Mots de Passe Sécurisé",
	description:
		"Gestionnaire de mots de passe sécurisé et open-source avec chiffrement AES-256. Générateur intégré, authentification 2FA, organisation par dossiers et extension de navigateur pour Chrome et Firefox.",
	url: process.env.NEXT_PUBLIC_APP_URL || "https://skromapass.com",
	// Image principale pour le partage social (1280×720, format paysage recommandé)
	ogImage: "/screenshot-desktop.png",
	ogImageWidth: 1280,
	ogImageHeight: 720,
	author: {
		name: "SkromaPASS",
		url: "https://skromapass.com",
	},
	keywords: [
		"gestionnaire mots de passe",
		"password manager",
		"chiffrement AES-256",
		"AES-256 encryption",
		"générateur mot de passe",
		"password generator",
		"coffre-fort numérique",
		"digital vault",
		"extension mots de passe",
		"password manager extension",
		"gestionnaire mots de passe pas cher",
		"affordable password manager",
		"notes sécurisées",
		"secure notes",
		"partage de mot de passe sécurisé",
		"secure password sharing",
		"open-source password manager",
		"gestionnaire mots de passe open source",
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
					width: image ? 1200 : siteConfig.ogImageWidth,
					height: image ? 630 : siteConfig.ogImageHeight,
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
			"AES-256 Encryption",
			"Two-Factor Authentication (2FA)",
			"Secure Password Generator",
			"Folder & Category Organization",
			"Advanced Search",
			"Security Audit Logs",
			"Password Strength Analysis",
			"Secure Notes",
			"Password Sharing",
			"Browser Extension (Chrome & Firefox)",
		],
		inLanguage: ["fr-FR", "en-US"],
		screenshot: [
			{
				"@type": "ImageObject",
				url: `${siteConfig.url}/screenshot-desktop.png`,
				width: 1280,
				height: 720,
			},
			{
				"@type": "ImageObject",
				url: `${siteConfig.url}/screenshot-mobile.png`,
				width: 750,
				height: 1334,
			},
		],
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
			contactType: "customer support",
			url: `${siteConfig.url}/contact`,
			availableLanguage: ["French", "English"],
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
 * Génère les données structurées HowTo pour le générateur de mots de passe
 */
export function generateHowToPasswordSchema(locale = "fr") {
	const content = {
		fr: {
			name: "Comment générer un mot de passe sécurisé avec SkromaPASS",
			description:
				"Créez un mot de passe fort et unique en quelques étapes simples avec l'outil gratuit SkromaPASS.",
			steps: [
				{
					name: "Choisir la longueur",
					text: "Sélectionnez une longueur d'au moins 16 caractères pour une sécurité optimale.",
				},
				{
					name: "Activer les types de caractères",
					text: "Cochez les majuscules, minuscules, chiffres et symboles pour maximiser la complexité.",
				},
				{
					name: "Générer le mot de passe",
					text: 'Cliquez sur le bouton "Générer" pour obtenir un mot de passe aléatoire et sécurisé.',
				},
				{
					name: "Copier et sauvegarder",
					text: "Copiez votre mot de passe et enregistrez-le dans votre coffre SkromaPASS.",
				},
			],
		},
		en: {
			name: "How to generate a secure password with SkromaPASS",
			description:
				"Create a strong, unique password in a few simple steps with the free SkromaPASS tool.",
			steps: [
				{
					name: "Choose the length",
					text: "Select a length of at least 16 characters for optimal security.",
				},
				{
					name: "Enable character types",
					text: "Check uppercase, lowercase, numbers and symbols to maximize complexity.",
				},
				{
					name: "Generate the password",
					text: 'Click the "Generate" button to get a random, secure password.',
				},
				{
					name: "Copy and save",
					text: "Copy your password and save it in your SkromaPASS vault.",
				},
			],
		},
	};
	const { name, description, steps } = content[locale] ?? content["fr"];
	return {
		"@context": "https://schema.org",
		"@type": "HowTo",
		name,
		description,
		tool: [{ "@type": "HowToTool", name: "SkromaPASS Password Generator" }],
		step: steps.map((s, i) => ({
			"@type": "HowToStep",
			position: i + 1,
			name: s.name,
			text: s.text,
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
