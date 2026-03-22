import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const title = locale === "en" ? "Contact Us" : "Nous Contacter";
	const description =
		locale === "en"
			? "Have a question about MemKeyPass? Contact our team for any support request, bug report or suggestion about our free password manager."
			: "Une question sur MemKeyPass ? Contactez notre équipe pour toute demande d'assistance, signalement de bug ou suggestion concernant notre gestionnaire de mots de passe gratuit.";
	const keywords =
		locale === "en"
			? [
					"contact memkeypass",
					"support password manager",
					"help password manager",
				]
			: [
					"contact memkeypass",
					"support password manager",
					"aide gestionnaire mots de passe",
				];
	return createPageMetadata(
		{
			title,
			description,
			keywords,
			canonical: `${siteConfig.url}/contact`,
		},
		locale,
	);
}

export default function ContactLayout({ children }) {
	return children;
}
