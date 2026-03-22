import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title:
			locale === "en"
				? "Terms of Service"
				: "Conditions Générales d'Utilisation (CGU)",
		description:
			locale === "en"
				? "Terms of service for SkromaPASS. Rights and obligations of users."
				: "Conditions générales d'utilisation de SkromaPASS. Droits et obligations des utilisateurs.",
		robots: { index: false, follow: false },
	};
}

export default function CGULayout({ children }) {
	return children;
}
