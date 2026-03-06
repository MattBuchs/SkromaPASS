import { generateMetadata, siteConfig } from "@/lib/seo";

export const metadata = generateMetadata({
    title: "Nous Contacter",
    description:
        "Une question sur MemKeyPass ? Contactez notre équipe pour toute demande d'assistance, signalement de bug ou suggestion concernant notre gestionnaire de mots de passe gratuit.",
    keywords: ["contact memkeypass", "support password manager", "aide gestionnaire mots de passe"],
    canonical: `${siteConfig.url}/contact`,
});

export default function ContactLayout({ children }) {
    return children;
}
