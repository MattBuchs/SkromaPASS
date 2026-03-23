import { getMetadataLocale } from "@/lib/seo";

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	return {
		title: locale === "en" ? "Settings" : "Paramètres",
		description:
			locale === "en"
				? "Configure your SkromaPASS account. Profile, security, 2FA, PIN code and account management."
				: "Configurez votre compte SkromaPASS. Profil, sécurité, 2FA, code PIN et gestion du compte.",
		robots: { index: false, follow: false },
	};
}

export default function SettingsLayout({ children }) {
	return children;
}
