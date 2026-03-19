import HomePageContent from "@/app/HomePageContent";
import { auth } from "@/auth";
import HeaderHome from "@/components/layout/HeaderHome";
import {
	generateMetadata,
	generateOrganizationSchema,
	generateWebApplicationSchema,
	siteConfig,
} from "@/lib/seo";
import Script from "next/script";

export const metadata = generateMetadata({
	title: "Gestionnaire de Mots de Passe Sécurisé & Gratuit",
	description:
		"MemKeyPass protège vos mots de passe avec un chiffrement AES-256 de niveau militaire. Générateur intégré, 2FA, organisation par dossiers. 100% gratuit et open-source.",
	keywords: [
		"gestionnaire mots de passe en ligne gratuit",
		"password manager français",
		"coffre fort numérique gratuit",
		"stocker mots de passe sécurisé",
		"application gestion mot de passe",
		"meilleur gestionnaire mdp",
		"sécuriser ses mots de passe",
	],
	canonical: siteConfig.url,
});

export default async function HomePage() {
	const session = await auth();
	const isAuthenticated = !!session;

	const webAppSchema = generateWebApplicationSchema();
	const orgSchema = generateOrganizationSchema();
	return (
		<>
			<Script
				id="schema-webapp"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(webAppSchema),
				}}
			/>
			<Script
				id="schema-org"
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(orgSchema),
				}}
			/>
			<HeaderHome />
			<HomePageContent isAuthenticated={isAuthenticated} />
		</>
	);
}
