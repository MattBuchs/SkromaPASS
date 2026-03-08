"use client";

import Button from "@/components/ui/Button";
import { useSharePassword } from "@/hooks/useApi";
import { useState } from "react";

const EXPIRY_OPTIONS = [
	{ label: "1 heure", hours: 1 },
	{ label: "24 heures", hours: 24 },
	{ label: "3 jours", hours: 72 },
	{ label: "7 jours", hours: 168 },
];

export default function SharePasswordModal({ password, onClose }) {
	const [expiresInHours, setExpiresInHours] = useState(24);
	const [maxViews, setMaxViews] = useState(1);
	const [shareLink, setShareLink] = useState("");
	const [copied, setCopied] = useState(false);
	const [error, setError] = useState("");
	const shareMutation = useSharePassword();

	async function handleCreate() {
		setError("");
		try {
			const data = await shareMutation.mutateAsync({
				passwordId: password.id,
				expiresInHours,
				maxViews,
			});
			const link = `${window.location.origin}/share/${data.token}`;
			setShareLink(link);
		} catch (err) {
			setError(err.message || "Erreur lors de la création du lien");
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
							Partager ce mot de passe
						</h2>
						<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-0.5 truncate max-w-xs">
							{password.name}
						</p>
					</div>
					<button
						onClick={onClose}
						className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors text-2xl leading-none"
					>
						×
					</button>
				</div>

				{!isCreated ? (
					<div className="space-y-5">
						{/* Security notice */}
						<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
							🔐 Le mot de passe sera chiffré dans le lien. Le
							destinataire pourra le déchiffrer sans avoir de
							compte.
						</div>

						{/* Expiry */}
						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								Expiration du lien
							</label>
							<div className="grid grid-cols-2 gap-2">
								{EXPIRY_OPTIONS.map((opt) => (
									<button
										key={opt.hours}
										type="button"
										onClick={() =>
											setExpiresInHours(opt.hours)
										}
										className={`px-3 py-2 text-sm rounded-lg border transition-all ${
											expiresInHours === opt.hours
												? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] font-medium"
												: "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-text-secondary))]"
										}`}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						{/* Max views */}
						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								Nombre d&apos;utilisations maximum
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
									{maxViews} fois
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
								Annuler
							</Button>
							<Button
								variant="primary"
								className="flex-1"
								onClick={handleCreate}
								disabled={shareMutation.isPending}
							>
								{shareMutation.isPending
									? "Création..."
									: "Créer le lien"}
							</Button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
							✅ Lien créé avec succès ! Valide{" "}
							<strong>
								{
									EXPIRY_OPTIONS.find(
										(o) => o.hours === expiresInHours,
									)?.label
								}
							</strong>{" "}
							• <strong>{maxViews}</strong> utilisation
							{maxViews > 1 ? "s" : ""}
						</div>

						<div>
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
								Lien de partage
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
									{copied ? "Copié !" : "Copier"}
								</Button>
							</div>
						</div>

						<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
							⚠️ Partagez ce lien uniquement avec la personne
							concernée. Après expiration ou épuisement des vues,
							il ne sera plus accessible.
						</div>

						<Button
							variant="primary"
							className="w-full"
							onClick={onClose}
						>
							Fermer
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
