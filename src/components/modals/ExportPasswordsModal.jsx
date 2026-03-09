"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AlertTriangle, Download, X } from "lucide-react";
import { useState } from "react";

export default function ExportPasswordsModal({ onClose }) {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState("");
	const [isExporting, setIsExporting] = useState(false);
	const [step, setStep] = useState("form");

	async function handleExport(e) {
		e.preventDefault();
		setError("");

		if (password.length < 8) {
			setError("Le mot de passe doit faire au moins 8 caractères.");
			return;
		}

		if (password !== confirmPassword) {
			setError("Les mots de passe ne correspondent pas.");
			return;
		}

		setIsExporting(true);
		try {
			const res = await fetch(
				`/api/passwords/export?exportPassword=${encodeURIComponent(password)}`,
			);
			if (!res.ok) {
				const json = await res.json().catch(() => ({}));
				setError(json.error || "Erreur lors de l'export");
				return;
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const today = new Date().toISOString().slice(0, 10);
			a.download = `memkeypass-export-${today}.mkp`;
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
								Exporter le coffre
							</h2>
							<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5">
								Format chiffré .mkp
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
									Mot de passe d&apos;export — à ne pas
									oublier&nbsp;!
								</p>
								<p>
									Ce mot de passe chiffre l&apos;intégralité
									de votre coffre.{" "}
									<strong>
										Sans lui, vous ne pourrez pas réimporter
										vos données.
									</strong>{" "}
									Notez-le dans un endroit sûr avant de
									télécharger le fichier.
								</p>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								Mot de passe d&apos;export
							</label>
							<div className="relative">
								<Input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
									placeholder="8 caractères minimum"
									required
									minLength={8}
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								Confirmer le mot de passe
							</label>
							<Input
								type={showPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={(e) =>
									setConfirmPassword(e.target.value)
								}
								placeholder="Répétez le mot de passe"
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
								Annuler
							</Button>
							<Button
								type="submit"
								variant="primary"
								className="flex-1 flex items-center justify-center gap-2"
								disabled={isExporting}
							>
								<Download size={16} />
								{isExporting
									? "Export en cours..."
									: "Télécharger"}
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
								Export réussi&nbsp;!
							</p>
							<p className="text-[rgb(var(--color-text-secondary))] mt-1 text-sm">
								Votre coffre a été téléchargé. Conservez le
								fichier <strong>.mkp</strong> et votre mot de
								passe d&apos;export en lieu sûr&nbsp;: sans ce
								mot de passe, les données sont irrécupérables.
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
