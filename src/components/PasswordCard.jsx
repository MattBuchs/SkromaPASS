"use client";

import { useState } from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";
import EyeIcon from "./icons/Eye";
import EyeSlashIcon from "./icons/EyeSlash";
import CopyIcon from "./icons/Copy";
import TrashIcon from "./icons/Trash";
import EditIcon from "./icons/Edit";
import { useDeletePassword } from "@/hooks/useApi";

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

export default function PasswordCard({ password, onEdit }) {
    const [showPassword, setShowPassword] = useState(false);
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
