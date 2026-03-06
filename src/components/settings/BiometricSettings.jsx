"use client";

import { useState, useEffect } from "react";
import { Fingerprint, Trash2, Plus, AlertCircle } from "lucide-react";
import Button from "@/components/ui/Button";

// ─── Base64url helpers ──────────────────────────────────────────────────────

function base64urlToBuffer(base64url) {
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    // Valid base64 can only have length % 4 of 0, 2 or 3 (never 1).
    // Pad to the next multiple of 4.
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

// ─── Component ───────────────────────────────────────────────────────────────

export default function BiometricSettings() {
    const [isSupported, setIsSupported] = useState(false);
    const [isCheckingSupport, setIsCheckingSupport] = useState(true);
    const [nonsecureContext, setNonsecureContext] = useState(false);
    const [credentials, setCredentials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [deviceName, setDeviceName] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const init = async () => {
            // WebAuthn requires HTTPS (or localhost)
            if (!window.isSecureContext) {
                setNonsecureContext(true);
                setIsSupported(false);
                setIsCheckingSupport(false);
                await loadCredentials();
                return;
            }

            // Browser must support the WebAuthn API at all
            if (!window.PublicKeyCredential) {
                setIsSupported(false);
                setIsCheckingSupport(false);
                await loadCredentials();
                return;
            }

            // isUserVerifyingPlatformAuthenticatorAvailable can return false on some
            // Android devices even when fingerprint is enrolled (known Chrome bug).
            // We use it as a hint only — fall back to true if it throws or is absent.
            try {
                if (PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
                    const available =
                        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                    // If false, we still show the UI and let the actual registration
                    // attempt surface a real error, rather than blocking preemptively.
                    setIsSupported(available || true);
                } else {
                    setIsSupported(true);
                }
            } catch {
                // If the check itself throws, assume supported and let the API decide
                setIsSupported(true);
            }

            setIsCheckingSupport(false);
            await loadCredentials();
        };
        init();
    }, []);

    const loadCredentials = async () => {
        try {
            const res = await fetch("/api/auth/webauthn/credentials");
            if (res.ok) {
                const data = await res.json();
                setCredentials(data.credentials || []);
            }
        } catch {
            // ignore
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        setError("");
        setSuccess("");
        setIsRegistering(true);

        try {
            // 1. Get registration options from server (sets challenge cookie)
            const optRes = await fetch("/api/auth/webauthn/register-options");
            if (!optRes.ok) {
                throw new Error("Impossible d'initialiser l'enregistrement.");
            }
            const options = await optRes.json();

            // 2. Convert base64url fields to ArrayBuffers for the WebAuthn API
            const publicKeyOptions = {
                ...options,
                challenge: base64urlToBuffer(options.challenge),
                user: {
                    ...options.user,
                    id: base64urlToBuffer(options.user.id),
                },
                excludeCredentials: (options.excludeCredentials || []).map(
                    (c) => ({
                        ...c,
                        id: base64urlToBuffer(c.id),
                    })
                ),
            };

            // 3. Ask the browser/OS for a new platform credential (fingerprint, Face ID, Windows Hello)
            let credential;
            try {
                credential = await navigator.credentials.create({
                    publicKey: publicKeyOptions,
                });
            } catch (e) {
                if (e.name === "NotAllowedError") {
                    throw new Error(
                        "Enregistrement annulé. Veuillez accepter la demande biométrique."
                    );
                }
                // Expose the real error name + message to help diagnose
                throw new Error(`[${e.name}] ${e.message}`);
            }

            // 4. Encode response back to base64url for the server
            const credentialJSON = {
                id: credential.id,
                rawId: bufferToBase64url(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufferToBase64url(
                        credential.response.clientDataJSON
                    ),
                    attestationObject: bufferToBase64url(
                        credential.response.attestationObject
                    ),
                },
            };

            // 5. Verify and store on the server
            const verifyRes = await fetch(
                "/api/auth/webauthn/register-verify",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        credential: credentialJSON,
                        deviceName: deviceName.trim() || "Mon appareil",
                    }),
                }
            );

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                throw new Error(
                    verifyData.error || "L'enregistrement a échoué."
                );
            }

            // Store the DB id of this credential in localStorage so ReauthModal
            // can check whether the current device has a registered credential
            // before triggering the biometric prompt.
            if (verifyData.credentialDbId) {
                const stored = JSON.parse(
                    localStorage.getItem("wa_device_cred_ids") || "[]"
                );
                stored.push(verifyData.credentialDbId);
                localStorage.setItem("wa_device_cred_ids", JSON.stringify(stored));
            }

            setSuccess("Empreinte enregistrée avec succès !");
            setShowForm(false);
            setDeviceName("");
            await loadCredentials();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsRegistering(false);
        }
    };

    const handleDelete = async (id) => {
        if (
            !confirm(
                "Supprimer cet appareil ? Vous ne pourrez plus utiliser sa biométrie pour vous authentifier."
            )
        )
            return;

        setError("");
        try {
            const res = await fetch("/api/auth/webauthn/credentials", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Suppression échouée");
            }

            // Remove from localStorage if this was the device's own credential
            const stored = JSON.parse(
                localStorage.getItem("wa_device_cred_ids") || "[]"
            );
            const filtered = stored.filter((cid) => cid !== id);
            localStorage.setItem("wa_device_cred_ids", JSON.stringify(filtered));

            setSuccess("Appareil supprimé.");
            await loadCredentials();
        } catch (e) {
            setError(e.message);
        }
    };

    if (isCheckingSupport) {
        return (
            <div className="flex items-center gap-2 p-3 text-sm text-[rgb(var(--color-text-secondary))]">
                <Fingerprint className="w-4 h-4 animate-pulse shrink-0" />
                Vérification de la biométrie…
            </div>
        );
    }

    if (nonsecureContext) {
        return (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">HTTPS requis</p>
                    <p>
                        L&apos;authentification biométrique n&apos;est
                        disponible que sur HTTPS.
                    </p>
                    <p className="mt-1 text-yellow-700">
                        Pour tester depuis un téléphone sur le réseau local :{" "}
                        <code className="bg-yellow-100 px-1 rounded font-mono text-xs">
                            npm run dev -- --experimental-https
                        </code>
                    </p>
                </div>
            </div>
        );
    }

    if (!isSupported) {
        return (
            <div className="flex items-start gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-600">
                    Votre navigateur ne supporte pas l&apos;authentification
                    biométrique. Essayez Chrome ou Safari à jour.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-[rgb(var(--color-text-primary))]">
                        Empreinte / Face ID
                    </h3>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                        Utilisez votre biométrie à la place du code PIN pour
                        déverrouiller vos mots de passe.
                    </p>
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {success}
                </div>
            )}

            {/* Registered devices */}
            {!isLoading && credentials.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-[rgb(var(--color-text-secondary))] uppercase tracking-wide">
                        Appareils enregistrés
                    </p>
                    {credentials.map((cred) => (
                        <div
                            key={cred.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]"
                        >
                            <div className="flex items-center gap-3">
                                <Fingerprint className="w-4 h-4 text-indigo-500 shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                                        {cred.deviceName}
                                    </p>
                                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                                        Ajouté le{" "}
                                        {new Date(
                                            cred.createdAt
                                        ).toLocaleDateString("fr-FR")}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDelete(cred.id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1 rounded"
                                title="Supprimer cet appareil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Add device form */}
            {showForm ? (
                <div className="p-4 border border-indigo-200 bg-indigo-50 rounded-lg space-y-3">
                    <p className="text-sm font-medium text-indigo-900">
                        Donnez un nom à cet appareil (optionnel)
                    </p>
                    <input
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="Ex : Mon iPhone, PC bureau…"
                        maxLength={50}
                        className="w-full px-3 py-2 text-sm rounded-md border border-indigo-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 text-[rgb(var(--color-text-primary))]"
                    />
                    <div className="flex gap-2">
                        <Button
                            variant="primary"
                            onClick={handleRegister}
                            disabled={isRegistering}
                        >
                            {isRegistering
                                ? "En cours…"
                                : "Confirmer avec votre biométrie"}
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowForm(false);
                                setDeviceName("");
                                setError("");
                            }}
                        >
                            Annuler
                        </Button>
                    </div>
                </div>
            ) : (
                <Button
                    variant="secondary"
                    onClick={() => {
                        setShowForm(true);
                        setSuccess("");
                        setError("");
                    }}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Enregistrer cet appareil
                </Button>
            )}
        </div>
    );
}
