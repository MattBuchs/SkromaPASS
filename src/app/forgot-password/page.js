"use client";

import HeaderHome from "@/components/layout/HeaderHome";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					cfTurnstileToken: turnstileToken,
				}),
			});

			const data = await res.json();

			if (!res.ok) {
				if (res.status === 429) {
					setError(data.message);
				} else {
					setError(data.message || "Une erreur est survenue.");
				}
				return;
			}

			setSubmitted(true);
		} catch {
			setError("Une erreur est survenue. Vérifiez votre connexion.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
			<HeaderHome />

			<div className="flex items-center justify-center min-h-screen p-4 pt-24">
				<Card className="w-full max-w-md p-8">
					{submitted ? (
						<div className="text-center">
							<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
								<CheckCircle className="w-8 h-8 text-green-600" />
							</div>
							<h1 className="text-2xl font-bold text-gray-900 mb-3">
								Email envoyé !
							</h1>
							<p className="text-gray-600 text-sm leading-relaxed mb-6">
								Si un compte existe avec l&apos;adresse{" "}
								<strong className="text-gray-800">
									{email}
								</strong>
								, vous recevrez un lien de réinitialisation
								valable <strong>1 heure</strong>.
							</p>
							<p className="text-gray-500 text-xs mb-8">
								Vérifiez également vos spams si vous ne voyez
								pas l&apos;email.
							</p>
							<Link
								href="/login"
								className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
							>
								<ArrowLeft className="w-4 h-4" />
								Retour à la connexion
							</Link>
						</div>
					) : (
						<>
							<div className="text-center mb-8">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
									<Mail className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-3xl font-bold text-gray-900">
									Mot de passe oublié
								</h1>
								<p className="text-gray-600 mt-2 text-sm">
									Saisissez votre email pour recevoir un lien
									de réinitialisation sécurisé.
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
										Adresse email
									</label>
									<Input
										id="email"
										type="email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										required
										icon={Mail}
										placeholder="votre@email.com"
										disabled={isLoading}
										autoComplete="email"
									/>
								</div>

								<div className="w-full">
									<Turnstile
										siteKey={
											process.env
												.NEXT_PUBLIC_TURNSTILE_SITE_KEY
										}
										onSuccess={setTurnstileToken}
										onExpire={() => setTurnstileToken(null)}
										options={{ size: "flexible" }}
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || !turnstileToken}
								>
									{isLoading
										? "Envoi en cours..."
										: "Envoyer le lien de réinitialisation"}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<Link
									href="/login"
									className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
								>
									<ArrowLeft className="w-4 h-4" />
									Retour à la connexion
								</Link>
							</div>
						</>
					)}
				</Card>
			</div>
		</div>
	);
}
