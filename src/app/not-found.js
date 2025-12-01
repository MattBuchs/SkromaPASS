"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search, Lock } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Content */}
            <div className="flex items-center justify-center min-h-screen px-4 pt-20">
                <div className="max-w-2xl w-full text-center">
                    {/* Illustration avec le logo */}
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            {/* Cercles décoratifs en arrière-plan */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-64 h-64 bg-teal-100 rounded-full opacity-20 animate-pulse"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-48 h-48 bg-cyan-100 rounded-full opacity-30 animate-pulse delay-75"></div>
                            </div>

                            {/* Logo principal */}
                            <div className="relative bg-linear-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl shadow-2xl">
                                <Lock
                                    className="w-24 h-24 text-white"
                                    strokeWidth={1.5}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Code 404 */}
                    <div className="mb-6">
                        <h1 className="text-8xl md:text-9xl font-bold bg-linear-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent mb-2">
                            404
                        </h1>
                        <div className="h-1 w-24 bg-linear-to-r from-teal-500 to-cyan-600 rounded-full mx-auto"></div>
                    </div>

                    {/* Message */}
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Page non trouvée
                    </h2>

                    <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                        Oups ! La page que vous recherchez semble introuvable.
                        Elle a peut-être été déplacée ou n&apos;existe plus.
                    </p>

                    {/* Suggestions */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
                            <Search className="w-4 h-4 text-teal-500" />
                            Suggestions utiles
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                                Vérifiez l&apos;URL dans la barre d&apos;adresse
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                                Retournez à la page d&apos;accueil
                            </li>
                            <li className="flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                                Utilisez la navigation principale
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/">
                            <Button
                                variant="primary"
                                className="text-base px-6 py-3 flex items-center gap-2"
                            >
                                <Home className="w-5 h-5" />
                                Retour à l&apos;accueil
                            </Button>
                        </Link>
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200 cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Page précédente
                        </button>
                    </div>

                    {/* Footer link */}
                    <div className="mt-12 pt-8 border-t border-gray-200 mb-10">
                        <p className="text-sm text-gray-500">
                            Besoin d&apos;aide ?{" "}
                            <Link
                                href="/contact"
                                className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
                            >
                                Contactez-nous
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
