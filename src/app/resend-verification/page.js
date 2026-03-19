"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ResendVerificationPage() {
	const { t, locale } = useLanguage();
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
				body: JSON.stringify({ email, locale }),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || t("resendVerification.errorGeneral"));
				return;
			}

			setMessage(data.message);
			setEmail("");
		} catch (err) {
			console.error("Erreur:", err);
			setError(t("resendVerification.errorGeneral"));
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
						{t("resendVerification.title")}
					</h1>
					<p className="text-gray-600 mt-2">
						{t("resendVerification.subtitle")}
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
							{t("resendVerification.emailLabel")}
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
								placeholder={t(
									"resendVerification.emailPlaceholder",
								)}
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
							? t("resendVerification.sendingButton")
							: t("resendVerification.sendButton")}
					</Button>
				</form>

				<div className="mt-6 space-y-2 text-center">
					<p className="text-sm text-gray-600">
						{t("resendVerification.alreadyVerified")}{" "}
						<Link
							href="/login"
							className="text-indigo-600 hover:text-indigo-700 font-medium"
						>
							{t("resendVerification.signIn")}
						</Link>
					</p>
					<p className="text-sm text-gray-600">
						{t("resendVerification.noAccount")}{" "}
						<Link
							href="/register"
							className="text-indigo-600 hover:text-indigo-700 font-medium"
						>
							{t("resendVerification.register")}
						</Link>
					</p>
				</div>

				<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
					<p className="text-sm text-blue-800">
						{t("resendVerification.spamTip")}
					</p>
				</div>
			</Card>
		</div>
	);
}
