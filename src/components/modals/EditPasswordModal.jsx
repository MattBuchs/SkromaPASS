"use client";

import { useState, useEffect } from "react";
import { useCategories, useUpdatePassword, useFolders } from "@/hooks/useApi";
import Card from "../ui/Card";
import Input from "../ui/Input";
import Button from "../ui/Button";
import KeyIcon from "../icons/Key";
import EyeIcon from "../icons/Eye";
import EyeSlashIcon from "../icons/EyeSlash";

export default function EditPasswordModal({
    isOpen,
    onClose,
    onSave,
    password,
}) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        website: "",
        notes: "",
        categoryId: "",
        folderId: "",
        strength: 0,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const { data: categories = [] } = useCategories();
    const { data: folders = [] } = useFolders();
    const updatePasswordMutation = useUpdatePassword();

    // Charger les données du mot de passe lors de l'ouverture
    useEffect(() => {
        if (isOpen && password) {
            setFormData({
                name: password.name || "",
                username: password.username || "",
                email: password.email || "",
                password: password.password || "",
                website: password.website || "",
                notes: password.notes || "",
                categoryId: password.categoryId || "",
                folderId: password.folderId || "",
                strength: password.strength || 0,
            });
            setPasswordStrength(password.strength || 0);
        }
    }, [isOpen, passwordn]);

    // Calculer la force du mot de passe
    const calculatePasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength += 25;
        if (pwd.length >= 12) strength += 25;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
        if (/[0-9]/.test(pwd)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
        return Math.min(strength, 100);
    };

    // Générer un mot de passe sécurisé
    const generatePassword = () => {
        const length = 16;
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(
                Math.floor(Math.random() * charset.length)
            );
        }
        setFormData({ ...formData, password });
        setPasswordStrength(calculatePasswordStrength(password));
    };

    const handlePasswordChange = (e) => {
        const pwd = e.target.value;
        setFormData({ ...formData, password: pwd });
        setPasswordStrength(calculatePasswordStrength(pwd));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updatePasswordMutation.mutateAsync({
                id: password.id,
                ...formData,
                strength: passwordStrength,
            });

            onSave();
            onClose();
            // Réinitialiser le formulaire
            setFormData({
                name: "",
                username: "",
                email: "",
                password: "",
                website: "",
                notes: "",
                categoryId: "",
                strength: 0,
            });
            setPasswordStrength(0);
        } catch (error) {
            console.error("Error updating password:", error);
            alert("Erreur lors de la modification");
        }
    };

    if (!isOpen) return null;

    const getStrengthColor = () => {
        if (passwordStrength < 40) return "bg-red-500";
        if (passwordStrength < 70) return "bg-orange-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (passwordStrength < 40) return "Faible";
        if (passwordStrength < 70) return "Moyen";
        return "Fort";
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[rgb(var(--color-surface))] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
                <div className="sticky top-0 z-10 p-6 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
                            Modifier le mot de passe
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-6 overflow-y-auto flex-1"
                >
                    {/* Nom */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Nom du site / application *
                        </label>
                        <Input
                            type="text"
                            placeholder="Ex: Facebook, Gmail..."
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    {/* Catégorie et Dossier */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                Catégorie
                            </label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                            >
                                <option value="">Aucune catégorie</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                Dossier
                            </label>
                            <select
                                value={formData.folderId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        folderId: e.target.value,
                                    })
                                }
                                className="w-full px-4 py-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
                            >
                                <option value="">Aucun dossier</option>
                                {folders.map((folder) => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Nom d&apos;utilisateur
                        </label>
                        <Input
                            type="text"
                            placeholder="username123"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Mot de passe *
                        </label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handlePasswordChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>

                        {/* Barre de force */}
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                                    Force du mot de passe
                                </span>
                                <span
                                    className={`text-xs font-medium ${
                                        passwordStrength < 40
                                            ? "text-red-500"
                                            : passwordStrength < 70
                                            ? "text-orange-500"
                                            : "text-green-500"
                                    }`}
                                >
                                    {getStrengthLabel()}
                                </span>
                            </div>
                            <div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                    style={{ width: `${passwordStrength}%` }}
                                />
                            </div>
                        </div>

                        {/* Générer mot de passe */}
                        <button
                            type="button"
                            onClick={generatePassword}
                            className="mt-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-dark))] font-medium flex items-center gap-2"
                        >
                            <KeyIcon className="w-4 h-4" />
                            Générer un mot de passe sécurisé
                        </button>
                    </div>

                    {/* Site web */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Site web
                        </label>
                        <Input
                            type="url"
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    website: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                            Notes
                        </label>
                        <textarea
                            placeholder="Notes supplémentaires..."
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                })
                            }
                            rows={4}
                            className="w-full px-4 py-3 bg-[rgb(var(--color-bg-secondary))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors resize-none"
                        />
                    </div>
                </form>

                {/* Footer - Sticky */}
                <div className="sticky bottom-0 z-10 bg-[rgb(var(--color-surface))] border-t border-[rgb(var(--color-border))] px-6 py-4 rounded-b-2xl flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={updatePasswordMutation.isPending}
                        className="flex-1"
                    >
                        Annuler
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        disabled={updatePasswordMutation.isPending}
                        className="flex-1"
                        onClick={(e) => {
                            e.preventDefault();
                            const modalContainer = e.target.closest(".fixed");
                            const form = modalContainer?.querySelector("form");
                            if (form) form.requestSubmit();
                        }}
                    >
                        {updatePasswordMutation.isPending
                            ? "Modification..."
                            : "Modifier"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
