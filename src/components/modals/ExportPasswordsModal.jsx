"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertTriangle, Download, X } from "lucide-react";
import { useState } from "react";

export default function ExportPasswordsModal({ onClose }) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isExporting, setIsExporting] = useState(false);
	const [step, setStep] = useState("form");
	const { t } = useLanguage();

	async function handleExport(e) {
		e.preventDefault();
		setError("");

		if (password.length < 8) {
			setError(t("exportModal.errTooShort"));
			return;
		}

		if (password !== confirmPassword) {
			setError(t("exportModal.errMismatch"));
			return;
		}

		setIsExporting(true);
		try {
			const res = await fetch(
				`/api/passwords/export?exportPassword=${encodeURIComponent(password)}`,
			);
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				setError(json.error || t("exportModal.errExport"));
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const today = new Date().toISOString().slice(0, 10);
			a.download = `skromapass-export-${today}.mkp`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			setStep("done");
		} finally {
			setIsExporting(false);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full sm:max-w-md bg-[rgb(var(--color-surface))] rounded-t-2xl sm:rounded-xl shadow-2xl p-4 sm:p-6 z-10 max-h-[90dvh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center">
							<Download
								size={20}
								className="text-[rgb(var(--color-primary))]"
							/>
						</div>
						<div>
							<h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("exportModal.title")}
							</h2>
							<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5">
								{t("exportModal.subtitle")}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				{step === "form" && (
					<form onSubmit={handleExport} className="space-y-4">
						{/* Warning */}
						<div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
							<AlertTriangle
								size={18}
								className="text-amber-600 mt-0.5 shrink-0"
							/>
							<div className="text-sm text-amber-800">
								<p className="font-semibold mb-1">
									{t("exportModal.warningTitle")}
								</p>
								<p>{t("exportModal.warningDesc")}</p>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("exportModal.passwordLabel")}
							</label>
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder={t(
										"exportModal.passwordPlaceholder",
									)}
									required
									minLength={8}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("exportModal.confirmLabel")}
							</label>
							<Input
								type={showPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								placeholder={t(
									"exportModal.confirmPlaceholder",
								)}
								required
							/>
						</div>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}

						<div className="flex flex-col sm:flex-row gap-3 pt-2">
							<Button
								type="button"
								variant="secondary"
								className="flex-1"
								onClick={onClose}
							>
								{t("passwordModal.cancel")}
							</Button>
							<Button
								type="submit"
								variant="primary"
								className="flex-1 flex items-center justify-center gap-2"
								disabled={isExporting}
							>
								<Download size={16} />
								{isExporting
									? t("exportModal.exporting")
									: t("exportModal.download")}
							</Button>
						</div>
					</form>
				)}

				{step === "done" && (
					<div className="text-center py-4 space-y-4">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
							<Download size={28} className="text-green-600" />
						</div>
						<div>
							<p className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("exportModal.successTitle")}
							</p>
							<p className="text-[rgb(var(--color-text-secondary))] mt-1 text-sm">
								{t("exportModal.successDesc")}
							</p>
						</div>
						<Button
							variant="primary"
							onClick={onClose}
							className="w-full"
						>
							Fermer
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
