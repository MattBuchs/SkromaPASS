import HomePageContent from "@/app/HomePageContent";
import { auth } from "@/auth";
import HeaderHome from "@/components/layout/HeaderHome";
import {
	createPageMetadata,
	generateOrganizationSchema,
	generateWebApplicationSchema,
	getMetadataLocale,
	siteConfig,
} from "@/lib/seo";
import Script from "next/script";

const pageContent = {
	fr: {
		title: "Gestionnaire de Mots de Passe Sécurisé & Gratuit",
		description:
			"SkromaPASS protège vos mots de passe avec un chiffrement AES-256 de niveau militaire. Générateur intégré, 2FA, organisation par dossiers. 100% gratuit et open-source.",
		keywords: [
			"gestionnaire mots de passe en ligne gratuit",
			"password manager français",
			"coffre fort numérique gratuit",
			"stocker mots de passe sécurisé",
			"application gestion mot de passe",
			"meilleur gestionnaire mdp",
			"sécuriser ses mots de passe",
		],
	},
	en: {
		title: "Free & Secure Password Manager",
		description:
			"SkromaPASS protects your passwords with military-grade AES-256 encryption. Built-in generator, 2FA, folder organization. 100% free and open-source.",
		keywords: [
			"free online password manager",
			"secure password manager",
			"free digital vault",
			"secure password storage",
			"password management app",
			"best password manager",
			"secure your passwords",
		],
	},
};

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const { title, description, keywords } = pageContent[locale];
	return createPageMetadata(
		{ title, description, keywords, canonical: siteConfig.url },
		locale,
	);
}

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
