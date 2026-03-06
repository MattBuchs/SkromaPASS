import { generateMetadata, siteConfig } from "@/lib/seo";

export const metadata = generateMetadata({
    title: "Connexion à votre coffre-fort",
    description:
        "Connectez-vous à votre compte MemKeyPass pour accéder à vos mots de passe sécurisés. Authentification 2FA disponible.",
    canonical: `${siteConfig.url}/login`,
    noIndex: true,
});

export default function LoginLayout({ children }) {
    return children;
}
