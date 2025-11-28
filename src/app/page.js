"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EyeIcon from "@/components/icons/Eye";
import EyeSlashIcon from "@/components/icons/EyeSlash";
import CopyIcon from "@/components/icons/Copy";
import TrashIcon from "@/components/icons/Trash";
import LockIcon from "@/components/icons/Lock";

// Données exemple
const passwordsData = [
    {
        id: 1,
        name: "Google",
        username: "user@gmail.com",
        password: "SecurePass123!",
        website: "https://google.com",
        category: "Personnel",
        lastModified: "Il y a 2 jours",
        strength: "Fort",
        color: "bg-blue-500",
    },
    {
        id: 2,
        name: "Facebook",
        username: "john.doe@example.com",
        password: "Fb2024secure!",
        website: "https://facebook.com",
        category: "Social",
        lastModified: "Il y a 5 jours",
        strength: "Fort",
        color: "bg-blue-600",
    },
    {
        id: 3,
        name: "GitHub",
        username: "johndoe",
        password: "GitSecure456$",
        website: "https://github.com",
        category: "Développement",
        lastModified: "Il y a 1 semaine",
        strength: "Fort",
        color: "bg-gray-800",
    },
    {
        id: 4,
        name: "Netflix",
        username: "john.doe@example.com",
        password: "Netflix2024!",
        website: "https://netflix.com",
        category: "Divertissement",
        lastModified: "Il y a 3 jours",
        strength: "Moyen",
        color: "bg-red-600",
    },
    {
        id: 5,
        name: "Amazon",
        username: "john.doe@example.com",
        password: "AmazonPass789#",
        website: "https://amazon.com",
        category: "Shopping",
        lastModified: "Il y a 1 jour",
        strength: "Fort",
        color: "bg-orange-500",
    },
    {
        id: 6,
        name: "LinkedIn",
        username: "johndoe",
        password: "LinkedIn2024@",
        website: "https://linkedin.com",
        category: "Professionnel",
        lastModified: "Il y a 4 jours",
        strength: "Fort",
        color: "bg-blue-700",
    },
];

function PasswordCard({ password }) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card hover className="group">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    {/* Logo/Icon */}
                    <div
                        className={`w-12 h-12 ${password.color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    >
                        {password.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                {password.name}
                            </h3>
                            <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    password.strength === "Fort"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                }`}
                            >
                                {password.strength}
                            </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                            {password.username}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[rgb(var(--color-text-tertiary))]">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-primary))]"></span>
                                {password.category}
                            </span>
                            <span>Modifié {password.lastModified}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2"
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="p-2"
                    >
                        <CopyIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 text-[rgb(var(--color-error))]"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Password Display */}
            {showPassword && (
                <div className="mt-4 pt-4 border-t border-[rgb(var(--color-border))] animate-slide-down">
                    <div className="flex items-center justify-between bg-[rgb(var(--color-background))] rounded-lg p-3">
                        <code className="text-sm font-mono text-[rgb(var(--color-text-primary))]">
                            {password.password}
                        </code>
                        {copied && (
                            <span className="text-xs text-[rgb(var(--color-success))] font-medium">
                                Copié !
                            </span>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
}

export default function Home() {
    const [selectedCategory, setSelectedCategory] = useState("Tous");

    const categories = [
        "Tous",
        "Personnel",
        "Professionnel",
        "Social",
        "Shopping",
        "Divertissement",
        "Développement",
    ];

    const filteredPasswords =
        selectedCategory === "Tous"
            ? passwordsData
            : passwordsData.filter((p) => p.category === selectedCategory);

    return (
        <div className="min-h-screen">
            <Header />
            <Sidebar />

            {/* Main Content */}
            <main className="ml-64 mt-16 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                            Mes mots de passe
                        </h1>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Gérez tous vos mots de passe en un seul endroit
                            sécurisé
                        </p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-teal-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-teal-700 mb-1">
                                        Total des mots de passe
                                    </p>
                                    <p className="text-3xl font-bold text-teal-900">
                                        {passwordsData.length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                                    <LockIcon className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-green-700 mb-1">
                                        Mots de passe forts
                                    </p>
                                    <p className="text-3xl font-bold text-green-900">
                                        {
                                            passwordsData.filter(
                                                (p) => p.strength === "Fort"
                                            ).length
                                        }
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                    ✓
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-blue-700 mb-1">
                                        Score de sécurité
                                    </p>
                                    <p className="text-3xl font-bold text-blue-900">
                                        85%
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                    A
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() =>
                                        setSelectedCategory(category)
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                        selectedCategory === category
                                            ? "bg-[rgb(var(--color-primary))] text-white shadow-md"
                                            : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Passwords List */}
                    <div className="space-y-4">
                        {filteredPasswords.map((password) => (
                            <PasswordCard
                                key={password.id}
                                password={password}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredPasswords.length === 0 && (
                        <Card className="text-center py-12">
                            <LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-text-tertiary))] mb-4" />
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                Aucun mot de passe
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                                Aucun mot de passe trouvé dans cette catégorie
                            </p>
                            <Button variant="primary">
                                Ajouter un mot de passe
                            </Button>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
