import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title:
			locale === "en" ? "Privacy Policy" : "Politique de Confidentialité",
		description:
			locale === "en"
				? "Find out how MemKeyPass protects your personal data. GDPR compliant, AES-256 encryption."
				: "Découvrez comment MemKeyPass protège vos données personnelles. RGPD compliant, chiffrement AES-256.",
		keywords:
			locale === "en"
				? ["GDPR", "personal data", "privacy", "data protection"]
				: [
						"RGPD",
						"données personnelles",
						"confidentialité",
						"vie privée",
					],
		robots: { index: false, follow: false },
	};
}

export default function PolitiqueConfidentialiteLayout({ children }) {
	return children;
}
