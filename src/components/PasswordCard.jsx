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
import ConfirmModal from "./modals/ConfirmModal";
import AlertModal from "./modals/AlertModal";
import ReauthModal from "./modals/ReauthModal";
import { useReauth } from "@/contexts/ReauthContext";

// Fonction pour obtenir le label de force
function getStrengthLabel(strength) {
    if (strength >= 70) return "Fort";
    if (strength >= 40) return "Moyen";
    return "Faible";
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

export default function PasswordCard({ password, onEdit }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [showReauthModal, setShowReauthModal] = useState(false);
    const deletePasswordMutation = useDeletePassword();
    const { isRecentlyAuthenticated, markAsAuthenticated } = useReauth();

    const handleTogglePassword = () => {
        // Si pas récemment authentifié, demander réauth
        if (!isRecentlyAuthenticated()) {
            setShowReauthModal(true);
            return;
        }

        // Sinon, afficher/masquer le mot de passe directement
        setShowPassword(!showPassword);
    };

    const handleReauthSuccess = () => {
        markAsAuthenticated();
        setShowReauthModal(false);
        setShowPassword(true);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        try {
            await deletePasswordMutation.mutateAsync(password.id);
        } catch (error) {
            console.error("Error deleting password:", error);
            setShowErrorAlert(true);
        }
    };

    const strengthLabel = getStrengthLabel(password.strength);
    const color = getColorForName(password.name);
    const timeAgo = getTimeAgo(password.updatedAt);

    return (
        <Card hover className="group">
            <div className="flex items-start justify-between relative">
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
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleTogglePassword}
                    >
                        {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                            <EyeIcon className="w-5 h-5" />
                        )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                        <CopyIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(password)}
                        className="text-[rgb(var(--color-primary))]"
                    >
                        <EditIcon className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={deletePasswordMutation.isPending}
                        className="text-[rgb(var(--color-error))] hover:text-red-600"
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

            {/* Modales */}
            <ReauthModal
                isOpen={showReauthModal}
                onClose={() => setShowReauthModal(false)}
                onSuccess={handleReauthSuccess}
            />
            <ConfirmModal
                isOpen={showConfirmDelete}
                onClose={() => setShowConfirmDelete(false)}
                onConfirm={handleDelete}
                title="Supprimer le mot de passe"
                message={`Êtes-vous sûr de vouloir supprimer "${password.name}" ? Cette action est irréversible.`}
                confirmText="Supprimer"
                variant="danger"
            />
            <AlertModal
                isOpen={showErrorAlert}
                onClose={() => setShowErrorAlert(false)}
                title="Erreur"
                message="Erreur lors de la suppression du mot de passe. Veuillez réessayer."
                variant="error"
            />
        </Card>
    );
}
