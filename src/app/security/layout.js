import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Security" : "Sécurité",
		description:
			locale === "en"
				? "Analyze your password security. Security score, weak passwords, and recommendations."
				: "Analysez la sécurité de vos mots de passe. Score de sécurité, mots de passe faibles, et recommandations.",
		robots: { index: false, follow: false },
	};
}

export default function SecurityLayout({ children }) {
	return children;
}
