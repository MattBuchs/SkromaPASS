"use client";

import HeaderHome from "@/components/layout/HeaderHome";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { AlertTriangle, CheckCircle, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function PasswordStrengthBar({ password }) {
	const checks = [
		{ test: /.{8,}/, label: "8 caractères minimum" },
		{ test: /[a-z]/, label: "Minuscule" },
		{ test: /[A-Z]/, label: "Majuscule" },
		{ test: /[0-9]/, label: "Chiffre" },
		{ test: /[^A-Za-z0-9]/, label: "Caractère spécial" },
	];

	const passed = checks.filter((c) => c.test.test(password)).length;
	const percent = (passed / checks.length) * 100;

	const color =
		percent <= 20
			? "bg-red-500"
			: percent <= 60
				? "bg-yellow-400"
				: percent <= 80
					? "bg-blue-500"
					: "bg-green-500";

	if (!password) return null;

	return (
		<div className="mt-2 space-y-1">
			<div className="w-full bg-gray-200 rounded-full h-1.5">
				<div
					className={`h-1.5 rounded-full transition-all duration-300 ${color}`}
					style={{ width: `${percent}%` }}
				/>
			</div>
			<div className="flex flex-wrap gap-x-3 gap-y-1">
				{checks.map((c) => (
					<span
						key={c.label}
						className={`text-xs ${
							c.test.test(password)
								? "text-green-600"
								: "text-gray-400"
						}`}
					>
						{c.test.test(password) ? "✓" : "○"} {c.label}
					</span>
				))}
			</div>
		</div>
	);
}

function ResetPasswordForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const token = searchParams.get("token") || "";
	const email = searchParams.get("email") || "";

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	// Vérifier les paramètres d'URL dès le montage
	const isValidParams = token.length === 64 && email.includes("@");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (password !== confirm) {
			setError("Les mots de passe ne correspondent pas.");
			return;
		}

		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.message || "Une erreur est survenue.");
				return;
			}

			setSuccess(true);
		} catch {
			setError("Une erreur est survenue. Vérifiez votre connexion.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isValidParams) {
		return (
			<Card className="w-full max-w-md p-8 text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
					<AlertTriangle className="w-8 h-8 text-red-600" />
				</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-3">
					Lien invalide
				</h1>
				<p className="text-gray-600 text-sm mb-6">
					Ce lien de réinitialisation est invalide ou a expiré.
				</p>
				<Link
					href="/forgot-password"
					className="inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Demander un nouveau lien
				</Link>
			</Card>
		);
	}

	if (success) {
		return (
			<Card className="w-full max-w-md p-8 text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
					<CheckCircle className="w-8 h-8 text-green-600" />
				</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-3">
					Mot de passe modifié !
				</h1>
				<p className="text-gray-600 text-sm mb-2">
					Votre mot de passe a été réinitialisé avec succès.
				</p>
				<p className="text-gray-500 text-xs mb-6">
					Toutes vos sessions actives ont été déconnectées. Veuillez
					vous reconnecter avec votre nouveau mot de passe.
				</p>
				<Link
					href="/login"
					className="inline-block px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
				>
					Se connecter
				</Link>
			</Card>
		);
	}

	return (
		<Card className="w-full max-w-md p-8">
			<div className="text-center mb-8">
				<div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
					<Lock className="w-8 h-8 text-white" />
				</div>
				<h1 className="text-3xl font-bold text-gray-900">
					Nouveau mot de passe
				</h1>
				<p className="text-gray-600 mt-2 text-sm">
					Choisissez un mot de passe pour
					<span className="font-medium text-gray-800 block">
						{email}.
					</span>
				</p>
			</div>

			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
					{error}
					{error.includes("invalide ou a expiré") && (
						<div className="mt-2">
							<Link
								href="/forgot-password"
								className="underline font-medium"
							>
								Demander un nouveau lien
							</Link>
						</div>
					)}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Nouveau mot de passe
					</label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							icon={Lock}
							placeholder="••••••••"
							disabled={isLoading}
							autoComplete="new-password"
						/>
					</div>
					<PasswordStrengthBar password={password} />
				</div>

				<div>
					<label
						htmlFor="confirm"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Confirmer le mot de passe
					</label>
					<div className="relative">
						<Input
							id="confirm"
							type={showConfirm ? "text" : "password"}
							value={confirm}
							onChange={(e) => setConfirm(e.target.value)}
							required
							icon={Lock}
							placeholder="••••••••"
							disabled={isLoading}
							autoComplete="new-password"
						/>
					</div>
					{confirm && password !== confirm && (
						<p className="mt-1 text-xs text-red-500">
							Les mots de passe ne correspondent pas.
						</p>
					)}
				</div>

				<Button
					type="submit"
					className="w-full"
					disabled={
						isLoading ||
						(confirm.length > 0 && password !== confirm)
					}
				>
					{isLoading
						? "Réinitialisation..."
						: "Réinitialiser le mot de passe"}
				</Button>
			</form>
		</Card>
	);
}

export default function ResetPasswordPage() {
	return (
		<div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
			<HeaderHome />
			<div className="flex items-center justify-center min-h-screen p-4 pt-24">
				<Suspense
					fallback={
						<Card className="w-full max-w-md p-8 text-center">
							<div className="animate-pulse text-gray-400">
								Chargement...
							</div>
						</Card>
					}
				>
					<ResetPasswordForm />
				</Suspense>
			</div>
		</div>
	);
}
