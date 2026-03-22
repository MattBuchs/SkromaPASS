import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Dashboard" : "Dashboard",
		description:
			locale === "en"
				? "Manage all your passwords in one place. Secure dashboard with search, filters and statistics."
				: "Gérez tous vos mots de passe en un seul endroit. Tableau de bord sécurisé avec recherche, filtres et statistiques.",
		robots: { index: false, follow: false },
	};
}

export default function DashboardLayout({ children }) {
	return <>{children}</>;
}
