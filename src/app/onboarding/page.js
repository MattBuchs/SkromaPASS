"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
	CheckCircle,
	ChevronRight,
	Fingerprint,
	KeyRound,
	Lock,
	QrCode,
	Shield,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// ─── Base64url helpers (biometric) ──────────────────────────────────────────
function base64urlToBuffer(base64url) {
	const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
	const rem = base64.length % 4;
	const padded = rem === 0 ? base64 : base64 + "=".repeat(4 - rem);
	const str = atob(padded);
	const buf = new Uint8Array(str.length);
	for (let i = 0; i < str.length; i++) buf[i] = str.charCodeAt(i);
	return buf.buffer;
}

function bufferToBase64url(buffer) {
	const bytes = new Uint8Array(buffer);
	let str = "";
	for (const b of bytes) str += String.fromCharCode(b);
	return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
// ─────────────────────────────────────────────────────────────────────────────

function OnboardingPage() {
	const router = useRouter();
	const { t } = useLanguage();
	const { theme } = useTheme();
	const authBg = `auth-page min-h-screen flex items-center justify-center p-4 ${
		theme === "dark"
			? "dark bg-slate-900"
			: "bg-linear-to-br from-indigo-50 via-white to-purple-50"
	}`;

	const STEPS = [
		{
			id: "twofa",
			label: t("onboarding.twofaLabel"),
			icon: Shield,
			color: "text-purple-600",
			bg: "bg-purple-100",
			description: t("onboarding.twofaDesc"),
		},
		{
			id: "pin",
			label: t("onboarding.pinLabel"),
			icon: KeyRound,
			color: "text-indigo-600",
			bg: "bg-indigo-100",
			description: t("onboarding.pinDesc"),
		},
		{
			id: "biometric",
			label: t("onboarding.bioLabel"),
			icon: Fingerprint,
			color: "text-green-600",
			bg: "bg-green-100",
			description: t("onboarding.bioDesc"),
		},
	];

	const [stepIndex, setStepIndex] = useState(-1); // -1 = welcome, 0-2 = steps, 3 = done
	const [completedSteps, setCompletedSteps] = useState([]);

	// 2FA state
	const [tfaState, setTfaState] = useState("idle"); // idle | loading | setup | verifying | done
	const [tfaQr, setTfaQr] = useState("");
	const [tfaSecret, setTfaSecret] = useState("");
	const [tfaCode, setTfaCode] = useState("");
	const [tfaError, setTfaError] = useState("");

	// PIN state
	const [pin, setPin] = useState("");
	const [confirmPin, setConfirmPin] = useState("");
	const [currentPassword, setCurrentPassword] = useState("");
	const [pinError, setPinError] = useState("");
	const [pinLoading, setPinLoading] = useState(false);

	// Biometric state
	const [bioSupported, setBioSupported] = useState(false);
	const [bioDeviceName, setBioDeviceName] = useState("");
	const [bioLoading, setBioLoading] = useState(false);
	const [bioError, setBioError] = useState("");

	useEffect(() => {
		if (window.PublicKeyCredential && window.isSecureContext) {
			setBioSupported(true);
		}
		// Pre-fill device name
		setBioDeviceName(
			navigator.platform || t("onboarding.bioDevicePlaceholder"),
		);
	}, []);

	const markDone = (id) =>
		setCompletedSteps((prev) => (prev.includes(id) ? prev : [...prev, id]));

	const next = useCallback(() => {
		setStepIndex((i) => i + 1);
	}, []);

	// ── 2FA handlers ───────────────────────────────────────────────────────

	const handleTfaSetup = async () => {
		setTfaState("loading");
		setTfaError("");
		try {
			const res = await fetch("/api/user/two-factor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "setup" }),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || t("onboarding.tfaEnabled"));
			setTfaQr(data.qrCode);
			setTfaSecret(data.secret);
			setTfaState("setup");
		} catch (e) {
			setTfaError(e.message);
			setTfaState("idle");
		}
	};

	const handleTfaEnable = async (e) => {
		e.preventDefault();
		setTfaState("verifying");
		setTfaError("");
		try {
			const res = await fetch("/api/user/two-factor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "enable", token: tfaCode }),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || t("onboarding.tfaConfirm"));
			setTfaState("done");
			markDone("twofa");
		} catch (e) {
			setTfaError(e.message);
			setTfaState("setup");
		}
	};

	// ── PIN handler ────────────────────────────────────────────────────────

	const handlePinSubmit = async (e) => {
		e.preventDefault();
		setPinError("");
		if (pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
			setPinError(t("onboarding.pinInvalid"));
			return;
		}
		if (pin !== confirmPin) {
			setPinError(t("onboarding.pinMismatch"));
			return;
		}
		setPinLoading(true);
		try {
			const res = await fetch("/api/user/pin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pin, currentPassword }),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || t("onboarding.pinCreating"));
			markDone("pin");
			next();
		} catch (e) {
			setPinError(e.message);
		} finally {
			setPinLoading(false);
		}
	};

	// ── Biometric handler ──────────────────────────────────────────────────

	const handleBioRegister = async () => {
		setBioLoading(true);
		setBioError("");
		try {
			const optRes = await fetch("/api/auth/webauthn/register-options");
			if (!optRes.ok) throw new Error(t("onboarding.bioInitError"));
			const options = await optRes.json();

			const publicKeyOptions = {
				...options,
				challenge: base64urlToBuffer(options.challenge),
				user: {
					...options.user,
					id: base64urlToBuffer(options.user.id),
				},
				excludeCredentials: (options.excludeCredentials || []).map(
					(c) => ({
						...c,
						id: base64urlToBuffer(c.id),
					}),
				),
			};

			let credential;
			try {
				credential = await navigator.credentials.create({
					publicKey: publicKeyOptions,
				});
			} catch (e) {
				if (e.name === "NotAllowedError")
					throw new Error(t("onboarding.bioCancel"));
				throw new Error(`[${e.name}] ${e.message}`);
			}

			const credentialJSON = {
				id: credential.id,
				rawId: bufferToBase64url(credential.rawId),
				type: credential.type,
				response: {
					clientDataJSON: bufferToBase64url(
						credential.response.clientDataJSON,
					),
					attestationObject: bufferToBase64url(
						credential.response.attestationObject,
					),
				},
			};

			const verifyRes = await fetch(
				"/api/auth/webauthn/register-verify",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						credential: credentialJSON,
						deviceName: bioDeviceName.trim() || "Mon appareil",
					}),
				},
			);
			const verifyData = await verifyRes.json();
			if (!verifyRes.ok)
				throw new Error(
					verifyData.error || t("onboarding.bioFailError"),
				);

			// Store device credential ID locally
			if (verifyData.credentialDbId) {
				const stored = JSON.parse(
					localStorage.getItem("wa_device_cred_ids") || "[]",
				);
				stored.push(verifyData.credentialDbId);
				localStorage.setItem(
					"wa_device_cred_ids",
					JSON.stringify(stored),
				);
			}

			markDone("biometric");
			next(); // → done
		} catch (e) {
			setBioError(e.message);
		} finally {
			setBioLoading(false);
		}
	};

	// ── Finalize onboarding ────────────────────────────────────────────────

	const handleFinish = async () => {
		await fetch("/api/user/onboarding", { method: "PUT" });
		// Le PUT pose un cookie mkp_onboarded=1 que le proxy lit directement.
		// Pas besoin de session.update() — on redirige avec une navigation dure.
		window.location.href = "/dashboard";
	};

	// ── Rendering helpers ──────────────────────────────────────────────────

	const currentStep = STEPS[stepIndex];

	const StepDot = ({ index }) => {
		const done = completedSteps.includes(STEPS[index].id);
		const active = index === stepIndex;
		const skipped = stepIndex > index && !done;
		return (
			<div
				className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
					done
						? "bg-green-500 text-white"
						: active
							? "bg-indigo-600 text-white"
							: skipped
								? "bg-gray-200 text-gray-400"
								: "bg-gray-100 text-gray-400"
				}`}
			>
				{done ? <CheckCircle className="w-4 h-4" /> : index + 1}
			</div>
		);
	};

	// ── Screens ────────────────────────────────────────────────────────────

	if (stepIndex === -1) {
		return (
			<div data-theme={theme} className={authBg}>
				<div className="w-full max-w-lg text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-full mb-6">
						<Lock className="w-10 h-10 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">
						{t("onboarding.welcomeTitle")}
					</h1>
					<p className="text-gray-600 mb-8 text-lg">
						{t("onboarding.welcomeDesc")}
					</p>

					<div className="grid gap-4 mb-8 text-left">
						{STEPS.map((s, i) => {
							const Icon = s.icon;
							return (
								<div
									key={s.id}
									className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
								>
									<div
										className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center shrink-0`}
									>
										<Icon
											className={`w-5 h-5 ${s.color}`}
										/>
									</div>
									<div>
										<p className="font-semibold text-gray-800">
											{i + 1}. {s.label}
										</p>
										<p className="text-sm text-gray-500 mt-0.5">
											{s.description}
										</p>
									</div>
								</div>
							);
						})}
					</div>

					<Button
						onClick={() => setStepIndex(0)}
						className="w-full flex items-center justify-center gap-2 text-base py-3"
					>
						{t("onboarding.startButton")}
						<ChevronRight className="w-5 h-5" />
					</Button>
					<button
						onClick={handleFinish}
						className="mt-4 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2"
					>
						{t("onboarding.skipAll")}
					</button>
				</div>
			</div>
		);
	}

	// Done screen
	if (stepIndex >= STEPS.length) {
		return (
			<div data-theme={theme} className={authBg}>
				<div className="w-full max-w-md text-center">
					<div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
						<CheckCircle className="w-10 h-10 text-green-600" />
					</div>
					<h1 className="text-3xl font-bold text-gray-900 mb-3">
						{t("onboarding.doneTitle")}
					</h1>
					<p className="text-gray-600 mb-6">
						{completedSteps.length === 0
							? t("onboarding.doneDescNone")
							: `${t("onboarding.doneDescActivatedPrefix")} ${completedSteps.length} ${completedSteps.length > 1 ? t("onboarding.doneDescOptionPl") : t("onboarding.doneDescOptionSg")}. ${t("onboarding.doneDescSuffix")}`}
					</p>

					<div className="flex flex-col gap-2 mb-8">
						{STEPS.map((s) => {
							const Icon = s.icon;
							const done = completedSteps.includes(s.id);
							return (
								<div
									key={s.id}
									className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${done ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}
								>
									<Icon
										className={`w-4 h-4 ${done ? "text-green-600" : "text-gray-400"}`}
									/>
									<span
										className={`text-sm font-medium ${done ? "text-green-700" : "text-gray-400"}`}
									>
										{s.label}
									</span>
									{done ? (
										<CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
									) : (
										<span className="text-xs text-gray-400 ml-auto">
											{t("onboarding.ignored")}
										</span>
									)}
								</div>
							);
						})}
					</div>

					<Button
						onClick={handleFinish}
						className="w-full flex items-center justify-center gap-2 text-base py-3"
					>
						{t("onboarding.goToDashboard")}
						<ChevronRight className="w-5 h-5" />
					</Button>
				</div>
			</div>
		);
	}

	// Step screen
	const Icon = currentStep.icon;

	return (
		<div data-theme={theme} className={authBg}>
			<div className="w-full max-w-md">
				{/* Progress */}
				<div className="flex items-center justify-center gap-3 mb-8">
					{STEPS.map((s, i) => (
						<div key={s.id} className="flex items-center gap-3">
							<StepDot index={i} />
							{i < STEPS.length - 1 && (
								<div
									className={`h-0.5 w-10 ${i < stepIndex ? "bg-indigo-400" : "bg-gray-200"}`}
								/>
							)}
						</div>
					))}
				</div>

				{/* Card */}
				<div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
					{/* Header */}
					<div className="flex items-center gap-3 mb-6">
						<div
							className={`w-12 h-12 rounded-xl ${currentStep.bg} flex items-center justify-center`}
						>
							<Icon className={`w-6 h-6 ${currentStep.color}`} />
						</div>
						<div>
							<p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
								{t("onboarding.stepLabel")} {stepIndex + 1}{" "}
								{t("onboarding.stepOf")} {STEPS.length}
							</p>
							<h2 className="text-xl font-bold text-gray-900">
								{currentStep.label}
							</h2>
						</div>
					</div>

					{/* ── 2FA Step ── */}
					{currentStep.id === "twofa" && (
						<div>
							{tfaState === "idle" && (
								<>
									<p className="text-gray-600 text-sm mb-6">
										{currentStep.description}
									</p>
									<Button
										onClick={handleTfaSetup}
										className="w-full flex items-center justify-center gap-2"
									>
										<QrCode className="w-4 h-4" />
										{t("onboarding.tfaActivate")}
									</Button>
									{tfaError && (
										<p className="mt-3 text-sm text-red-600">
											{tfaError}
										</p>
									)}
								</>
							)}

							{tfaState === "loading" && (
								<p className="text-center text-gray-500 py-4">
									{t("onboarding.tfaGenerating")}
								</p>
							)}

							{(tfaState === "setup" ||
								tfaState === "verifying") && (
								<>
									<p className="text-sm text-gray-600 mb-4">
										{t("onboarding.tfaScanDesc")}
									</p>
									{tfaQr && (
										<div className="flex justify-center mb-4">
											<Image
												src={tfaQr}
												alt="QR Code 2FA"
												width={160}
												height={160}
												className="rounded-lg border border-gray-200"
											/>
										</div>
									)}
									<div className="bg-gray-50 rounded-lg p-3 mb-4">
										<p className="text-xs text-gray-500 mb-1">
											{t("onboarding.tfaManualCode")}
										</p>
										<p className="font-mono text-sm text-gray-800 break-all">
											{tfaSecret}
										</p>
									</div>
									<form
										onSubmit={handleTfaEnable}
										className="space-y-3"
									>
										<Input
											type="text"
											inputMode="numeric"
											placeholder={t(
												"onboarding.tfaInputPlaceholder",
											)}
											value={tfaCode}
											onChange={(e) =>
												setTfaCode(
													e.target.value
														.replace(/\D/g, "")
														.slice(0, 6),
												)
											}
											maxLength={6}
											className="text-center text-2xl tracking-widest"
										/>
										{tfaError && (
											<p className="text-sm text-red-600">
												{tfaError}
											</p>
										)}
										<Button
											type="submit"
											disabled={
												tfaCode.length !== 6 ||
												tfaState === "verifying"
											}
											className="w-full"
										>
											{tfaState === "verifying"
												? t("onboarding.tfaVerifying")
												: t("onboarding.tfaConfirm")}
										</Button>
									</form>
								</>
							)}

							{tfaState === "done" && (
								<div className="text-center py-4">
									<CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
									<p className="font-semibold text-gray-800 mb-1">
										{t("onboarding.tfaEnabled")}
									</p>
									<p className="text-sm text-gray-500 mb-5">
										{t("onboarding.tfaProtected")}
									</p>
									<Button
										onClick={next}
										className="w-full flex items-center justify-center gap-2"
									>
										{t("onboarding.nextStep")}{" "}
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							)}
						</div>
					)}

					{/* ── PIN Step ── */}
					{currentStep.id === "pin" && (
						<div>
							<p className="text-gray-600 text-sm mb-5">
								{currentStep.description}
							</p>
							<form
								onSubmit={handlePinSubmit}
								className="space-y-4"
							>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										{t("onboarding.pinPasswordLabel")}
									</label>
									<Input
										type="password"
										placeholder={t(
											"onboarding.pinPasswordPlaceholder",
										)}
										value={currentPassword}
										onChange={(e) =>
											setCurrentPassword(e.target.value)
										}
										required
										icon={Lock}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										{t("onboarding.pinNewLabel")}
									</label>
									<Input
										type="password"
										inputMode="numeric"
										placeholder="● ● ● ●"
										value={pin}
										onChange={(e) =>
											setPin(
												e.target.value
													.replace(/\D/g, "")
													.slice(0, 8),
											)
										}
										maxLength={8}
										icon={KeyRound}
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1.5">
										{t("onboarding.pinConfirmLabel")}
									</label>
									<Input
										type="password"
										inputMode="numeric"
										placeholder="● ● ● ●"
										value={confirmPin}
										onChange={(e) =>
											setConfirmPin(
												e.target.value
													.replace(/\D/g, "")
													.slice(0, 8),
											)
										}
										maxLength={8}
										icon={KeyRound}
									/>
								</div>
								{pinError && (
									<p className="text-sm text-red-600">
										{pinError}
									</p>
								)}
								<Button
									type="submit"
									disabled={
										pinLoading ||
										pin.length < 4 ||
										!currentPassword
									}
									className="w-full"
								>
									{pinLoading
										? t("onboarding.pinCreating")
										: t("onboarding.pinCreate")}
								</Button>
							</form>
						</div>
					)}

					{/* ── Biometric Step ── */}
					{currentStep.id === "biometric" && (
						<div>
							{!bioSupported ? (
								<>
									<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-5">
										<p className="text-sm text-amber-800">
											{t("onboarding.bioUnsupported")}
										</p>
									</div>
									<Button
										onClick={next}
										variant="secondary"
										className="w-full"
									>
										{t("onboarding.bioContinue")}
									</Button>
								</>
							) : (
								<>
									<p className="text-gray-600 text-sm mb-5">
										{currentStep.description}
									</p>
									<div className="mb-4">
										<label className="block text-sm font-medium text-gray-700 mb-1.5">
											{t("onboarding.bioDeviceLabel")}
										</label>
										<Input
											type="text"
											placeholder={t(
												"onboarding.bioDevicePlaceholder",
											)}
											value={bioDeviceName}
											onChange={(e) =>
												setBioDeviceName(e.target.value)
											}
											icon={Fingerprint}
										/>
									</div>
									{bioError && (
										<p className="mb-3 text-sm text-red-600">
											{bioError}
										</p>
									)}
									<Button
										onClick={handleBioRegister}
										disabled={bioLoading}
										className="w-full flex items-center justify-center gap-2"
									>
										<Fingerprint className="w-4 h-4" />
										{bioLoading
											? t("onboarding.bioRegistering")
											: t("onboarding.bioRegister")}
									</Button>
								</>
							)}
						</div>
					)}

					{/* Skip link — hidden once step is done */}
					{!completedSteps.includes(currentStep.id) &&
						tfaState !== "done" && (
							<button
								onClick={next}
								disabled={pinLoading}
								className="mt-5 w-full text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 cursor-pointer"
							>
								{t("onboarding.skipStep")}
							</button>
						)}
				</div>
			</div>
		</div>
	);
}

export default withAuthProtection(OnboardingPage);
