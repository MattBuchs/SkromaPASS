import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title:
			locale === "en" ? "Security Setup" : "Configuration de la sécurité",
		description:
			locale === "en"
				? "Set up two-factor authentication, PIN code and biometrics to secure your account."
				: "Configurez la double authentification, le code PIN et la biométrie pour sécuriser votre compte.",
	};
}

export default function OnboardingLayout({ children }) {
	return children;
}
