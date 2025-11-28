"use client";

import { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import LockIcon from "../icons/Lock";
import KeyIcon from "../icons/Key";

export default function AddPasswordModal({ isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        website: "",
        notes: "",
        categoryId: "",
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^A-Za-z0-9]/.test(password)) strength += 15;
        return Math.min(strength, 100);
    };

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const strength = calculatePasswordStrength(formData.password);
            const response = await fetch("/api/passwords", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    strength,
                }),
            });

            const data = await response.json();

            if (data.success) {
                onSuccess();
                handleClose();
            } else {
                alert("Erreur lors de l'ajout du mot de passe");
            }
        } catch (error) {
            console.error("Error adding password:", error);
            alert("Erreur lors de l'ajout du mot de passe");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            name: "",
            username: "",
            email: "",
            password: "",
            website: "",
            notes: "",
            categoryId: "",
        });
        setShowPassword(false);
        onClose();
    };

    if (!isOpen) return null;

    const passwordStrength = calculatePasswordStrength(formData.password);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
            <div className="bg-[rgb(var(--color-surface))] rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[rgb(var(--color-primary))] rounded-lg flex items-center justify-center">
                                <LockIcon className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                                Ajouter un mot de passe
                            </h2>
                        </div>
                        <button
                            onClick={handleClose}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <Input
                        label="Nom du site / service *"
                        placeholder="Google, Facebook, etc."
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nom d'utilisateur"
                            placeholder="johndoe"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />

                        <Input
                            label="Email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                Mot de passe *
                            </label>
                            <button
                                type="button"
                                onClick={generatePassword}
                                className="flex items-center gap-1 text-sm text-[rgb(var(--color-primary))] hover:underline"
                            >
                                <KeyIcon className="w-4 h-4" />
                                Générer
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe sécurisé"
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                }
                                required
                                className="block w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 pr-10 text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))]"
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-[rgb(var(--color-text-secondary))]">
                                        Force du mot de passe
                                    </span>
                                    <span
                                        className={`font-medium ${
                                            passwordStrength >= 70
                                                ? "text-[rgb(var(--color-success))]"
                                                : passwordStrength >= 40
                                                ? "text-[rgb(var(--color-warning))]"
                                                : "text-[rgb(var(--color-error))]"
                                        }`}
                                    >
                                        {passwordStrength >= 70
                                            ? "Fort"
                                            : passwordStrength >= 40
                                            ? "Moyen"
                                            : "Faible"}
                                    </span>
                                </div>
                                <div className="w-full bg-[rgb(var(--color-border))] rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            passwordStrength >= 70
                                                ? "bg-[rgb(var(--color-success))]"
                                                : passwordStrength >= 40
                                                ? "bg-[rgb(var(--color-warning))]"
                                                : "bg-[rgb(var(--color-error))]"
                                        }`}
                                        style={{
                                            width: `${passwordStrength}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Input
                        label="Site web"
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

                    <div>
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
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
                            className="block w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-[rgb(var(--color-text-primary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20"
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
                        <label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
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
                            rows={3}
                            className="block w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] px-4 py-2.5 text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20"
                        ></textarea>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgb(var(--color-border))]">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? "Ajout en cours..." : "Ajouter"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
