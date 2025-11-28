import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

export const metadata = {
    title: "MemKeyPass - Gestionnaire de mots de passe sécurisé",
    description:
        "Gérez vos mots de passe en toute sécurité avec MemKeyPass. Chiffrement AES-256, générateur de mots de passe, et synchronisation sécurisée.",
    keywords:
        "gestionnaire mots de passe, sécurité, chiffrement, password manager",
};

export default function RootLayout({ children }) {
    return (
        <html lang="fr" className={inter.variable}>
            <body className="antialiased font-sans">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
