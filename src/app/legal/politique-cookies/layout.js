import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Cookie Policy" : "Politique de Cookies",
		description:
			locale === "en"
				? "Information about MemKeyPass's use of cookies. Essential cookies and your preferences management."
				: "Information sur l'utilisation des cookies par MemKeyPass. Cookies essentiels et gestion de vos préférences.",
		robots: { index: false, follow: false },
	};
}

export default function PolitiqueCookiesLayout({ children }) {
	return children;
}
