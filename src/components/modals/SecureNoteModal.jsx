"use client";

import Button from "@/components/ui/Button";
import { useAddSecureNote, useUpdateSecureNote } from "@/hooks/useApi";
import { useState } from "react";

const TYPE_OPTIONS = [
	{
		id: "NOTE",
		label: "📝 Note libre",
		placeholder: "Écrivez votre note ici...",
	},
	{
		id: "CARD",
		label: "💳 Carte bancaire",
		placeholder:
			"Numéro: 4111 1111 1111 1111\nExpiration: 12/28\nCVV: 123\nTitulaire: Jean Dupont",
	},
	{
		id: "PIN",
		label: "🔢 Code PIN / code secret",
		placeholder: "Code PIN: 1234\nCompte/service: Ma banque",
	},
	{
		id: "IDENTITY",
		label: "🪪 Identité / document",
		placeholder:
			"Prénom: Jean\nNom: Dupont\nDate de naissance: 01/01/1990\nNuméro de passeport: AB123456",
	},
];

export default function SecureNoteModal({ note, onClose }) {
	const isEditing = !!note;
	const [title, setTitle] = useState(note?.title ?? "");
	const [type, setType] = useState(note?.type ?? "NOTE");
	const [content, setContent] = useState(note?.content ?? "");
	const [error, setError] = useState("");

	const addMutation = useAddSecureNote();
	const updateMutation = useUpdateSecureNote();
	const isPending = addMutation.isPending || updateMutation.isPending;

	const selectedType =
		TYPE_OPTIONS.find((t) => t.id === type) ?? TYPE_OPTIONS[0];

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");

		if (!title.trim()) return setError("Le titre est requis");
		if (!content.trim()) return setError("Le contenu est requis");

		try {
			if (isEditing) {
				await updateMutation.mutateAsync({
					id: note.id,
					title: title.trim(),
					type,
					content,
				});
			} else {
				await addMutation.mutateAsync({
					title: title.trim(),
					type,
					content,
				});
			}
			onClose();
		} catch (err) {
			setError(err.message || "Erreur lors de la sauvegarde");
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-lg bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl p-6 z-10 max-h-[90vh] flex flex-col">
				{/* Header */}
				<div className="flex items-center justify-between mb-5">
					<h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
						{isEditing
							? "Modifier la note"
							: "Nouvelle note sécurisée"}
					</h2>
					<button
						onClick={onClose}
						className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors text-2xl leading-none"
					>
						×
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col flex-1 min-h-0 gap-4 overflow-y-auto"
				>
					{/* Type selector */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							Type
						</label>
						<div className="grid grid-cols-2 gap-2">
							{TYPE_OPTIONS.map((t) => (
								<button
									key={t.id}
									type="button"
									onClick={() => setType(t.id)}
									className={`px-3 py-2 text-sm rounded-lg border transition-all text-left ${
										type === t.id
											? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-primary))] font-medium"
											: "border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-text-secondary))]"
									}`}
								>
									{t.label}
								</button>
							))}
						</div>
					</div>

					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
							Titre{" "}
							<span className="text-[rgb(var(--color-error))]">
								*
							</span>
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Ex: Carte Visa, Code wifi maison..."
							maxLength={100}
							className="w-full px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
						/>
					</div>

					{/* Content */}
					<div className="flex-1 flex flex-col">
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
							Contenu{" "}
							<span className="text-[rgb(var(--color-error))]">
								*
							</span>
						</label>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={selectedType.placeholder}
							rows={6}
							className="w-full px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] resize-none font-mono text-sm"
						/>
					</div>

					<p className="text-xs text-[rgb(var(--color-text-tertiary))] flex items-center gap-1">
						🔐 Le contenu est chiffré avec AES-256-GCM avant
						d&apos;être stocké
					</p>

					{error && (
						<p className="text-sm text-[rgb(var(--color-error))]">
							{error}
						</p>
					)}

					<div className="flex gap-3 pt-1">
						<Button
							variant="secondary"
							className="flex-1"
							type="button"
							onClick={onClose}
						>
							Annuler
						</Button>
						<Button
							variant="primary"
							className="flex-1"
							type="submit"
							disabled={isPending}
						>
							{isPending
								? "Sauvegarde..."
								: isEditing
									? "Enregistrer"
									: "Créer la note"}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
