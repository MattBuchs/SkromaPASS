import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { auth } from "@/auth";
import GlobalTutorial from "@/components/GlobalTutorial";
import { siteConfig, generateMetadata as genMetadata } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata = {
    metadataBase: new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
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
        locale: "fr_FR",
        url: siteConfig.url,
        title: siteConfig.title,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage,
                width: 1200,
                height: 630,
                alt: siteConfig.title,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        images: [siteConfig.ogImage],
        creator: "@memkeypass",
        site: "@memkeypass",
    },
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon.svg", type: "image/svg+xml" },
        ],
        apple: "/apple-icon.png",
    },
    manifest: "/manifest.json",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 5,
    },
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#14b8a6" },
        { media: "(prefers-color-scheme: dark)", color: "#0d9488" },
    ],
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
        bing: process.env.NEXT_PUBLIC_BING_VERIFICATION,
    },
    alternates: {
        canonical: siteConfig.url,
    },
    category: "technology",
};

export default async function RootLayout({ children }) {
    const session = await auth();

    return (
        <html lang="fr" className={inter.variable}>
            <body className="antialiased font-sans">
                <Providers session={session}>
                    {children}
                    <GlobalTutorial />
                </Providers>
            </body>
        </html>
    );
}
