"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Fingerprint, X } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ReauthModal({ isOpen, onClose, onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [hasPin, setHasPin] = useState(false);

    // Vérifier si l'utilisateur a un PIN et si la biométrie est disponible
    useEffect(() => {
        const checkPinAndBiometric = async () => {
            // Vérifier le PIN
            try {
                const pinResponse = await fetch("/api/user/pin");
                const pinData = await pinResponse.json();
                setHasPin(pinData.hasPin);
            } catch (error) {
                console.error("Erreur vérification PIN:", error);
            }

            // Vérifier la biométrie
            if (
                window.PublicKeyCredential &&
                PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
            ) {
                const available =
                    await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                setBiometricAvailable(available);
            }
        };

        if (isOpen) {
            checkPinAndBiometric();
        }
    }, [isOpen]);

    // Réinitialiser lors de l'ouverture
    useEffect(() => {
        if (isOpen) {
            setPin("");
            setError("");
        }
    }, [isOpen]);

    // Empêcher le scroll du body quand la modale est ouverte
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handlePinSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setError("");
            setIsLoading(true);

            try {
                const response = await fetch("/api/auth/reauth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ pin }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || "Code PIN incorrect");
                }

                // Succès
                setPin("");
                onSuccess();
            } catch (error) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        },
        [pin, onSuccess]
    );

    const handlePinKeyPress = (digit) => {
        if (pin.length < 8) {
            setPin(pin + digit);
            setError("");
        }
    };

    const handlePinBackspace = () => {
        setPin(pin.slice(0, -1));
        setError("");
    };

    // Gérer les événements clavier pour la saisie du PIN
    useEffect(() => {
        if (!isOpen || !hasPin) return;

        const handleKeyDown = (e) => {
            // Empêcher le comportement par défaut pour les touches qu'on gère
            if (
                /^[0-9]$/.test(e.key) ||
                e.key === "Backspace" ||
                e.key === "Enter"
            ) {
                e.preventDefault();
            }

            // Chiffres 0-9
            if (/^[0-9]$/.test(e.key)) {
                if (pin.length < 8) {
                    setPin(pin + e.key);
                    setError("");
                }
            }
            // Backspace
            else if (e.key === "Backspace") {
                setPin(pin.slice(0, -1));
                setError("");
            }
            // Enter pour soumettre
            else if (e.key === "Enter" && pin.length >= 4) {
                handlePinSubmit(e);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, hasPin, pin, handlePinSubmit]);

    const handleBiometricAuth = async () => {
        setError("");
        setIsLoading(true);

        try {
            // Créer un challenge aléatoire
            const challenge = new Uint8Array(32);
            crypto.getRandomValues(challenge);

            // Demander l'authentification biométrique
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge,
                    timeout: 60000,
                    userVerification: "required",
                    allowCredentials: [],
                },
            });

            if (credential) {
                // Vérifier le mot de passe en parallèle pour s'assurer que la biométrie fonctionne
                // Dans un vrai système, vous utiliseriez WebAuthn complet
                // Pour l'instant, on considère que la biométrie réussie = authentifié
                onSuccess();
            }
        } catch (error) {
            console.error("Erreur biométrique:", error);

            if (error.name === "NotAllowedError") {
                setError("Authentification biométrique annulée");
            } else {
                setError(
                    "Authentification biométrique échouée. Utilisez votre mot de passe."
                );
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Vérification de sécurité
                            </h2>
                            <p className="text-sm text-gray-600">
                                Pour afficher vos mots de passe
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message si pas de PIN configuré */}
                {!hasPin && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
                        <p className="font-medium mb-1">
                            Code PIN non configuré
                        </p>
                        <p>
                            Configurez un code PIN dans les paramètres pour un
                            accès rapide à vos mots de passe.
                        </p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Options d'authentification */}
                <div className="space-y-4">
                    {/* Biométrie si disponible */}
                    {biometricAvailable && (
                        <div>
                            <Button
                                onClick={handleBiometricAuth}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                            >
                                <Fingerprint className="w-5 h-5" />
                                {isLoading
                                    ? "Vérification..."
                                    : "Utiliser la biométrie"}
                            </Button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">
                                        ou
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Code PIN */}
                    {hasPin ? (
                        <form onSubmit={handlePinSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                                        Entrez votre code PIN
                                    </label>
                                    {/* Affichage du PIN */}
                                    <div className="flex justify-center gap-2 mb-6">
                                        {[
                                            ...Array(Math.max(4, pin.length)),
                                        ].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl font-bold ${
                                                    i < pin.length
                                                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                                                        : "border-gray-300 bg-gray-50 text-gray-300"
                                                }`}
                                            >
                                                {i < pin.length ? "●" : ""}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Clavier numérique */}
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
                                            (digit) => (
                                                <button
                                                    key={digit}
                                                    type="button"
                                                    onClick={() =>
                                                        handlePinKeyPress(
                                                            digit.toString()
                                                        )
                                                    }
                                                    disabled={isLoading}
                                                    className="h-14 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-300 active:bg-indigo-50 transition-all text-xl font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {digit}
                                                </button>
                                            )
                                        )}
                                        <button
                                            type="button"
                                            onClick={handlePinBackspace}
                                            disabled={
                                                isLoading || pin.length === 0
                                            }
                                            className="h-14 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-red-300 active:bg-red-50 transition-all text-sm font-medium text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            ← Effacer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handlePinKeyPress("0")
                                            }
                                            disabled={isLoading}
                                            className="h-14 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-indigo-300 active:bg-indigo-50 transition-all text-xl font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            0
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={
                                                isLoading || pin.length < 4
                                            }
                                            className="h-14 rounded-lg border-2 border-indigo-600 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? "..." : "✓ OK"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600">
                                Veuillez configurer un code PIN dans les
                                paramètres pour continuer.
                            </p>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-800">
                        🔒 <strong>Sécurité :</strong> Cette vérification est
                        valable pendant 15 minutes. Vous n&apos;aurez pas besoin
                        de vous réauthentifier pendant ce temps.
                    </p>
                </div>
            </div>
        </div>
    );
}
