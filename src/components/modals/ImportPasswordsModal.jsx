"use client";

import Button from "@/components/ui/Button";
import { useImportPasswords } from "@/hooks/useApi";
import { useRef, useState } from "react";

const FORMATS = [
	{ id: "auto", label: "Détection automatique" },
	{ id: "bitwarden", label: "Bitwarden" },
	{ id: "lastpass", label: "LastPass" },
	{ id: "chrome", label: "Google Chrome" },
	{ id: "1password", label: "1Password" },
];

export default function ImportPasswordsModal({ onClose }) {
	const [csvContent, setCsvContent] = useState("");
	const [fileName, setFileName] = useState("");
	const [previewCount, setPreviewCount] = useState(null);
	const [step, setStep] = useState("upload"); // upload | confirm | done
	const [importedCount, setImportedCount] = useState(0);
	const [error, setError] = useState("");
	const fileInputRef = useRef(null);
	const importMutation = useImportPasswords();

	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
			setError("Veuillez sélectionner un fichier CSV");
			return;
		}

		if (file.size > 5 * 1024 * 1024) {
			setError("Fichier trop volumineux (5 Mo maximum)");
			return;
		}

		setFileName(file.name);
		setError("");

		const reader = new FileReader();
		reader.onload = (evt) => {
			const text = evt.target.result;
			setCsvContent(text);

			// Quick count of non-empty lines (minus header)
			const lines = text.split(/\r?\n/).filter((l) => l.trim());
			setPreviewCount(Math.max(0, lines.length - 1));
			setStep("confirm");
		};
		reader.readAsText(file, "UTF-8");
	}

	async function handleImport() {
		setError("");
		try {
			const result = await importMutation.mutateAsync(csvContent);
			setImportedCount(result.imported);
			setStep("done");
		} catch (err) {
			setError(err.message || "Erreur lors de l'import");
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-lg bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl p-6 z-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
							Importer des mots de passe
						</h2>
						<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
							Compatible Bitwarden, LastPass, 1Password, Chrome
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors text-2xl leading-none"
					>
						×
					</button>
				</div>

				{step === "upload" && (
					<div className="space-y-4">
						{/* Format badges */}
						<div className="flex flex-wrap gap-2 mb-2">
							{FORMATS.slice(1).map((f) => (
								<span
									key={f.id}
									className="px-2 py-1 text-xs rounded-full bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))]"
								>
									{f.label}
								</span>
							))}
						</div>

						{/* Instructions */}
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
							<p className="font-semibold">
								Comment exporter depuis votre
								gestionnaire&nbsp;:
							</p>
							<ul className="list-disc list-inside space-y-1 text-blue-700">
								<li>
									<strong>Bitwarden</strong>&nbsp;: Outils →
									Exporter le coffre (CSV)
								</li>
								<li>
									<strong>LastPass</strong>&nbsp;: Paramètres
									→ Exporter
								</li>
								<li>
									<strong>1Password</strong>&nbsp;: Fichier →
									Exporter (CSV)
								</li>
								<li>
									<strong>Chrome</strong>&nbsp;:
									chrome://settings/passwords → Exporter
								</li>
							</ul>
						</div>

						{/* Drop zone */}
						<div
							className="border-2 border-dashed border-[rgb(var(--color-border))] rounded-lg p-8 text-center cursor-pointer hover:border-[rgb(var(--color-primary))] transition-colors"
							onClick={() => fileInputRef.current?.click()}
						>
							<div className="text-4xl mb-2">📂</div>
							<p className="text-[rgb(var(--color-text-secondary))]">
								Cliquez pour sélectionner un fichier CSV
							</p>
							<p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
								Taille maximale&nbsp;: 5 Mo
							</p>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv,text/csv"
							className="hidden"
							onChange={handleFileChange}
						/>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}
					</div>
				)}

				{step === "confirm" && (
					<div className="space-y-4">
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
							<span className="text-2xl">✅</span>
							<div>
								<p className="font-semibold text-green-800">
									Fichier chargé
								</p>
								<p className="text-sm text-green-700">
									{fileName}
								</p>
								<p className="text-sm text-green-700 mt-1">
									<strong>{previewCount}</strong> mot
									{previewCount !== 1 ? "s" : ""} de passe
									détecté{previewCount !== 1 ? "s" : ""}
								</p>
							</div>
						</div>

						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
							⚠️ Les mots de passe seront ajoutés à votre coffre
							existant. Les doublons ne sont pas supprimés
							automatiquement.
						</div>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}

						<div className="flex gap-3 pt-2">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={() => {
									setStep("upload");
									setCsvContent("");
									setFileName("");
									setPreviewCount(null);
								}}
							>
								Changer de fichier
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={handleImport}
								disabled={importMutation.isPending}
							>
								{importMutation.isPending
									? "Import en cours..."
									: `Importer ${previewCount} mot${previewCount !== 1 ? "s" : ""} de passe`}
							</Button>
						</div>
					</div>
				)}

				{step === "done" && (
					<div className="text-center py-4 space-y-4">
						<div className="text-5xl">🎉</div>
						<div>
							<p className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
								Import réussi&nbsp;!
							</p>
							<p className="text-[rgb(var(--color-text-secondary))] mt-1">
								<strong>{importedCount}</strong> mot
								{importedCount !== 1 ? "s" : ""} de passe
								importé{importedCount !== 1 ? "s" : ""} avec
								succès
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
