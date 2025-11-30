export const metadata = {
    title: "Dashboard",
    description:
        "Gérez tous vos mots de passe en un seul endroit. Tableau de bord sécurisé avec recherche, filtres et statistiques.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function DashboardLayout({ children }) {
    return <>{children}</>;
}
