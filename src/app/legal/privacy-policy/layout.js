import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return createPageMetadata(
		{
			title:
				locale === "en"
					? "Privacy Policy"
					: "Politique de Confidentialité",
			description:
				locale === "en"
					? "Find out how SkromaPASS protects your personal data. GDPR compliant, AES-256 encryption."
					: "Découvrez comment SkromaPASS protège vos données personnelles. RGPD compliant, chiffrement AES-256.",
			keywords:
				locale === "en"
					? ["GDPR", "personal data", "privacy", "data protection"]
					: [
							"RGPD",
							"données personnelles",
							"confidentialité",
							"vie privée",
						],
			canonical: `${siteConfig.url}/legal/privacy-policy`,
			noIndex: true,
		},
		locale,
	);
}

export default function PrivacyPolicyLayout({ children }) {
	return children;
}
