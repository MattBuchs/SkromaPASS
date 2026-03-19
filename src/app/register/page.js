"use client";

import HeaderHome from "@/components/layout/HeaderHome";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Turnstile } from "@marsidev/react-turnstile";
import { Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
	const router = useRouter();
	const { t, locale } = useLanguage();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [turnstileToken, setTurnstileToken] = useState(null);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		// Vérifier que les mots de passe correspondent
		if (formData.password !== formData.confirmPassword) {
			setError(t("auth.passwordMismatch"));
			return;
		}

		setIsLoading(true);

		try {
			// Créer le compte
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					password: formData.password,
					cfTurnstileToken: turnstileToken,
					locale,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || t("auth.errorGeneral"));
				return;
			}

			// Afficher le message de succès
			setSuccess(true);
		} catch (error) {
			console.error("Erreur d'inscription:", error);
			setError(t("auth.errorGeneral"));
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
			<HeaderHome />

			<div className="flex items-center justify-center min-h-screen p-4 pt-24">
				<Card className="w-full max-w-md p-8">
					{success ? (
						<div className="text-center">
							<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
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
							<h2 className="text-2xl font-bold text-gray-900 mb-3">
								{t("auth.successTitle")}
							</h2>
							<p className="text-gray-600 mb-6">
								{t("auth.successEmailPrefix")}
								<strong>{formData.email}</strong>
								{t("auth.successEmailSuffix")}
							</p>
							<div className="space-y-3">
								<Link
									href="/verify-email"
									className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
								>
									{t("auth.successButton")}
								</Link>
								<p className="text-sm text-gray-500">
									💡 {t("auth.spamNote")}
								</p>
							</div>
						</div>
					) : (
						<>
							<div className="text-center mb-8">
								<div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
									<Lock className="w-8 h-8 text-white" />
								</div>
								<h1 className="text-3xl font-bold text-gray-900">
									{t("auth.registerTitle")}
								</h1>
								<p className="text-gray-600 mt-2">
									{t("auth.registerSubtitle")}
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
										htmlFor="name"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										{t("auth.nameLabel")}
									</label>
									<div className="relative">
										<Input
											id="name"
											name="name"
											type="text"
											value={formData.name}
											onChange={handleChange}
											required
											icon={User}
											className="pl-10"
											placeholder={t(
												"auth.namePlaceholder",
											)}
											disabled={isLoading}
										/>
									</div>
								</div>

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
											name="email"
											type="email"
											value={formData.email}
											onChange={handleChange}
											required
											icon={Mail}
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
										{t("auth.password")}
									</label>
									<div className="relative">
										<Input
											id="password"
											name="password"
											type="password"
											value={formData.password}
											onChange={handleChange}
											required
											icon={Lock}
											className="pl-10"
											placeholder="••••••••"
											disabled={isLoading}
										/>
									</div>
									<p className="mt-1 text-xs text-gray-500">
										{t("auth.passwordHint")}
									</p>
								</div>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										{t("auth.confirmPassword")}
									</label>
									<div className="relative">
										<Input
											id="confirmPassword"
											name="confirmPassword"
											type="password"
											value={formData.confirmPassword}
											onChange={handleChange}
											required
											icon={Lock}
											className="pl-10"
											placeholder="••••••••"
											disabled={isLoading}
										/>
									</div>
								</div>

								<div className="w-full">
									<Turnstile
										siteKey={
											process.env
												.NEXT_PUBLIC_TURNSTILE_SITE_KEY
										}
										onSuccess={setTurnstileToken}
										onError={() => setTurnstileToken(null)}
										onExpire={() => setTurnstileToken(null)}
										className="w-full"
										options={{
											theme: "light",
											language: "fr",
											size: "flexible",
										}}
									/>
								</div>

								<Button
									type="submit"
									className="w-full"
									disabled={isLoading || !turnstileToken}
								>
									{isLoading
										? t("auth.registerLoading")
										: t("auth.registerButton")}
								</Button>
							</form>

							<div className="mt-6 text-center">
								<p className="text-sm text-gray-600">
									{t("auth.alreadyAccount")}{" "}
									<Link
										href="/login"
										className="text-indigo-600 hover:text-indigo-700 font-medium"
									>
										{t("auth.loginLink")}
									</Link>
								</p>
							</div>
						</>
					)}
				</Card>
			</div>
		</div>
	);
}
