"use client";

import { useState, useEffect } from "react";
import { Lock, Key, AlertCircle, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PinCodeSettings() {
    const [hasPin, setHasPin] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSetup, setShowSetup] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        try {
            const response = await fetch("/api/user/pin");
            const data = await response.json();
            setHasPin(data.hasPin);
        } catch (error) {
            console.error("Erreur vérification PIN:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Validation
        if (pin.length < 4 || pin.length > 8) {
            setError("Le code PIN doit contenir entre 4 et 8 chiffres");
            return;
        }

        if (!/^\d+$/.test(pin)) {
            setError("Le code PIN ne doit contenir que des chiffres");
            return;
        }

        if (pin !== confirmPin) {
            setError("Les codes PIN ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/user/pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pin,
                    currentPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur lors de la configuration"
                );
            }

            setSuccess(
                hasPin
                    ? "Code PIN modifié avec succès"
                    : "Code PIN créé avec succès"
            );
            setHasPin(true);
            setShowSetup(false);
            setCurrentPassword("");
            setPin("");
            setConfirmPin("");
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer votre code PIN ?")) {
            return;
        }

        const password = prompt(
            "Entrez votre mot de passe principal pour confirmer :"
        );
        if (!password) return;

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/user/pin", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword: password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de la suppression");
            }

            setSuccess("Code PIN supprimé avec succès");
            setHasPin(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !showSetup) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Code PIN
                </h3>
                <p className="text-sm text-gray-600">
                    Configurez un code PIN rapide (4 à 8 chiffres) pour accéder
                    à vos mots de passe
                </p>
            </div>

            {/* Messages */}
            {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-sm">{success}</p>
                </div>
            )}

            {/* État actuel */}
            {!showSetup && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    hasPin
                                        ? "bg-green-100 text-green-600"
                                        : "bg-gray-100 text-gray-400"
                                }`}
                            >
                                <Key className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {hasPin
                                        ? "Code PIN configuré"
                                        : "Aucun code PIN"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {hasPin
                                        ? "Vous pouvez le modifier ou le supprimer"
                                        : "Créez un code PIN pour un accès rapide"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowSetup(true)}
                                variant="secondary"
                            >
                                {hasPin ? "Modifier" : "Créer un code PIN"}
                            </Button>
                            {hasPin && (
                                <Button
                                    onClick={handleDelete}
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Supprimer
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Formulaire de configuration */}
            {showSetup && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">
                                    Création d&apos;un code PIN
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700">
                                    <li>Entre 4 et 8 chiffres uniquement</li>
                                    <li>
                                        Plus rapide que le mot de passe
                                        principal
                                    </li>
                                    <li>
                                        Utilisé pour afficher vos mots de passe
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mot de passe principal
                        </label>
                        <Input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Pour confirmer votre identité
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nouveau code PIN
                        </label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="\d*"
                            value={pin}
                            onChange={(e) =>
                                setPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 8)
                                )
                            }
                            placeholder="4 à 8 chiffres"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmer le code PIN
                        </label>
                        <Input
                            type="password"
                            inputMode="numeric"
                            pattern="\d*"
                            value={confirmPin}
                            onChange={(e) =>
                                setConfirmPin(
                                    e.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 8)
                                )
                            }
                            placeholder="Répétez le code PIN"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading
                                ? "Configuration..."
                                : hasPin
                                ? "Modifier le code PIN"
                                : "Créer le code PIN"}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setShowSetup(false);
                                setCurrentPassword("");
                                setPin("");
                                setConfirmPin("");
                                setError("");
                            }}
                        >
                            Annuler
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
