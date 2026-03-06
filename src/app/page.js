import Link from "next/link";
import Script from "next/script";
import { Lock, Shield, Key, Folder } from "lucide-react";
import Button from "@/components/ui/Button";
import { auth } from "@/auth";
import {
    generateWebApplicationSchema,
    generateOrganizationSchema,
} from "@/lib/seo";
import HeaderHome from "@/components/layout/HeaderHome";

export const metadata = {
    title: "MemKeyPass - Gestionnaire de Mots de Passe Sécurisé",
    description:
        "Gestionnaire de mots de passe open-source avec chiffrement AES-256, authentification 2FA, générateur de mots de passe sécurisés. Protégez vos identifiants en ligne gratuitement.",
    keywords: [
        "gestionnaire mots de passe gratuit",
        "password manager français",
        "chiffrement AES-256",
        "générateur mot de passe sécurisé",
        "2FA authentification",
        "coffre-fort numérique",
        "protection données en ligne",
        "sécurité en ligne",
        "mot de passe aléatoire",
    ],
    openGraph: {
        title: "MemKeyPass - Gestionnaire de Mots de Passe Sécurisé",
        description:
            "Protégez vos mots de passe avec un chiffrement militaire AES-256. Gratuit, open-source et sécurisé.",
        type: "website",
    },
};

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
            <div className="min-h-screen bg-linear-to-r from-indigo-50 via-white to-indigo-50">
                <HeaderHome />

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4">
                    <div className="container mx-auto max-w-6xl text-center">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Sécurité maximale garantie
                            </span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Vos mots de passe,
                            <br />
                            <span className="bg-linear-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
                                en toute sécurité
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            Gestionnaire de mots de passe moderne avec
                            chiffrement AES-256. Protégez vos accès en ligne
                            avec MemKeyPass.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                            {isAuthenticated ? (
                                <Link href="/dashboard">
                                    <Button
                                        variant="primary"
                                        className="text-lg px-8 py-4"
                                    >
                                        Accéder au Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/register"
                                        className="text-lg px-8 py-4 bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] focus:ring-[rgb(var(--color-primary))] shadow-sm hover:shadow-md w-full sm:w-auto rounded-md"
                                    >
                                        Commencer gratuitement
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="text-lg px-8 py-4 w-full sm:w-auto bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))] focus:ring-[rgb(var(--color-primary))] rounded-md"
                                    >
                                        Se connecter
                                    </Link>
                                </>
                            )}
                        </div>

                        {!isAuthenticated && (
                            <p className="text-sm text-gray-500 mt-4">
                                ✓ Aucune carte bancaire requise
                            </p>
                        )}
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 px-4 bg-white">
                    <div className="container mx-auto max-w-6xl">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Pourquoi choisir MemKeyPass ?
                            </h2>
                            <p className="text-lg text-gray-600">
                                Une solution complète pour gérer vos mots de
                                passe
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-linear-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 hover:shadow-lg transition-shadow">
                                <div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Shield className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Chiffrement AES-256
                                </h3>
                                <p className="text-gray-600">
                                    Vos données sont protégées par un
                                    chiffrement militaire. Personne ne peut
                                    accéder à vos mots de passe, même nous.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-linear-to-br from-teal-50 to-white p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-shadow">
                                <div className="bg-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Key className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Générateur sécurisé
                                </h3>
                                <p className="text-gray-600">
                                    Créez des mots de passe ultra-sécurisés en
                                    un clic. Fini les mots de passe faibles et
                                    répétitifs.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-linear-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
                                <div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                                    <Folder className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    Organisation intuitive
                                </h3>
                                <p className="text-gray-600">
                                    Organisez vos mots de passe par dossiers et
                                    catégories. Retrouvez rapidement ce que vous
                                    cherchez.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-12">
                                Rejoignez MemKeyPass aujourd&apos;hui !
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div>
                                    <div className="text-5xl font-bold mb-2">
                                        100%
                                    </div>
                                    <div className="text-indigo-200">
                                        Sécurisé
                                    </div>
                                </div>
                                <div>
                                    <div className="text-5xl font-bold mb-2">
                                        0€
                                    </div>
                                    <div className="text-indigo-200">
                                        Gratuit
                                    </div>
                                </div>
                                <div>
                                    <div className="text-5xl font-bold mb-2">
                                        24/7
                                    </div>
                                    <div className="text-indigo-200">
                                        Disponible
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 bg-white">
                    <div className="container mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Prêt à sécuriser vos mots de passe ?
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Créez votre compte gratuit en moins d&apos;une
                            minute.
                        </p>
                        <Link href="/register">
                            <Button
                                variant="primary"
                                className="text-lg px-8 py-4"
                            >
                                Commencer maintenant →
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-4 border-t border-gray-200 bg-gray-50">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8 mb-8">
                            {/* À propos */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    MemKeyPass
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Votre gestionnaire de mots de passe sécurisé
                                    et intuitif. Protégez vos données avec un
                                    chiffrement AES-256.
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-lg">
                                        <Lock className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        MemKeyPass
                                    </span>
                                </div>
                            </div>

                            {/* Liens rapides */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Navigation
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link
                                            href="/dashboard"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/generator"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Générateur
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/security"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Sécurité
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Légal */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Légal
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    <li>
                                        <Link
                                            href="/legal/mentions-legales"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Mentions légales
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/legal/politique-confidentialite"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Politique de confidentialité
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/legal/cgu"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            CGU
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/legal/politique-cookies"
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            Politique de cookies
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="pt-8 border-t border-gray-300 text-center">
                            <p className="text-sm text-gray-600">
                                © {new Date().getFullYear()} MemKeyPass. Tous droits réservés.
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Chiffrement AES-256 | RGPD Compliant | Hébergé
                                en Europe
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
