import { generateMetadata, siteConfig } from "@/lib/seo";

export const metadata = generateMetadata({
    title: "Générateur de Mot de Passe Sécurisé Gratuit",
    description:
        "Créez des mots de passe forts et aléatoires en un clic. Longueur personnalisable, caractères spéciaux, majuscules, chiffres. Outil gratuit, sans inscription et 100% sécurisé.",
    keywords: [
        "créer mot de passe fort",
        "password generator gratuit",
        "générateur mdp aléatoire",
        "mot de passe complexe en ligne",
        "générer mot de passe sécurisé",
        "outil mot de passe aléatoire",
    ],
    canonical: `${siteConfig.url}/generator`,
});

export default function GeneratorLayout({ children }) {
    return children;
}
