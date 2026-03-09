"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useImportMkp, useImportPasswords } from "@/hooks/useApi";
import {
	AlertTriangle,
	CheckCircle,
	FileUp,
	PartyPopper,
	X,
} from "lucide-react";
import { useRef, useState } from "react";

export default function ImportPasswordsModal({ onClose }) {
	const [format, setFormat] = useState("csv");
	const [fileContent, setFileContent] = useState("");
	const [fileName, setFileName] = useState("");
	const [previewCount, setPreviewCount] = useState(null);
	const [mkpPassword, setMkpPassword] = useState("");
	const [step, setStep] = useState("upload");
	const [importedCount, setImportedCount] = useState(0);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const fileInputRef = useRef(null);
	const csvMutation = useImportPasswords();
	const mkpMutation = useImportMkp();

	function resetForm() {
		setFileContent("");
		setFileName("");
		setPreviewCount(null);
		setMkpPassword("");
		setStep("upload");
		setError("");
		if (fileInputRef.current) fileInputRef.current.value = "";
	}

	function handleFormatChange(f) {
		setFormat(f);
		resetForm();
	}

	function processFile(file) {
		if (format === "csv") {
			if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
				setError("Veuillez sélectionner un fichier CSV");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				setError("Fichier trop volumineux (5 Mo maximum)");
				return;
			}
		} else {
			if (!file.name.endsWith(".mkp")) {
				setError("Veuillez sélectionner un fichier .mkp");
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				setError("Fichier trop volumineux (10 Mo maximum)");
				return;
			}
		}

		setFileName(file.name);
		setError("");
		const reader = new FileReader();
		reader.onload = (evt) => {
			const text = evt.target.result;
			setFileContent(text);
			if (format === "csv") {
				const lines = text.split(/\r?\n/).filter((l) => l.trim());
				setPreviewCount(Math.max(0, lines.length - 1));
			}
			setStep("confirm");
		};
		reader.readAsText(file, "UTF-8");
	}

	function handleFileChange(e) {
		const file = e.target.files?.[0];
		if (file) processFile(file);
	}

	function handleDragOver(e) {
		e.preventDefault();
		setIsDragging(true);
	}

	function handleDragLeave(e) {
		if (!e.currentTarget.contains(e.relatedTarget)) {
			setIsDragging(false);
		}
	}

	function handleDrop(e) {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files?.[0];
		if (file) processFile(file);
	}

	async function handleImport() {
		setError("");
		try {
			let result;
			if (format === "csv") {
				result = await csvMutation.mutateAsync(fileContent);
			} else {
				result = await mkpMutation.mutateAsync({
					mkpContent: fileContent,
					importPassword: mkpPassword,
				});
			}
			setImportedCount(result.imported);
			setStep("done");
		} catch (err) {
			setError(err.message || "Erreur lors de l'import");
		}
	}

	const isPending = csvMutation.isPending || mkpMutation.isPending;

	return (
		<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full sm:max-w-lg bg-[rgb(var(--color-surface))] rounded-t-2xl sm:rounded-xl shadow-2xl p-4 sm:p-6 z-10 max-h-[90dvh] overflow-y-auto">
				{/* Header */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
							Importer des mots de passe
						</h2>
						<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-1">
							Depuis un autre gestionnaire ou un export MemKeyPass
						</p>
					</div>
					<button
						onClick={onClose}
						className="p-1 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
					>
						<X size={20} />
					</button>
				</div>

				{/* Format tabs */}
				{step === "upload" && (
					<div className="flex gap-1 p-1 bg-[rgb(var(--color-background))] rounded-lg mb-4">
						<button
							onClick={() => handleFormatChange("csv")}
							className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
								format === "csv"
									? "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
									: "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
							}`}
						>
							Fichier CSV
						</button>
						<button
							onClick={() => handleFormatChange("mkp")}
							className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
								format === "mkp"
									? "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] shadow-sm border border-[rgb(var(--color-primary))]"
									: "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
							}`}
						>
							Export MemKeyPass (.mkp)
						</button>
					</div>
				)}

				{/* CSV — Upload */}
				{step === "upload" && format === "csv" && (
					<div className="space-y-4">
						<div className="flex flex-wrap gap-2">
							{[
								"Bitwarden",
								"LastPass",
								"1Password",
								"Google Chrome",
								"Gestionnaire avec export CSV",
							].map((name) => (
								<span
									key={name}
									className="px-2 py-1 text-xs rounded-full bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))]"
								>
									{name}
								</span>
							))}
						</div>

						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 space-y-1">
							<p className="font-semibold">
								Comment exporter depuis votre
								gestionnaire&nbsp;:
							</p>
							<ul className="list-disc list-inside space-y-1 text-blue-700">
								<li>
									<strong>Bitwarden</strong>&nbsp;: Outils
									&rarr; Exporter le coffre (CSV)
								</li>
								<li>
									<strong>LastPass</strong>&nbsp;:
									Param&egrave;tres &rarr; Exporter
								</li>
								<li>
									<strong>1Password</strong>&nbsp;: Fichier
									&rarr; Exporter (CSV)
								</li>
								<li>
									<strong>Chrome</strong>&nbsp;:
									chrome://settings/passwords &rarr; Exporter
								</li>
							</ul>
						</div>

						<div
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
								isDragging
									? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5"
									: "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]"
							}`}
							onClick={() => fileInputRef.current?.click()}
							onDragOver={handleDragOver}
							onDragEnter={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<FileUp
								size={36}
								className={`mx-auto mb-2 transition-colors ${isDragging ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
							/>
							<p className="text-[rgb(var(--color-text-secondary))]">
								{isDragging
									? "Déposez le fichier ici"
									: "Cliquez ou glissez-déposez un fichier CSV"}
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

				{/* MKP — Upload */}
				{step === "upload" && format === "mkp" && (
					<div className="space-y-4">
						<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
							<p>
								S&eacute;lectionnez un fichier{" "}
								<strong>.mkp</strong> export&eacute; depuis
								MemKeyPass, puis entrez le mot de passe
								d&apos;export que vous aviez d&eacute;fini lors
								de l&apos;export.
							</p>
						</div>

						<div
							className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
								isDragging
									? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/5"
									: "border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-primary))]"
							}`}
							onClick={() => fileInputRef.current?.click()}
							onDragOver={handleDragOver}
							onDragEnter={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
						>
							<FileUp
								size={36}
								className={`mx-auto mb-2 transition-colors ${isDragging ? "text-[rgb(var(--color-primary))]" : "text-[rgb(var(--color-text-tertiary))]"}`}
							/>
							<p className="text-[rgb(var(--color-text-secondary))]">
								{isDragging
									? "Déposez le fichier ici"
									: "Cliquez ou glissez-déposez un fichier .mkp"}
							</p>
						</div>
						<input
							ref={fileInputRef}
							type="file"
							accept=".mkp"
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

				{/* CSV — Confirm */}
				{step === "confirm" && format === "csv" && (
					<div className="space-y-4">
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
							<CheckCircle
								size={20}
								className="text-green-600 mt-0.5 shrink-0"
							/>
							<div>
								<p className="font-semibold text-green-800">
									Fichier charg&eacute;
								</p>
								<p className="text-sm text-green-700">
									{fileName}
								</p>
								<p className="text-sm text-green-700 mt-1">
									<strong>{previewCount}</strong> mot
									{previewCount !== 1 ? "s" : ""} de passe
									d&eacute;tect&eacute;
									{previewCount !== 1 ? "s" : ""}
								</p>
							</div>
						</div>

						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
							<AlertTriangle
								size={16}
								className="mt-0.5 shrink-0"
							/>
							<span>
								Les mots de passe seront ajout&eacute;s &agrave;
								votre coffre existant. Les doublons ne sont pas
								supprim&eacute;s automatiquement.
							</span>
						</div>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}

<div className="flex flex-col sm:flex-row gap-3 pt-2">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={resetForm}
							>
								Changer de fichier
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={handleImport}
								disabled={isPending}
							>
								{isPending
									? "Import en cours..."
									: `Importer ${previewCount} mot${previewCount !== 1 ? "s" : ""} de passe`}
							</Button>
						</div>
					</div>
				)}

				{/* MKP — Confirm */}
				{step === "confirm" && format === "mkp" && (
					<div className="space-y-4">
						<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
							<CheckCircle
								size={20}
								className="text-green-600 mt-0.5 shrink-0"
							/>
							<div>
								<p className="font-semibold text-green-800">
									Fichier .mkp charg&eacute;
								</p>
								<p className="text-sm text-green-700">
									{fileName}
								</p>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								Mot de passe d&apos;export
							</label>
							<Input
								type="password"
								value={mkpPassword}
								onChange={(e) => setMkpPassword(e.target.value)}
								placeholder="Le mot de passe défini lors de l'export"
							/>
						</div>

						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2 text-sm text-yellow-800">
							<AlertTriangle
								size={16}
								className="mt-0.5 shrink-0"
							/>
							<span>
								Les mots de passe seront ajout&eacute;s &agrave;
								votre coffre existant. Les doublons ne sont pas
								supprim&eacute;s automatiquement.
							</span>
						</div>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}

						<div className="flex flex-col sm:flex-row gap-3 pt-2">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={resetForm}
							>
								Changer de fichier
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={handleImport}
								disabled={isPending || !mkpPassword}
							>
								{isPending ? "Déchiffrement..." : "Importer"}
							</Button>
						</div>
					</div>
				)}

				{/* Done */}
				{step === "done" && (
					<div className="text-center py-4 space-y-4">
						<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
							<PartyPopper size={28} className="text-green-600" />
						</div>
						<div>
							<p className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
								Import r&eacute;ussi&nbsp;!
							</p>
							<p className="text-[rgb(var(--color-text-secondary))] mt-1">
								<strong>{importedCount}</strong> mot
								{importedCount !== 1 ? "s" : ""} de passe
								import&eacute;
								{importedCount !== 1 ? "s" : ""} avec
								succ&egrave;s
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
