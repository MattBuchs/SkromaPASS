import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: "Breach Lab",
		description:
			locale === "en"
				? "Scan your passwords against known data breaches and verify a custom password in real-time."
				: "Scannez vos mots de passe contre les fuites connues et vérifiez un mot personnalisé en direct.",
		robots: { index: false, follow: false },
	};
}

export default function BreachLabLayout({ children }) {
	return children;
}
