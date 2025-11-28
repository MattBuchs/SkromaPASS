"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EyeIcon from "@/components/icons/Eye";
import EyeSlashIcon from "@/components/icons/EyeSlash";
import CopyIcon from "@/components/icons/Copy";
import TrashIcon from "@/components/icons/Trash";
import LockIcon from "@/components/icons/Lock";
import AddPasswordModal from "@/components/modals/AddPasswordModal";

// Fonction pour calculer le temps écoulé
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
        an: 31536000,
        mois: 2592000,
        semaine: 604800,
        jour: 86400,
        heure: 3600,
        minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `Il y a ${interval} ${unit}${
                interval > 1 && unit !== "mois" ? "s" : ""
            }`;
        }
    }
    return "À l'instant";
}

// Fonction pour obtenir la couleur selon le nom
function getColorForName(name) {
    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-pink-500",
        "bg-red-500",
        "bg-orange-500",
        "bg-yellow-500",
        "bg-green-500",
        "bg-teal-500",
        "bg-cyan-500",
        "bg-indigo-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

// Fonction pour obtenir le label de force
function getStrengthLabel(strength) {
    if (strength >= 70) return "Fort";
    if (strength >= 40) return "Moyen";
    return "Faible";
}

function PasswordCard({ password, onDelete }) {
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(password.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${password.name}" ?`))
            return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/passwords/${password.id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                onDelete(password.id);
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            console.error("Error deleting password:", error);
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const strengthLabel = getStrengthLabel(password.strength);
    const color = getColorForName(password.name);
    const timeAgo = getTimeAgo(password.updatedAt);

    return (
        <Card hover className="group">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    {/* Logo/Icon */}
                    <div
                        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md`}
                    >
                        {password.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                {password.name}
                            </h3>
                            <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    strengthLabel === "Fort"
                                        ? "bg-green-100 text-green-700"
                                        : strengthLabel === "Moyen"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {strengthLabel}
                            </span>
                        </div>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-2">
                            {password.username ||
                                password.email ||
                                "Aucun identifiant"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[rgb(var(--color-text-tertiary))]">
                            {password.category && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-primary))]"></span>
                                    {password.category.name}
                                </span>
                            )}
                            <span>Modifié {timeAgo}</span>
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
                        onClick={handleDelete}
                        disabled={isDeleting}
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
    const [passwords, setPasswords] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Charger les données au montage
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [passwordsRes, categoriesRes, statsRes] = await Promise.all([
                fetch("/api/passwords"),
                fetch("/api/categories"),
                fetch("/api/stats"),
            ]);

            const passwordsData = await passwordsRes.json();
            const categoriesData = await categoriesRes.json();
            const statsData = await statsRes.json();

            if (passwordsData.success) {
                setPasswords(passwordsData.data);
            }
            if (categoriesData.success) {
                setCategories(categoriesData.data);
            }
            if (statsData.success) {
                setStats(statsData.data);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePassword = (id) => {
        setPasswords(passwords.filter((p) => p.id !== id));
        loadData(); // Recharger les stats
    };

    const filteredPasswords =
        selectedCategory === "Tous"
            ? passwords
            : passwords.filter((p) => p.category?.name === selectedCategory);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
                    <p className="text-[rgb(var(--color-text-secondary))]">
                        Chargement...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header onAddPassword={() => setIsModalOpen(true)} />
            <Sidebar />
            <AddPasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={loadData}
            />

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
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-teal-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-teal-700 mb-1">
                                            Total des mots de passe
                                        </p>
                                        <p className="text-3xl font-bold text-teal-900">
                                            {stats.totalPasswords}
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
                                            {stats.strongPasswords}
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
                                            {stats.securityScore}%
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                                        {stats.securityScore >= 80
                                            ? "A"
                                            : stats.securityScore >= 60
                                            ? "B"
                                            : "C"}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory("Tous")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                    selectedCategory === "Tous"
                                        ? "bg-[rgb(var(--color-primary))] text-white shadow-md"
                                        : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
                                }`}
                            >
                                Tous
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() =>
                                        setSelectedCategory(category.name)
                                    }
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                        selectedCategory === category.name
                                            ? "bg-[rgb(var(--color-primary))] text-white shadow-md"
                                            : "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Passwords List */}
                    {filteredPasswords.length > 0 ? (
                        <div className="space-y-4">
                            {filteredPasswords.map((password) => (
                                <PasswordCard
                                    key={password.id}
                                    password={password}
                                    onDelete={handleDeletePassword}
                                />
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-text-tertiary))] mb-4" />
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                Aucun mot de passe
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                                {selectedCategory === "Tous"
                                    ? "Commencez par ajouter votre premier mot de passe"
                                    : `Aucun mot de passe trouvé dans la catégorie "${selectedCategory}"`}
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setIsModalOpen(true)}
                            >
                                Ajouter un mot de passe
                            </Button>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
