"use client";

import { useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EyeIcon from "@/components/icons/Eye";
import EyeSlashIcon from "@/components/icons/EyeSlash";
import CopyIcon from "@/components/icons/Copy";
import TrashIcon from "@/components/icons/Trash";
import EditIcon from "@/components/icons/Edit";
import LockIcon from "@/components/icons/Lock";
import SearchIcon from "@/components/icons/Search";
import PlusIcon from "@/components/icons/Plus";
import AddPasswordModal from "@/components/modals/AddPasswordModal";
import EditPasswordModal from "@/components/modals/EditPasswordModal";
import {
    usePasswords,
    useCategories,
    useStats,
    useDeletePassword,
} from "@/hooks/useApi";

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

function PasswordCard({ password, onEdit }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const deletePasswordMutation = useDeletePassword();

    const handleCopy = () => {
        navigator.clipboard.writeText(password.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer "${password.name}" ?`))
            return;

        try {
            await deletePasswordMutation.mutateAsync(password.id);
        } catch (error) {
            console.error("Error deleting password:", error);
            alert("Erreur lors de la suppression");
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
                        className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0`}
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

                        {/* Username/Email */}
                        {(password.username || password.email) && (
                            <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
                                {password.username || password.email}
                            </p>
                        )}

                        {/* Website */}
                        {password.website && (
                            <a
                                href={
                                    password.url ||
                                    `https://${password.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-[rgb(var(--color-primary))] hover:underline mb-2 inline-block"
                            >
                                {password.website}
                            </a>
                        )}

                        <div className="flex items-center gap-4 text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                            {password.category && (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-[rgb(var(--color-primary))]"></span>
                                    {password.category.name}
                                </span>
                            )}
                            {password.folder && (
                                <span className="flex items-center gap-1">
                                    📁 {password.folder.name}
                                </span>
                            )}
                            <span>Modifié {timeAgo}</span>
                        </div>

                        {/* Notes - Expandable */}
                        {password.notes && (
                            <div className="mt-3">
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                                >
                                    {showDetails ? "▼" : "▶"} Notes
                                </button>
                                {showDetails && (
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2 p-3 bg-[rgb(var(--color-background))] rounded-md border border-[rgb(var(--color-border))]">
                                        {password.notes}
                                    </p>
                                )}
                            </div>
                        )}
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
                        onClick={() => onEdit(password)}
                        className="p-2 text-[rgb(var(--color-primary))]"
                    >
                        <EditIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDelete}
                        disabled={deletePasswordMutation.isPending}
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
    const { data: passwords = [], isLoading: loadingPasswords } =
        usePasswords();
    const { data: categories = [] } = useCategories();
    const { data: stats } = useStats();

    const [selectedCategory, setSelectedCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPassword, setEditingPassword] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const loading = loadingPasswords;

    const handleEditPassword = (password) => {
        setEditingPassword(password);
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = () => {
        // React Query invalidera automatiquement les données
    };

    // Filtrer par catégorie et recherche
    const filteredPasswords = useMemo(() => {
        let filtered = passwords;

        // Filtrer par catégorie
        if (selectedCategory !== "Tous") {
            filtered = filtered.filter(
                (p) => p.category?.name === selectedCategory
            );
        }

        // Filtrer par recherche (nom, website, url)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.name?.toLowerCase().includes(query) ||
                    p.website?.toLowerCase().includes(query) ||
                    p.url?.toLowerCase().includes(query)
            );
        }

        return filtered;
    }, [passwords, selectedCategory, searchQuery]);

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
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
                                    Mes mots de passe
                                </h1>
                                <p className="text-[rgb(var(--color-text-secondary))]">
                                    Gérez tous vos mots de passe en un seul
                                    endroit sécurisé
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="flex items-center gap-2"
                                onClick={() => setIsModalOpen(true)}
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span>Ajouter un mot de passe</span>
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom, site web ou URL..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-md text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                            />
                        </div>
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
                                    onEdit={handleEditPassword}
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

            {/* Modals */}
            <AddPasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
            />

            <EditPasswordModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingPassword(null);
                }}
                onSave={handleSaveEdit}
                password={editingPassword}
                categories={categories}
            />
        </div>
    );
}
