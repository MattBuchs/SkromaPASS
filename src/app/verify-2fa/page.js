"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function Verify2FAPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const authToken = searchParams.get("t"); // Token 2FA depuis l'URL

    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Rediriger si pas d'email ou de token
    useEffect(() => {
        if (!email || !authToken) {
            console.error(
                "ERROR CLIENT - Missing email or token, redirecting to login"
            );
            router.replace("/login");
        }
    }, [email, authToken, router]);

    // Ne rien afficher si pas de credentials
    if (!email || !authToken) {
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Vérifier le code 2FA
            const verifyResponse = await fetch("/api/auth/verify-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token: code,
                    authToken: authToken,
                }),
            });

            if (!verifyResponse.ok) {
                const data = await verifyResponse.json();
                setError(data.error || "Code invalide");
                setIsLoading(false);
                return;
            }

            // Code 2FA valide - procéder à la connexion NextAuth
            // Le backend a validé l'identité complète de l'utilisateur
            window.location.href = "/dashboard";
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Erreur de vérification 2FA:", error);
            }
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        // Permettre seulement les chiffres et limiter à 6 caractères
        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
        setCode(value);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Authentification à deux facteurs
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Entrez le code à 6 chiffres de votre application
                        d&apos;authentification
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{email}</p>
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="code"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Code de vérification
                        </label>
                        <Input
                            id="code"
                            type="text"
                            value={code}
                            onChange={handleCodeChange}
                            required
                            className="text-center text-2xl tracking-widest"
                            placeholder="000000"
                            disabled={isLoading}
                            maxLength={6}
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500 text-center">
                            Le code change toutes les 30 secondes
                        </p>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || code.length !== 6}
                    >
                        {isLoading ? "Vérification..." : "Vérifier"}
                    </Button>
                </form>

                <div className="mt-6">
                    <Link
                        href="/login"
                        className="flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour à la connexion
                    </Link>
                </div>
            </Card>
        </div>
    );
}
