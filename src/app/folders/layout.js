import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Folders" : "Dossiers",
		description:
			locale === "en"
				? "Create and manage your password folders. Custom organization with colors."
				: "Créez et gérez vos dossiers de mots de passe. Organisation personnalisée avec couleurs.",
		robots: { index: false, follow: false },
	};
}

export default function FoldersLayout({ children }) {
	return children;
}
