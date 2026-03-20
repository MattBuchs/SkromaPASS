"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckCircle, Shield, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function TwoFactorSettings() {
	const { t } = useLanguage();
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
	const [loading, setLoading] = useState(false);
	const [step, setStep] = useState("idle"); // idle, setup, verify
	const [qrCode, setQrCode] = useState("");
	const [secret, setSecret] = useState("");
	const [verificationCode, setVerificationCode] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Charger le statut 2FA
	useEffect(() => {
		fetchStatus();
	}, []);

	const fetchStatus = async () => {
		try {
			const response = await fetch("/api/user/two-factor");
			if (response.ok) {
				const data = await response.json();
				setTwoFactorEnabled(data.twoFactorEnabled);
			}
		} catch (error) {
			console.error("Erreur lors du chargement du statut 2FA:", error);
		}
	};

	const handleSetup = async () => {
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const response = await fetch("/api/user/two-factor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "setup" }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("twoFactor.errSetup"));
			}

			setQrCode(data.qrCode);
			setSecret(data.secret);
			setStep("setup");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleEnable = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const response = await fetch("/api/user/two-factor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "enable",
					token: verificationCode,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("twoFactor.errInvalidCode"));
			}

			setSuccess(data.message);
			setTwoFactorEnabled(true);
			setStep("idle");
			setVerificationCode("");
			setQrCode("");
			setSecret("");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleDisable = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		setLoading(true);

		try {
			const response = await fetch("/api/user/two-factor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					action: "disable",
					token: verificationCode,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("twoFactor.errInvalidCode"));
			}

			setSuccess(data.message);
			setTwoFactorEnabled(false);
			setStep("idle");
			setVerificationCode("");
		} catch (error) {
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCodeChange = (e) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 6);
		setVerificationCode(value);
	};

	return (
		<Card className="p-6">
			<div className="flex items-center gap-3 mb-6">
				<Shield className="w-6 h-6 text-indigo-600" />
				<h2 className="text-xl font-semibold text-gray-900">
					{t("twoFactor.title")}
				</h2>
			</div>

			<div className="mb-6">
				<div className="flex items-center gap-2 mb-2">
					<span className="text-sm font-medium text-gray-700">
						{t("twoFactor.status")}
					</span>
					{twoFactorEnabled ? (
						<span className="flex items-center gap-1 text-green-600 text-sm font-medium">
							<CheckCircle className="w-4 h-4" />
							{t("twoFactor.enabled")}
						</span>
					) : (
						<span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
							<XCircle className="w-4 h-4" />
							{t("twoFactor.disabled")}
						</span>
					)}
				</div>
				<p className="text-sm text-gray-600">{t("twoFactor.desc")}</p>
			</div>

			{error && (
				<div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm">
					{success}
				</div>
			)}

			{/* État idle - Activer/Désactiver */}
			{step === "idle" && !twoFactorEnabled && (
				<div>
					<Button onClick={handleSetup} disabled={loading}>
						{loading
							? t("twoFactor.loadingBtn")
							: t("twoFactor.enableBtn")}
					</Button>
				</div>
			)}

			{step === "idle" && twoFactorEnabled && (
				<div>
					<Button
						variant="secondary"
						onClick={() => setStep("verify")}
					>
						{t("twoFactor.disableBtn")}
					</Button>
				</div>
			)}

			{/* État setup - Scanner le QR code */}
			{step === "setup" && (
				<div className="space-y-4">
					<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							{t("twoFactor.scanStep")}
						</h3>
						<div className="flex justify-center mb-4">
							{qrCode && (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={qrCode}
									alt="QR Code 2FA"
									className="w-64 h-64"
								/>
							)}
						</div>
						<p className="text-sm text-gray-600 mb-2">
							{t("twoFactor.scanDesc")}
						</p>
						<details className="mt-4">
							<summary className="text-sm text-indigo-600 cursor-pointer hover:text-indigo-700">
								{t("twoFactor.manualScan")}
							</summary>
							<div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
								<p className="text-xs text-gray-500 mb-1">
									{t("twoFactor.secretLabel")}
								</p>
								<code className="text-sm font-mono text-gray-900 break-all">
									{secret}
								</code>
							</div>
						</details>
					</div>

					<form onSubmit={handleEnable} className="space-y-4">
						<div>
							<h3 className="text-lg font-medium text-gray-900 mb-2">
								{t("twoFactor.verifyStep")}
							</h3>
							<label
								htmlFor="code"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								{t("twoFactor.codeLabel")}
							</label>
							<Input
								id="code"
								type="text"
								value={verificationCode}
								onChange={handleCodeChange}
								placeholder="000000"
								className="text-center text-2xl tracking-widest"
								maxLength={6}
								required
							/>
						</div>

						<div className="flex gap-3">
							<Button
								type="submit"
								disabled={
									loading || verificationCode.length !== 6
								}
							>
								{loading
									? t("twoFactor.verifyingBtn")
									: t("twoFactor.activateBtn")}
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setStep("idle");
									setQrCode("");
									setSecret("");
									setVerificationCode("");
									setError("");
								}}
							>
								{t("twoFactor.cancelBtn")}
							</Button>
						</div>
					</form>
				</div>
			)}

			{/* État verify - Désactiver la 2FA */}
			{step === "verify" && twoFactorEnabled && (
				<div>
					<form onSubmit={handleDisable} className="space-y-4">
						<div>
							<label
								htmlFor="disable-code"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								{t("twoFactor.disableCodeLabel")}
							</label>
							<Input
								id="disable-code"
								type="text"
								value={verificationCode}
								onChange={handleCodeChange}
								placeholder="000000"
								className="text-center text-2xl tracking-widest"
								maxLength={6}
								required
							/>
						</div>

						<div className="flex gap-3">
							<Button
								type="submit"
								variant="secondary"
								disabled={
									loading || verificationCode.length !== 6
								}
							>
								{loading
									? t("twoFactor.verifyingBtn")
									: t("twoFactor.disableBtn")}
							</Button>
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setStep("idle");
									setVerificationCode("");
									setError("");
								}}
							>
								{t("twoFactor.cancelBtn")}
							</Button>
						</div>
					</form>
				</div>
			)}

			<div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
				<p className="text-sm text-blue-800">
					<strong>{t("twoFactor.securityNote")}</strong>{" "}
					{t("twoFactor.securityNoteText")}
				</p>
			</div>
		</Card>
	);
}
