"use client";

import { useState } from "react";
import { useStats } from "@/hooks/useApi";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ShieldIcon from "@/components/icons/Shield";
import LockIcon from "@/components/icons/Lock";

export default function SecurityPage() {
    const { data: stats, isLoading: loading } = useStats();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <ShieldIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
                            <p className="text-[rgb(var(--color-text-secondary))]">
                                Chargement...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
                                Tableau de bord sécurité
                            </h1>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Surveillez la sécurité de vos mots de passe et
                            l&apos;activité de votre compte
                        </p>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 mb-1">
                                            Mots de passe forts
                                        </p>
                                        <p className="text-3xl font-bold text-green-900">
                                            {stats.strongPasswords}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        ✓
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-yellow-700 mb-1">
                                            Mots de passe moyens
                                        </p>
                                        <p className="text-3xl font-bold text-yellow-900">
                                            {stats.mediumPasswords}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        !
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-linear-to-br from-red-50 to-rose-50 border-red-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-700 mb-1">
                                            Mots de passe faibles
                                        </p>
                                        <p className="text-3xl font-bold text-red-900">
                                            {stats.weakPasswords}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        ⚠
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-linear-to-br from-purple-50 to-violet-50 border-purple-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-700 mb-1">
                                            Chiffrement
                                        </p>
                                        <p className="text-lg font-bold text-purple-900">
                                            AES-256-GCM
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                                        <LockIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Security Recommendations */}
                    <Card className="mb-8 bg-blue-50 border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">
                            🛡️ Recommandations de sécurité
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">✓</span>
                                <div>
                                    <p className="font-medium text-blue-900">
                                        Tous vos mots de passe sont chiffrés
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Chiffrement AES-256-GCM avec PBKDF2
                                        (100k itérations)
                                    </p>
                                </div>
                            </div>
                            {stats && stats.weakPasswords > 0 && (
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">⚠️</span>
                                    <div>
                                        <p className="font-medium text-yellow-900">
                                            Vous avez {stats.weakPasswords} mot
                                            {stats.weakPasswords > 1
                                                ? "s"
                                                : ""}{" "}
                                            de passe faible
                                            {stats.weakPasswords > 1 ? "s" : ""}
                                        </p>
                                        <p className="text-sm text-yellow-700">
                                            Nous vous recommandons de les
                                            renforcer
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">💡</span>
                                <div>
                                    <p className="font-medium text-blue-900">
                                        Utilisez le générateur de mots de passe
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Créez des mots de passe uniques et
                                        sécurisés automatiquement
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
