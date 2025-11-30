import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-16 py-8 px-4 border-t border-gray-200 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    {/* Liens rapides */}
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">
                            Navigation
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/dashboard"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/generator"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Générateur
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/security"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Sécurité
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/settings"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Paramètres
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Légal */}
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">
                            Légal
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/legal/mentions-legales"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Mentions légales
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/legal/politique-confidentialite"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/legal/cgu"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    CGU
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Info */}
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm mb-3">
                            Sécurité
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    href="/legal/politique-cookies"
                                    className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                                >
                                    Cookies
                                </Link>
                            </li>
                            <li className="text-xs text-gray-600">
                                🔒 Chiffrement AES-256
                            </li>
                            <li className="text-xs text-gray-600">
                                🇪🇺 RGPD Compliant
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        © 2025 MemKeyPass. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
}
