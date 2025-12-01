"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function ResendVerificationPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Une erreur est survenue");
                return;
            }

            setMessage(data.message);
            setEmail(""); // Réinitialiser le champ
        } catch (error) {
            console.error("Erreur:", error);
            setError("Une erreur est survenue lors de l'envoi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 p-4">
            <Card className="w-full max-w-md p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Renvoyer l&apos;email de vérification
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Entrez votre adresse email pour recevoir un nouveau lien
                        de vérification
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Email
                        </label>
                        <div className="relative">
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                icon={Mail}
                                className="pl-10"
                                placeholder="votre@email.com"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? "Envoi en cours..." : "Renvoyer l'email"}
                    </Button>
                </form>

                <div className="mt-6 space-y-2 text-center">
                    <p className="text-sm text-gray-600">
                        Email déjà vérifié ?{" "}
                        <Link
                            href="/login"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Se connecter
                        </Link>
                    </p>
                    <p className="text-sm text-gray-600">
                        Pas encore de compte ?{" "}
                        <Link
                            href="/register"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            S&apos;inscrire
                        </Link>
                    </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Astuce :</strong> Vérifiez également votre
                        dossier spam ou courrier indésirable.
                    </p>
                </div>
            </Card>
        </div>
    );
}
