import { createPageMetadata, getMetadataLocale, siteConfig } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const title =
		locale === "en"
			? "Log in to your vault"
			: "Connexion à votre coffre-fort";
	const description =
		locale === "en"
			? "Log in to your MemKeyPass account to access your secured passwords. 2FA authentication available."
			: "Connectez-vous à votre compte MemKeyPass pour accéder à vos mots de passe sécurisés. Authentification 2FA disponible.";
	return createPageMetadata(
		{
			title,
			description,
			canonical: `${siteConfig.url}/login`,
			noIndex: true,
		},
		locale,
	);
}

export default function LoginLayout({ children }) {
	return children;
}
