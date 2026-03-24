import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return createPageMetadata(
		{
			title: locale === "en" ? "Cookie Policy" : "Politique de Cookies",
			description:
				locale === "en"
					? "Information about SkromaPASS's use of cookies. Essential cookies and your preferences management."
					: "Information sur l'utilisation des cookies par SkromaPASS. Cookies essentiels et gestion de vos préférences.",
			canonical: `${siteConfig.url}/legal/cookie-policy`,
			noIndex: true,
		},
		locale,
	);
}

export default function CookiePolicyLayout({ children }) {
	return children;
}
