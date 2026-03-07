"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Lock, Fingerprint, X } from "lucide-react";
import Button from "@/components/ui/Button";

// ─── Base64url helpers ──────────────────────────────────────────────────────
function base64urlToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    const rem = base64.length % 4;
    const padded = rem === 0 ? base64 : base64 + "=".repeat(4 - rem);
    const str = atob(padded);
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
    return buf.buffer;
}

function bufferToBase64url(buffer) {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ReauthModal({ isOpen, onClose, onSuccess }) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // biometricAvailable = hardware support + at least one registered credential
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [hasPin, setHasPin] = useState(false);
    const [showPinFallback, setShowPinFallback] = useState(false);
    // Prevent auto-triggering biometric twice if the modal re-renders
    const autoTriggeredRef = useRef(false);

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

            // Vérifier si cet appareil spécifique a un credential enregistré.
            // On compare les IDs stockés en localStorage (ajoutés lors de
            // l'enregistrement depuis cet appareil) avec la liste en DB.
            // Ainsi, un PC sans empreinte ne déclenchera jamais le prompt même
            // si le compte a des credentials enregistrés sur d'autres appareils.
            if (window.PublicKeyCredential) {
                try {
                    const storedIds = JSON.parse(
                        localStorage.getItem("wa_device_cred_ids") || "[]"
                    );
                    if (storedIds.length === 0) {
                        setBiometricAvailable(false);
                    } else {
                        const credsRes = await fetch("/api/auth/webauthn/credentials");
                        if (credsRes.ok) {
                            const data = await credsRes.json();
                            const serverIds = (data.credentials || []).map((c) => c.id);
                            // Biometric available only if this device's credential still
                            // exists on the server (not deleted by the user)
                            const hasMatch = storedIds.some((id) => serverIds.includes(id));
                            setBiometricAvailable(hasMatch);
                        } else {
                            setBiometricAvailable(false);
                        }
                    }
                } catch {
                    setBiometricAvailable(false);
                }
            } else {
                setBiometricAvailable(false);
            }
        };

        if (isOpen) {
            checkPinAndBiometric();
        }
    }, [isOpen]);

    // Reset state on open/close
    useEffect(() => {
        if (isOpen) {
            autoTriggeredRef.current = false;
            setShowPinFallback(false);
        }
    }, [isOpen]);

    // Auto-trigger biometric as soon as we know it's available
    useEffect(() => {
        if (
            isOpen &&
            biometricAvailable &&
            !autoTriggeredRef.current &&
            !showPinFallback
        ) {
            autoTriggeredRef.current = true;
            handleBiometricAuth();
        }
        // handleBiometricAuth defined below — ESLint disabled for circular dep
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, biometricAvailable]);

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
            // 1. Get a server-generated challenge + list of allowed credential IDs
            const optRes = await fetch("/api/auth/webauthn/auth-options");
            if (!optRes.ok) {
                throw new Error(
                    "Impossible d'initialiser la vérification biométrique."
                );
            }
            const options = await optRes.json();

            // 2. Convert base64url values to ArrayBuffers for the WebAuthn API
            //    Using the specific allowCredentials ensures Chrome goes directly
            //    to the device biometric (fingerprint/Face ID) instead of the
            //    Google/iCloud passkey picker.
            const publicKeyOptions = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                allowCredentials: (options.allowCredentials || []).map((c) => ({
                    ...c,
                    id: base64urlToBuffer(c.id),
                })),
            };

            let credential;
            try {
                credential = await navigator.credentials.get({
                    publicKey: publicKeyOptions,
                });
            } catch (e) {
                if (e.name === "NotAllowedError") {
                    throw new Error("Authentification biométrique annulée.");
                }
                throw new Error(
                    "Votre appareil n'a pas pu vérifier votre identité."
                );
            }

            // 3. Encode response and verify server-side (signature check + sign count)
            const credentialJSON = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64url(
                        credential.response.clientDataJSON
                    ),
                    authenticatorData: bufferToBase64url(
                        credential.response.authenticatorData
                    ),
                    signature: bufferToBase64url(credential.response.signature),
                    userHandle: credential.response.userHandle
                        ? bufferToBase64url(credential.response.userHandle)
                        : null,
                },
            };

            const verifyRes = await fetch("/api/auth/webauthn/auth-verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ credential: credentialJSON }),
            });

            if (!verifyRes.ok) {
                const data = await verifyRes.json();
                throw new Error(
                    data.error || "Vérification biométrique échouée."
                );
            }

            // Success — mark the session as authenticated
            onSuccess();
        } catch (e) {
            // If the user cancelled or the biometric failed, show the PIN fallback
            if (hasPin) {
                setShowPinFallback(true);
                setError(
                    e.message === "Authentification biométrique annulée."
                        ? ""
                        : e.message
                );
            } else {
                setError(e.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md my-auto z-10 max-h-[95vh] overflow-y-auto">
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
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
                    {/* Biométrie : attente auto ou bouton manuel */}
                    {biometricAvailable && !showPinFallback && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Fingerprint
                                    className={`w-8 h-8 text-indigo-600 ${isLoading ? "animate-pulse" : ""}`}
                                />
                            </div>
                            <p className="text-gray-800 font-medium mb-1">
                                {isLoading
                                    ? "En attente de votre biométrie…"
                                    : "Vérification biométrique"}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                Utilisez votre empreinte ou Face ID
                            </p>
                            <Button
                                onClick={handleBiometricAuth}
                                disabled={isLoading}
                                variant="secondary"
                                className="w-full flex items-center justify-center gap-2 mb-2"
                            >
                                <Fingerprint className="w-4 h-4" />
                                {isLoading ? "En attente…" : "Réessayer"}
                            </Button>
                            {hasPin && (
                                <button
                                    onClick={() => {
                                        setShowPinFallback(true);
                                        setError("");
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 underline underline-offset-2"
                                >
                                    Utiliser le code PIN à la place
                                </button>
                            )}
                        </div>
                    )}

                    {/* Biométrie disponible mais l'utilisateur a basculé sur PIN */}
                    {biometricAvailable && showPinFallback && (
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setShowPinFallback(false);
                                setError("");
                                autoTriggeredRef.current = false;
                                handleBiometricAuth();
                            }}
                            className="w-full flex items-center justify-center gap-2 mb-1"
                        >
                            <Fingerprint className="w-4 h-4" />
                            Utiliser la biométrie
                        </Button>
                    )}

                    {/* Code PIN */}
                    {(!biometricAvailable || showPinFallback) && hasPin ? (
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
                    ) : (!biometricAvailable || showPinFallback) ? (
                        <div className="text-center py-4">
                            <p className="text-gray-600">
                                Veuillez configurer un code PIN dans les
                                paramètres pour continuer.
                            </p>
                        </div>
                    ) : null}
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
