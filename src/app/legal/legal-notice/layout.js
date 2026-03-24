import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return createPageMetadata(
		{
			title: locale === "en" ? "Legal Notice" : "Mentions Légales",
			description:
				locale === "en"
					? "Legal information about SkromaPASS. Publisher, hosting and contact details."
					: "Informations légales concernant SkromaPASS. Éditeur, hébergement et coordonnées.",
			canonical: `${siteConfig.url}/legal/legal-notice`,
			noIndex: true,
		},
		locale,
	);
}

export default function LegalNoticeLayout({ children }) {
	return children;
}
