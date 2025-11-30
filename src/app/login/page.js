"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            console.log("DEBUG CLIENT - Sending check-2fa:", {
                email,
                hasPassword: !!password,
                passwordLength: password?.length,
            });

            // D'abord, vérifier si l'utilisateur a la 2FA activée
            const check2FAResponse = await fetch("/api/auth/check-2fa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include", // Important pour les cookies
            });

            if (check2FAResponse.ok) {
                const { twoFactorEnabled, requiresCode, token } =
                    await check2FAResponse.json();

                console.log("DEBUG - check2FA response:", {
                    twoFactorEnabled,
                    requiresCode,
                    hasToken: !!token,
                });

                // Si 2FA activée et code requis, rediriger vers la page de vérification
                if (twoFactorEnabled && requiresCode && token) {
                    console.log("DEBUG - Redirecting to 2FA with token");
                    // Passer le token dans l'URL (sécurisé : JWT signé, expire en 10min, validé serveur)
                    router.push(
                        `/verify-2fa?email=${encodeURIComponent(
                            email
                        )}&t=${encodeURIComponent(token)}`
                    );
                    return;
                }
            }

            // Pas de 2FA, connexion normale
            const result = await signIn("credentials", {
                email,
                password,
                callbackUrl: "/dashboard",
                redirect: false,
            });

            if (result?.error) {
                console.error("SignIn error:", result.error);

                // Vérifier si l'erreur est liée à l'email non vérifié
                if (result.error === "CredentialsSignin") {
                    // Essayer de détecter si c'est un problème de vérification
                    // En vérifiant l'utilisateur dans la base
                    const checkResponse = await fetch(
                        "/api/auth/check-verification",
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email }),
                        }
                    );

                    if (checkResponse.ok) {
                        const data = await checkResponse.json();
                        if (data.emailNotVerified) {
                            setError(
                                "Votre email n'a pas encore été vérifié. Veuillez vérifier votre boîte de réception."
                            );
                            return;
                        }
                    }
                }

                setError("Email ou mot de passe incorrect");
            } else if (result?.ok) {
                // Redirection côté client
                window.location.href = "/dashboard";
            }
        } catch (error) {
            console.error("Erreur de connexion:", error);
            setError("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-lg">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                MemKeyPass
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost">Connexion</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary">
                                    S&apos;inscrire
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex items-center justify-center min-h-screen p-4 pt-24">
                <Card className="w-full max-w-md p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Connexion
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Connectez-vous à votre compte
                        </p>
                    </div>

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
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10"
                                    placeholder="votre@email.com"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Mot de passe
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                    className="pl-10"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
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
                </Card>
            </div>
        </div>
    );
}
