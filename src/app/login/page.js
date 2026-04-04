"use client";

import HeaderHome from "@/components/layout/HeaderHome";
import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
	const router = useRouter();
	const { t } = useLanguage();
	const { theme } = useTheme();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
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

				// Si 2FA activée et code requis, rediriger vers la page de vérification
				if (twoFactorEnabled && requiresCode && token) {
					// Passer le token dans l'URL (sécurisé : JWT signé, expire en 10min, validé serveur)
					router.push(
						`/verify-2fa?email=${encodeURIComponent(
							email,
						)}&t=${encodeURIComponent(token)}`,
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
						},
					);

					if (checkResponse.ok) {
						const data = await checkResponse.json();
						if (data.emailNotVerified) {
							setError(t("auth.errorNotVerified"));
							return;
						}
					}
				}

				setError(t("auth.errorCredentials"));
			} else if (result?.ok) {
				// Redirection côté client
				window.location.href = "/dashboard";
			}
		} catch (error) {
			console.error("Erreur de connexion:", error);
			setError(t("auth.errorGeneral"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			data-theme={theme}
			className={`auth-page min-h-screen ${theme === "dark" ? "dark bg-slate-900" : "bg-linear-to-br from-indigo-50 via-white to-purple-50"}`}
		>
			<HeaderHome />

			<div className="flex items-center justify-center min-h-screen p-4 pt-24">
				<Card className="w-full max-w-md p-8">
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-16 h-16 mb-2">
							<Logo
								width={64}
								height={64}
								isTitleDisplayed={false}
							/>
						</div>
						<h1 className="text-3xl font-bold text-gray-900">
							{t("auth.loginTitle")}
						</h1>
						<p className="text-gray-600 mt-2">
							{t("auth.loginSubtitle")}
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
								{t("auth.email")}
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

						<div>
							<div className="flex items-center justify-between mb-2">
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									{t("auth.password")}
								</label>
								<Link
									href="/forgot-password"
									className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
								>
									{t("auth.forgotPassword")}
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									type="password"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									required
									icon={Lock}
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
							{isLoading
								? t("auth.loginLoading")
								: t("auth.loginButton")}
						</Button>
					</form>

					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							{t("auth.noAccount")}{" "}
							<Link
								href="/register"
								className="text-indigo-600 hover:text-indigo-700 font-medium"
							>
								{t("auth.registerLink")}
							</Link>
						</p>
					</div>
				</Card>
			</div>
		</div>
	);
}
