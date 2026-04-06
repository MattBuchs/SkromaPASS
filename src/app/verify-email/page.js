"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
	const { t } = useLanguage();
	const { theme } = useTheme();
	const searchParams = useSearchParams();
	const router = useRouter();
	// status: loading | success | error_invalid | error_missing | error_server | error_api | error_unknown | pending
	const [status, setStatus] = useState("loading");
	const [apiError, setApiError] = useState(""); // raw API error message only

	useEffect(() => {
		const verifyEmail = async () => {
			const success = searchParams.get("success");
			const error = searchParams.get("error");
			const token = searchParams.get("token");
			const email = searchParams.get("email");

			if (success === "true") {
				setStatus("success");
				return;
			}

			if (error) {
				switch (error) {
					case "invalid_token":
						setStatus("error_invalid");
						break;
					case "missing_params":
						setStatus("error_missing");
						break;
					case "server_error":
						setStatus("error_server");
						break;
					default:
						setStatus("error_unknown");
				}
				return;
			}

			if (token && email) {
				setStatus("loading");
				try {
					const response = await fetch("/api/auth/verify-email", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ email, token }),
					});

					const data = await response.json();

					if (response.ok) {
						setStatus("success");
						router.replace("/verify-email?success=true");
					} else {
						setStatus("error_api");
						setApiError(data.error || "");
					}
				} catch (err) {
					console.error("Verify error:", err);
					setStatus("error_api");
					setApiError("");
				}
			} else {
				setStatus("pending");
			}
		};

		verifyEmail();
	}, [searchParams, router]);

	const isError = status.startsWith("error");

	const titles = {
		loading: t("verifyEmail.loadingTitle"),
		success: t("verifyEmail.successTitle"),
		error_invalid: t("verifyEmail.errorTitle"),
		error_missing: t("verifyEmail.errorTitle"),
		error_server: t("verifyEmail.errorTitle"),
		error_api: t("verifyEmail.errorTitle"),
		error_unknown: t("verifyEmail.errorTitle"),
		pending: t("verifyEmail.pendingTitle"),
	};

	const messages = {
		loading: t("verifyEmail.loadingMsg"),
		success: t("verifyEmail.successMsg"),
		error_invalid: t("verifyEmail.errorInvalidToken"),
		error_missing: t("verifyEmail.errorMissingParams"),
		error_server: t("verifyEmail.errorServer"),
		error_api: apiError || t("verifyEmail.errorGeneral"),
		error_unknown: t("verifyEmail.errorUnknown"),
		pending: t("verifyEmail.pendingMsg"),
	};

	return (
		<div
			data-theme={theme}
			className={`auth-page min-h-screen flex items-center justify-center px-4 ${theme === "dark" ? "dark bg-slate-900" : "bg-linear-to-br from-indigo-50 to-purple-50"}`}
		>
			<div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
				<div className="text-center">
					{/* IcÃ´ne */}
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
						{isError && (
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
						{titles[status]}
					</h1>

					{/* Message */}
					<p className="text-gray-600 mb-6">{messages[status]}</p>

					{/* Actions */}
					<div className="space-y-3">
						{status === "success" && (
							<Link
								href="/login"
								className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
							>
								{t("verifyEmail.signIn")}
							</Link>
						)}

						{isError && (
							<>
								<Link
									href="/resend-verification"
									className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
								>
									{t("verifyEmail.resendVerification")}
								</Link>
								<Link
									href="/register"
									className="block w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
								>
									{t("verifyEmail.backRegister")}
								</Link>
							</>
						)}

						{status === "pending" && (
							<Link
								href="/login"
								className="block w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
							>
								{t("verifyEmail.backLogin")}
							</Link>
						)}
					</div>

					{/* Note de sÃ©curitÃ© */}
					{status === "pending" && (
						<p className="text-sm text-gray-500 mt-6">
							{t("verifyEmail.spamTip")}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
