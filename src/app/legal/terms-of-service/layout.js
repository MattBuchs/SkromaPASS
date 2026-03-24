import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return createPageMetadata(
		{
			title:
				locale === "en"
					? "Terms of Service"
					: "Conditions Générales d'Utilisation (CGU)",
			description:
				locale === "en"
					? "Terms of service for SkromaPASS. Rights and obligations of users."
					: "Conditions générales d'utilisation de SkromaPASS. Droits et obligations des utilisateurs.",
			canonical: `${siteConfig.url}/legal/terms-of-service`,
			noIndex: true,
		},
		locale,
	);
}

export default function TermsOfServiceLayout({ children }) {
	return children;
}
