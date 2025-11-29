"use client";

import { useState } from "react";
import { useStats } from "@/hooks/useApi";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ShieldIcon from "@/components/icons/Shield";
import LockIcon from "@/components/icons/Lock";
import { AlertTriangle, Calendar } from "lucide-react";

export default function SecurityPage() {
    const { data: stats, isLoading: loading } = useStats();
    const { user } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getSecurityScoreColor = (score) => {
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getSecurityScoreLabel = (score) => {
        if (score >= 80) return "Excellente";
        if (score >= 60) return "Bonne";
        if (score >= 40) return "Moyenne";
        return "Faible";
    };

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

                    {/* Score de sécurité global */}
                    {stats && (
                        <Card className="mb-8 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                        Score de sécurité
                                    </h3>
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                        Basé sur la force de vos mots de passe
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div
                                        className={`text-5xl font-bold ${getSecurityScoreColor(
                                            stats.securityScore
                                        )}`}
                                    >
                                        {stats.securityScore}
                                        <span className="text-2xl">/100</span>
                                    </div>
                                    <p
                                        className={`text-sm font-medium ${getSecurityScoreColor(
                                            stats.securityScore
                                        )}`}
                                    >
                                        {getSecurityScoreLabel(
                                            stats.securityScore
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        stats.securityScore >= 80
                                            ? "bg-green-500"
                                            : stats.securityScore >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                    }`}
                                    style={{
                                        width: `${stats.securityScore}%`,
                                    }}
                                />
                            </div>
                        </Card>
                    )}

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-700 mb-1">
                                            Mots de passe forts
                                        </p>
                                        <p className="text-3xl font-bold text-green-900">
                                            {stats.strongPasswords}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Force ≥ 70%
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
                                            {stats.mediumPasswords || 0}
                                        </p>
                                        <p className="text-xs text-yellow-600 mt-1">
                                            40% ≤ Force &lt; 70%
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
                                        <p className="text-xs text-red-600 mt-1">
                                            Force &lt; 40%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        <AlertTriangle />
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-700 mb-1">
                                            Ajoutés ce mois
                                        </p>
                                        <p className="text-3xl font-bold text-blue-900">
                                            {stats.recentPasswords || 0}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-1">
                                            30 derniers jours
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        <Calendar />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Security Recommendations */}
                        <Card className="bg-blue-50 border-blue-200">
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
                                                Vous avez {stats.weakPasswords}{" "}
                                                mot
                                                {stats.weakPasswords > 1
                                                    ? "s"
                                                    : ""}{" "}
                                                de passe faible
                                                {stats.weakPasswords > 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                Nous vous recommandons de les
                                                renforcer
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {stats && stats.mediumPasswords > 0 && (
                                    <div className="flex items-start gap-3">
                                        <span className="text-2xl">💡</span>
                                        <div>
                                            <p className="font-medium text-yellow-900">
                                                {stats.mediumPasswords} mot
                                                {stats.mediumPasswords > 1
                                                    ? "s"
                                                    : ""}{" "}
                                                de passe moyen
                                                {stats.mediumPasswords > 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                            <p className="text-sm text-yellow-700">
                                                Ces mots de passe pourraient
                                                être améliorés
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">🔑</span>
                                    <div>
                                        <p className="font-medium text-blue-900">
                                            Utilisez le générateur
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            Créez des mots de passe uniques et
                                            sécurisés
                                        </p>
                                        <Link href="/generator">
                                            <Button
                                                variant="primary"
                                                className="mt-2 text-sm"
                                            >
                                                Générer un mot de passe
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Informations de sécurité */}
                        <Card className="bg-purple-50 border-purple-200">
                            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                                <LockIcon className="w-5 h-5" />
                                Informations de sécurité
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-purple-900">
                                            Chiffrement
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                            AES-256-GCM
                                        </span>
                                    </div>
                                    <p className="text-xs text-purple-700">
                                        Standard militaire pour la protection de
                                        vos données
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-purple-900">
                                            Dérivation de clé
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                            PBKDF2
                                        </span>
                                    </div>
                                    <p className="text-xs text-purple-700">
                                        100 000 itérations pour résister aux
                                        attaques par force brute
                                    </p>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-purple-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-purple-900">
                                            Votre session sur MemKeyPass
                                        </span>
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                            15 jours
                                        </span>
                                    </div>
                                    <p className="text-xs text-purple-700">
                                        Si vous restez inactif pendant 15 jours,
                                        vous devrez vous reconnecter pour des
                                        raisons de sécurité.
                                    </p>
                                </div>

                                {user && (
                                    <div className="bg-white p-4 rounded-lg border border-purple-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-purple-900">
                                                Compte
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                ✓ Actif
                                            </span>
                                        </div>
                                        <p className="text-xs text-purple-700">
                                            {user.email}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Bonnes pratiques */}
                    <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
                        <h3 className="text-lg font-semibold text-teal-900 mb-4">
                            📚 Bonnes pratiques de sécurité
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <span className="text-xl">1️⃣</span>
                                <div>
                                    <p className="font-medium text-teal-900 text-sm">
                                        Mots de passe uniques
                                    </p>
                                    <p className="text-xs text-teal-700">
                                        N&apos;utilisez jamais le même mot de
                                        passe pour plusieurs sites
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">2️⃣</span>
                                <div>
                                    <p className="font-medium text-teal-900 text-sm">
                                        Longueur minimale
                                    </p>
                                    <p className="text-xs text-teal-700">
                                        Privilégiez des mots de passe d&apos;au
                                        moins 12 caractères
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">3️⃣</span>
                                <div>
                                    <p className="font-medium text-teal-900 text-sm">
                                        Variété de caractères
                                    </p>
                                    <p className="text-xs text-teal-700">
                                        Mélangez majuscules, minuscules,
                                        chiffres et symboles
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-xl">4️⃣</span>
                                <div>
                                    <p className="font-medium text-teal-900 text-sm">
                                        Changement régulier
                                    </p>
                                    <p className="text-xs text-teal-700">
                                        Modifiez vos mots de passe importants
                                        tous les 3-6 mois
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
