import { generateMetadata, siteConfig } from "@/lib/seo";

export const metadata = generateMetadata({
    title: "Créer un compte gratuit",
    description:
        "Ouvrez votre compte MemKeyPass gratuitement. Protégez tous vos mots de passe avec un chiffrement AES-256. Inscription rapide, sans carte bancaire, open-source.",
    keywords: [
        "créer compte password manager gratuit",
        "inscription gestionnaire mots de passe",
        "coffre-fort numérique gratuit sans abonnement",
    ],
    canonical: `${siteConfig.url}/register`,
});

export default function RegisterLayout({ children }) {
    return children;
}
