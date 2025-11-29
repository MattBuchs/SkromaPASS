"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState("loading");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verifyEmail = async () => {
            const success = searchParams.get("success");
            const error = searchParams.get("error");
            const token = searchParams.get("token");
            const email = searchParams.get("email");

            // Si on a déjà un statut (success ou error) dans l'URL, l'afficher
            if (success === "true") {
                setStatus("success");
                setMessage("Votre email a été vérifié avec succès !");
                return;
            }

            if (error) {
                setStatus("error");
                switch (error) {
                    case "invalid_token":
                        setMessage(
                            "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouvel email de vérification."
                        );
                        break;
                    case "missing_params":
                        setMessage("Lien de vérification incomplet.");
                        break;
                    case "server_error":
                        setMessage(
                            "Une erreur est survenue. Veuillez réessayer plus tard."
                        );
                        break;
                    default:
                        setMessage("Une erreur inconnue est survenue.");
                }
                return;
            }

            // Si on a un token et un email, faire la vérification
            if (token && email) {
                setStatus("loading");
                setMessage("Vérification en cours...");

                try {
                    const response = await fetch("/api/auth/verify-email", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email, token }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setStatus("success");
                        setMessage("Votre email a été vérifié avec succès !");
                        // Mettre à jour l'URL pour refléter le succès
                        router.replace("/verify-email?success=true");
                    } else {
                        setStatus("error");
                        setMessage(
                            data.error || "Une erreur est survenue lors de la vérification"
                        );
                    }
                } catch (error) {
                    console.error("Erreur de vérification:", error);
                    setStatus("error");
                    setMessage("Une erreur est survenue lors de la vérification");
                }
            } else {
                // Pas de token, juste afficher le message par défaut
                setStatus("pending");
                setMessage(
                    "Vérifiez votre boîte email pour confirmer votre adresse."
                );
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 to-purple-50 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                    {/* Icône */}
                    <div className="mb-6">
                        {status === "loading" && (
                            <div className="mx-auto w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        )}
                        {status === "success" && (
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-green-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                        )}
                        {status === "error" && (
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                        )}
                        {status === "pending" && (
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-blue-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Titre */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        {status === "loading" && "Vérification en cours..."}
                        {status === "success" && "Email vérifié !"}
                        {status === "error" && "Erreur de vérification"}
                        {status === "pending" && "Vérifiez votre email"}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">{message}</p>

                    {/* Actions */}
                    <div className="space-y-3">
                        {status === "success" && (
                            <Link
                                href="/login"
                                className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Se connecter
                            </Link>
                        )}

                        {status === "error" && (
                            <>
                                <Link
                                    href="/resend-verification"
                                    className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    Renvoyer l&apos;email de vérification
                                </Link>
                                <Link
                                    href="/register"
                                    className="block w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Retour à l&apos;inscription
                                </Link>
                            </>
                        )}

                        {status === "pending" && (
                            <Link
                                href="/login"
                                className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Retour à la connexion
                            </Link>
                        )}
                    </div>

                    {/* Note de sécurité */}
                    {status === "pending" && (
                        <p className="text-sm text-gray-500 mt-6">
                            💡 Astuce : Vérifiez également votre dossier spam ou
                            courrier indésirable.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
