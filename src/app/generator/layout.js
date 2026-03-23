import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const content = {
		fr: {
			title: "Générateur de Mot de Passe Sécurisé Gratuit",
			description:
				"Créez des mots de passe forts et aléatoires en un clic. Longueur personnalisable, caractères spéciaux, majuscules, chiffres. Outil gratuit, sans inscription et 100% sécurisé.",
			keywords: [
				"créer mot de passe fort",
				"password generator gratuit",
				"générateur mdp aléatoire",
				"mot de passe complexe en ligne",
				"générer mot de passe sécurisé",
				"outil mot de passe aléatoire",
			],
		},
		en: {
			title: "Free Secure Password Generator",
			description:
				"Create strong, random passwords in one click. Customizable length, special characters, uppercase letters, digits. Free tool, no registration required, 100% secure.",
			keywords: [
				"create strong password",
				"free password generator",
				"random password generator",
				"complex password online",
				"generate secure password",
				"random password tool",
			],
		},
	};
	const { title, description, keywords } = content[locale];
	return createPageMetadata(
		{
			title,
			description,
			keywords,
			canonical: `${siteConfig.url}/generator`,
		},
		locale,
	);
}

export default function GeneratorLayout({ children }) {
	return children;
}
