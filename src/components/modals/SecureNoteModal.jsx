"use client";

import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAddSecureNote, useUpdateSecureNote } from "@/hooks/useApi";
import { Lock } from "lucide-react";
import { useState } from "react";

export default function SecureNoteModal({ note, onClose }) {
	const isEditing = !!note;
	const [title, setTitle] = useState(note?.title ?? "");
	const [content, setContent] = useState(note?.content ?? "");
	const [error, setError] = useState("");

	const addMutation = useAddSecureNote();
	const updateMutation = useUpdateSecureNote();
	const isPending = addMutation.isPending || updateMutation.isPending;
	const { t } = useLanguage();

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");

		if (!title.trim()) return setError(t("secureNoteModal.errTitle"));
		if (!content.trim()) return setError(t("secureNoteModal.errContent"));

		try {
			if (isEditing) {
				await updateMutation.mutateAsync({
					id: note.id,
					title: title.trim(),
					content,
				});
			} else {
				await addMutation.mutateAsync({
					title: title.trim(),
					content,
				});
			}
			onClose();
		} catch (err) {
			setError(err.message || t("secureNoteModal.errSave"));
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
							? t("secureNoteModal.editTitle")
							: t("secureNoteModal.addTitle")}
					</h2>
					<button
						onClick={onClose}
						className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors text-2xl leading-none cursor-pointer"
					>
						×
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col flex-1 min-h-0 gap-4 overflow-y-auto"
				>
					{/* Title */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
							{t("secureNoteModal.titleLabel")}{" "}
							<span className="text-[rgb(var(--color-error))]">
								*
							</span>
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder={t("secureNoteModal.titlePlaceholder")}
							maxLength={100}
							className="w-[99%] mx-0.5 px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
						/>
					</div>

					{/* Content */}
					<div className="flex-1 flex flex-col">
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-1">
							{t("secureNoteModal.contentLabel")}{" "}
							<span className="text-[rgb(var(--color-error))]">
								*
							</span>
						</label>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={t(
								"secureNoteModal.contentPlaceholder",
							)}
							rows={6}
							className="w-[99%] mx-0.5 px-4 py-2.5 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-lg text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] resize-y min-h-[140px] max-h-96 font-mono text-sm"
						/>
					</div>

					<p className="text-xs text-[rgb(var(--color-text-tertiary))] flex items-center gap-1.5">
						<Lock size={12} />
						{t("secureNoteModal.encryptedNote")}
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
							{t("secureNoteModal.cancel")}
						</Button>
						<Button
							variant="primary"
							className="flex-1"
							type="submit"
							disabled={isPending}
						>
							{isPending
								? t("secureNoteModal.saving")
								: isEditing
									? t("secureNoteModal.save")
									: t("secureNoteModal.create")}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
