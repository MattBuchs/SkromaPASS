import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const content = {
		fr: {
			title: "Créer un compte gratuit",
			description:
				"Ouvrez votre compte SkromaPASS gratuitement. Protégez tous vos mots de passe avec un chiffrement AES-256. Inscription rapide, sans carte bancaire, open-source.",
			keywords: [
				"créer compte password manager gratuit",
				"inscription gestionnaire mots de passe",
				"coffre-fort numérique gratuit sans abonnement",
			],
		},
		en: {
			title: "Create a free account",
			description:
				"Open your SkromaPASS account for free. Protect all your passwords with AES-256 encryption. Fast registration, no credit card, open-source.",
			keywords: [
				"create free password manager account",
				"sign up password manager",
				"free digital vault no subscription",
			],
		},
	};
	const { title, description, keywords } = content[locale];
	return createPageMetadata(
		{
			title,
			description,
			keywords,
			canonical: `${siteConfig.url}/register`,
		},
		locale,
	);
}

export default function RegisterLayout({ children }) {
	return children;
}
