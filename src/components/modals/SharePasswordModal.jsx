"use client";

import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSharePassword } from "@/hooks/useApi";
import {
	encryptForShare,
	exportShareKey,
	generateShareKey,
} from "@/lib/share-crypto";
import {
	CheckCircle,
	Key,
	Lock,
	Pencil,
	ShieldAlert,
	TriangleAlert,
} from "lucide-react";
import { useState } from "react";

const EXPIRY_OPTIONS = [
	{ labelKey: "shareModal.expiry1h", hours: 1 },
	{ labelKey: "shareModal.expiry24h", hours: 24 },
	{ labelKey: "shareModal.expiry3d", hours: 72 },
	{ labelKey: "shareModal.expiry7d", hours: 168 },
];

export default function SharePasswordModal({ password, onClose }) {
	const [expiresInHours, setExpiresInHours] = useState(24);
	const [maxViews, setMaxViews] = useState(1);
	const [shareLink, setShareLink] = useState("");
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");
	// Nom du lien : personnalisable, masquable
	const [showName, setShowName] = useState(true);
	const [customName, setCustomName] = useState(password.name);
	// Champs à inclure dans le lien chiffré
	const [includeUsername, setIncludeUsername] = useState(true);
	const [includeEmail, setIncludeEmail] = useState(true);
	const [includeWebsite, setIncludeWebsite] = useState(true);
	const [includeNotes, setIncludeNotes] = useState(true);
	const shareMutation = useSharePassword();
	const { t } = useLanguage();

	async function handleCreate() {
		setError("");
		try {
			// 1. Génère une clé AES-256-GCM dans le navigateur — le serveur ne la voit jamais
			const key = await generateShareKey();

			// 2. Chiffre le contenu côté client (zero-knowledge : serveur stocke un blob opaque)
			const encryptedBlob = await encryptForShare(key, {
				password: password.password,
				...(includeUsername && password.username
					? { username: password.username }
					: {}),
				...(includeEmail && password.email
					? { email: password.email }
					: {}),
				...(includeWebsite && password.website
					? { website: password.website }
					: {}),
				...(includeNotes && password.notes
					? { notes: password.notes }
					: {}),
			});

			const data = await shareMutation.mutateAsync({
				passwordId: password.id,
				name: showName
					? customName.trim() || password.name
					: t("shareModal.defaultName"),
				encryptedBlob,
				expiresInHours,
				maxViews,
			});

			// 3. La clé est dans le fragment # — jamais envoyée au serveur (hors requêtes HTTP)
			const exportedKey = await exportShareKey(key);
			const link = `${window.location.origin}/share/${data.token}#${exportedKey}`;
			setShareLink(link);
		} catch (err) {
			setError(err.message || t("shareModal.err"));
		}
	}

	function handleCopyLink() {
		navigator.clipboard.writeText(shareLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	const isCreated = !!shareLink;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-md bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl p-6 z-10">
				{/* Header */}
				<div className="flex items-center justify-between mb-5">
					<div>
						<h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
							{t("shareModal.title")}
						</h2>
						<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5 truncate max-w-xs">
							{password.name}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors text-2xl leading-none cursor-pointer"
					>
						×
					</button>
				</div>

				{!isCreated ? (
					<div className="space-y-5">
						{/* Security notice */}
						<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start gap-2">
							<Lock size={15} className="shrink-0 mt-0.5" />
							<span>{t("shareModal.securityNote")}</span>
						</div>

						{/* Champs à partager */}
						{(password.username ||
							password.email ||
							password.website ||
							password.notes) && (
							<div>
								<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
									{t("shareModal.fieldsLabel")}
								</label>
								<div className="space-y-2">
									{/* Mot de passe — toujours inclus */}
									<div className="flex items-center gap-2 opacity-60 cursor-not-allowed">
										<input
											type="checkbox"
											checked
											disabled
											className="accent-[rgb(var(--color-primary))] cursor-not-allowed"
										/>
										<span className="text-sm text-[rgb(var(--color-text-secondary))]">
											{t("shareModal.fieldPassword")}{" "}
											<span className="text-xs text-[rgb(var(--color-text-tertiary))]">
												{t(
													"shareModal.fieldAlwaysRequired",
												)}
											</span>
										</span>
									</div>
									{/* Identifiant */}
									{password.username && (
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={includeUsername}
												onChange={(e) =>
													setIncludeUsername(
														e.target.checked,
													)
												}
												className="accent-[rgb(var(--color-primary))]"
											/>
											<span className="text-sm text-[rgb(var(--color-text-secondary))]">
												{t("shareModal.fieldUsername")}
												<span className="text-xs text-[rgb(var(--color-text-tertiary))] ml-1.5 font-mono">
													{password.username}
												</span>
											</span>
										</label>
									)}
									{/* Email */}
									{password.email && (
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={includeEmail}
												onChange={(e) =>
													setIncludeEmail(
														e.target.checked,
													)
												}
												className="accent-[rgb(var(--color-primary))]"
											/>
											<span className="text-sm text-[rgb(var(--color-text-secondary))]">
												{t("shareModal.fieldEmail")}
												<span className="text-xs text-[rgb(var(--color-text-tertiary))] ml-1.5 font-mono">
													{password.email}
												</span>
											</span>
										</label>
									)}
									{/* Site web */}
									{password.website && (
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={includeWebsite}
												onChange={(e) =>
													setIncludeWebsite(
														e.target.checked,
													)
												}
												className="accent-[rgb(var(--color-primary))]"
											/>
											<span className="text-sm text-[rgb(var(--color-text-secondary))]">
												{t("shareModal.fieldWebsite")}
												<span className="text-xs text-[rgb(var(--color-text-tertiary))] ml-1.5 font-mono">
													{password.website}
												</span>
											</span>
										</label>
									)}
									{/* Notes */}
									{password.notes && (
										<label className="flex items-center gap-2 cursor-pointer">
											<input
												type="checkbox"
												checked={includeNotes}
												onChange={(e) =>
													setIncludeNotes(
														e.target.checked,
													)
												}
												className="accent-[rgb(var(--color-primary))]"
											/>
											<span className="text-sm text-[rgb(var(--color-text-secondary))]">
												{t("shareModal.fieldNotes")}
											</span>
										</label>
									)}
								</div>
							</div>
						)}

						{/* Nom du lien */}
						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("shareModal.linkTitleLabel")}
							</label>
							<div className="space-y-2">
								<label className="flex items-center gap-2 cursor-pointer select-none">
									<div
										onClick={() => setShowName(!showName)}
										className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
											showName
												? "bg-[rgb(var(--color-primary))]"
												: "bg-[rgb(var(--color-border))]"
										}`}
									>
										<span
											className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
												showName
													? "translate-x-4"
													: "translate-x-0"
											}`}
										/>
									</div>
									<span className="text-sm text-[rgb(var(--color-text-secondary))]">
										{t("shareModal.showNameToggle")}
									</span>
								</label>
								{showName && (
									<div className="flex items-center gap-2">
										<Pencil
											size={14}
											className="text-[rgb(var(--color-text-tertiary))] shrink-0"
										/>
										<input
											type="text"
											value={customName}
											onChange={(e) =>
												setCustomName(e.target.value)
											}
											maxLength={100}
											placeholder={password.name}
											className="flex-1 px-3 py-1.5 text-sm bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/30"
										/>
									</div>
								)}
								{!showName && (
									<p className="text-xs text-[rgb(var(--color-text-tertiary))] flex items-center gap-1">
										<ShieldAlert size={12} />
										{t("shareModal.hiddenNameHint")}
									</p>
								)}
							</div>
						</div>

						{/* Expiry */}
						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("shareModal.expiryLabel")}
							</label>
							<div className="grid grid-cols-2 gap-2">
								{EXPIRY_OPTIONS.map((opt) => (
									<button
										key={opt.hours}
										type="button"
										onClick={() =>
											setExpiresInHours(opt.hours)
										}
										className={`px-3 py-2 text-sm rounded-lg border transition-all cursor-pointer ${
											expiresInHours === opt.hours
												? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] font-medium"
												: "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-text-secondary))]"
										}`}
									>
										{t(opt.labelKey)}
									</button>
								))}
							</div>
						</div>

						{/* Max views */}
						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("shareModal.maxViewsLabel")}
							</label>
							<div className="flex items-center gap-3">
								<input
									type="range"
									min={1}
									max={10}
									value={maxViews}
									onChange={(e) =>
										setMaxViews(Number(e.target.value))
									}
									className="flex-1 accent-[rgb(var(--color-primary))]"
								/>
								<span className="text-[rgb(var(--color-text-primary))] font-semibold w-12 text-center">
									{t("shareModal.viewsCount").replace(
										"{n}",
										maxViews,
									)}
								</span>
							</div>
						</div>

						{error && (
							<p className="text-sm text-[rgb(var(--color-error))]">
								{error}
							</p>
						)}

						<div className="flex gap-3">
							<Button
								variant="secondary"
								className="flex-1"
								onClick={onClose}
							>
								{t("passwordModal.cancel")}
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={handleCreate}
								disabled={shareMutation.isPending}
							>
								{shareMutation.isPending
									? t("shareModal.creating")
									: t("shareModal.createBtn")}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800 flex items-center gap-2">
							<CheckCircle size={15} className="shrink-0" />
							<span>
								{t("shareModal.linkCreated")}{" "}
								<strong>
									{t(
										EXPIRY_OPTIONS.find(
											(o) => o.hours === expiresInHours,
										)?.labelKey ?? "",
									)}
								</strong>{" "}
								• <strong>{maxViews}</strong>{" "}
								{t("shareModal.use")}
								{maxViews > 1 ? "s" : ""}
							</span>
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
								{t("shareModal.shareLink")}
							</label>
							<div className="flex gap-2">
								<input
									type="text"
									readOnly
									value={shareLink}
									className="flex-1 px-3 py-2 text-sm bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] truncate"
								/>
								<Button
									variant={copied ? "success" : "secondary"}
									size="sm"
									onClick={handleCopyLink}
									className="shrink-0"
								>
									{copied
										? t("shareModal.copied")
										: t("shareModal.copy")}
								</Button>
							</div>
						</div>

						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 space-y-1.5">
							<p className="flex items-center gap-1.5">
								<TriangleAlert size={12} className="shrink-0" />
								{t("shareModal.warningShare")}
							</p>
							<p className="font-semibold flex items-start gap-1.5">
								<Key size={12} className="shrink-0 mt-0.5" />
								<span>{t("shareModal.warningKey")}</span>
							</p>
						</div>

						<Button
							variant="primary"
							className="w-full"
							onClick={onClose}
						>
							{t("shareModal.close")}
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
