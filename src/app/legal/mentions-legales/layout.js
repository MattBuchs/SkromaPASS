import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Legal Notice" : "Mentions Légales",
		description:
			locale === "en"
				? "Legal information about SkromaPASS. Publisher, hosting and contact details."
				: "Informations légales concernant SkromaPASS. Éditeur, hébergement et coordonnées.",
		robots: { index: false, follow: false },
	};
}

export default function MentionsLegalesLayout({ children }) {
	return children;
}
