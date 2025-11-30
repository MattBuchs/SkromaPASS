"use client";

import { useState } from "react";
import { Scale, Mail, Building2, User } from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function MentionsLegalesPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* En-tête */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                                <Scale className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Mentions Légales
                                </h1>
                                <p className="text-gray-600 mt-1">
                                    Informations légales concernant MemKeyPass
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenu */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
                        {/* Éditeur du site */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                Éditeur du site
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>Nom du site :</strong> MemKeyPass
                                </p>
                                <p>
                                    <strong>Propriétaire :</strong> [Votre Nom /
                                    Raison Sociale]
                                </p>
                                <p>
                                    <strong>Statut juridique :</strong>{" "}
                                    [Auto-entrepreneur / SARL / SAS / etc.]
                                </p>
                                <p>
                                    <strong>Siège social :</strong> [Adresse
                                    complète]
                                </p>
                                <p>
                                    <strong>SIRET :</strong> [Numéro SIRET]
                                </p>
                                <p>
                                    <strong>Email :</strong>{" "}
                                    <a
                                        href="mailto:support@memkeypass.fr"
                                        className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                        support@memkeypass.fr
                                    </a>
                                </p>
                            </div>
                        </section>

                        {/* Directeur de publication */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-600" />
                                Directeur de publication
                            </h2>
                            <p className="text-gray-700">
                                <strong>Nom :</strong> [Nom du directeur de
                                publication]
                            </p>
                        </section>

                        {/* Hébergement */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Hébergement
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>Hébergeur :</strong> Vercel Inc.
                                </p>
                                <p>
                                    <strong>Adresse :</strong> 340 S Lemon Ave
                                    #4133, Walnut, CA 91789, USA
                                </p>
                                <p>
                                    <strong>Site web :</strong>{" "}
                                    <a
                                        href="https://vercel.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                        vercel.com
                                    </a>
                                </p>
                            </div>
                        </section>

                        {/* Base de données */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Hébergement de la base de données
                            </h2>
                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>Hébergeur :</strong> Supabase Inc.
                                </p>
                                <p>
                                    <strong>Adresse :</strong> 970 Toa Payoh
                                    North, #07-04, Singapore 318992
                                </p>
                                <p>
                                    <strong>Site web :</strong>{" "}
                                    <a
                                        href="https://supabase.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                        supabase.com
                                    </a>
                                </p>
                                <p className="text-sm text-gray-600 mt-2">
                                    Les données sont hébergées dans la région
                                    EU-WEST-1 (Irlande) et sont conformes au
                                    RGPD.
                                </p>
                            </div>
                        </section>

                        {/* Propriété intellectuelle */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Propriété intellectuelle
                            </h2>
                            <p className="text-gray-700 mb-3">
                                L&apos;ensemble du contenu de ce site (textes,
                                images, vidéos, logos, icônes) est la propriété
                                exclusive de MemKeyPass, sauf mention contraire.
                            </p>
                            <p className="text-gray-700">
                                Toute reproduction, représentation,
                                modification, publication ou adaptation de tout
                                ou partie des éléments du site, quel que soit le
                                moyen ou le procédé utilisé, est interdite, sauf
                                autorisation écrite préalable.
                            </p>
                        </section>

                        {/* Données personnelles */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Protection des données personnelles
                            </h2>
                            <p className="text-gray-700 mb-3">
                                MemKeyPass s&apos;engage à respecter la
                                confidentialité de vos données personnelles
                                conformément au Règlement Général sur la
                                Protection des Données (RGPD).
                            </p>
                            <p className="text-gray-700">
                                Pour en savoir plus, consultez notre{" "}
                                <a
                                    href="/legal/politique-confidentialite"
                                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                                >
                                    Politique de confidentialité
                                </a>
                                .
                            </p>
                        </section>

                        {/* Cookies */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Cookies
                            </h2>
                            <p className="text-gray-700">
                                Ce site utilise des cookies uniquement pour
                                assurer son bon fonctionnement et améliorer
                                votre expérience utilisateur. Pour plus
                                d&apos;informations, consultez notre{" "}
                                <a
                                    href="/legal/politique-cookies"
                                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                                >
                                    Politique de cookies
                                </a>
                                .
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Mail className="w-5 h-5 text-indigo-600" />
                                Contact
                            </h2>
                            <p className="text-gray-700 mb-2">
                                Pour toute question concernant ces mentions
                                légales, vous pouvez nous contacter :
                            </p>
                            <ul className="space-y-1 text-gray-700">
                                <li>
                                    • Par email :{" "}
                                    <a
                                        href="mailto:support@memkeypass.fr"
                                        className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                        support@memkeypass.fr
                                    </a>
                                </li>
                                <li>
                                    • Via notre{" "}
                                    <a
                                        href="/contact"
                                        className="text-indigo-600 hover:text-indigo-700 underline"
                                    >
                                        formulaire de contact
                                    </a>
                                </li>
                            </ul>
                        </section>

                        {/* Dernière mise à jour */}
                        <div className="pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Dernière mise à jour : 30 novembre 2025
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
