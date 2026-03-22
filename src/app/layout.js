import { auth } from "@/auth";
import GlobalTutorial from "@/components/GlobalTutorial";
import { Providers } from "@/components/providers/Providers";
import { getMetadataLocale, siteConfig } from "@/lib/seo";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const siteDescriptions = {
	fr: "Gestionnaire de mots de passe open-source avec chiffrement AES-256, authentification à deux facteurs (2FA), générateur de mots de passe sécurisés et organisation par dossiers.",
	en: "Open-source password manager with AES-256 encryption, two-factor authentication (2FA), secure password generator and folder-based organization.",
};

const siteTitles = {
	fr: "SkromaPASS - Gestionnaire de Mots de Passe Sécurisé",
	en: "SkromaPASS - Secure Password Manager",
};

export async function generateMetadata() {
	const locale = await getMetadataLocale();
	const title = siteTitles[locale];
	const description = siteDescriptions[locale];
	const ogLocale = locale === "en" ? "en_US" : "fr_FR";

	return {
		metadataBase: new URL(siteConfig.url),
		title: {
			default: title,
			template: `%s | ${siteConfig.name}`,
		},
		description,
		keywords: siteConfig.keywords,
		authors: [siteConfig.author],
		creator: siteConfig.author.name,
		publisher: siteConfig.author.name,
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				"max-video-preview": -1,
				"max-image-preview": "large",
				"max-snippet": -1,
			},
		},
		openGraph: {
			type: "website",
			locale: ogLocale,
			url: siteConfig.url,
			title,
			description,
			siteName: siteConfig.name,
			images: [
				{
					url: siteConfig.ogImage,
					width: 512,
					height: 512,
					alt: title,
				},
			],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: [siteConfig.ogImage],
			creator: "@skromapass",
			site: "@skromapass",
		},
		icons: {
			icon: [
				{ url: "/favicon.ico", sizes: "any" },
				{ url: "/icon-192.png", type: "image/png", sizes: "192x192" },
				{ url: "/icon-512.png", type: "image/png", sizes: "512x512" },
			],
			apple: "/apple-icon.png",
		},
		manifest: "/manifest.json",
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
			yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
			bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
		},
		category: "technology",
	};
}

// Viewport et themeColor doivent être exportés séparément dans Next.js App Router
export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export const themeColor = [
	{ media: "(prefers-color-scheme: light)", color: "#14b8a6" },
	{ media: "(prefers-color-scheme: dark)", color: "#0d9488" },
];

export default async function RootLayout({ children }) {
	const session = await auth();
	const cookieStore = await cookies();
	const localeCookie = cookieStore.get("mkp_locale")?.value;
	const lang = localeCookie === "en" ? "en" : "fr";

	return (
		<html lang={lang} className={inter.variable}>
			<body className="antialiased font-sans">
				<Providers session={session}>
					{children}
					<GlobalTutorial />
				</Providers>
				{process.env.NODE_ENV === "production" &&
					process.env.NEXT_PUBLIC_CF_BEACON_TOKEN && (
						<Script
							defer
							src="https://static.cloudflareinsights.com/beacon.min.js"
							data-cf-beacon={JSON.stringify({
								token: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN,
							})}
							strategy="afterInteractive"
						/>
					)}
			</body>
		</html>
	);
}
