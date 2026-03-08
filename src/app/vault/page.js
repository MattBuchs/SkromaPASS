"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ReauthModal from "@/components/modals/ReauthModal";
import SecureNoteModal from "@/components/modals/SecureNoteModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useReauth } from "@/contexts/ReauthContext";
import { useDeleteSecureNote, useSecureNotes } from "@/hooks/useApi";
import { useState } from "react";

const TYPE_ICONS = {
	NOTE: "📝",
	CARD: "💳",
	PIN: "🔢",
	IDENTITY: "🪪",
};

const TYPE_LABELS = {
	NOTE: "Note libre",
	CARD: "Carte bancaire",
	PIN: "Code PIN",
	IDENTITY: "Identité",
};

function getTimeAgo(date) {
	const seconds = Math.floor((new Date() - new Date(date)) / 1000);
	const intervals = {
		an: 31536000,
		mois: 2592000,
		semaine: 604800,
		jour: 86400,
		heure: 3600,
		minute: 60,
	};
	for (const [unit, s] of Object.entries(intervals)) {
		const n = Math.floor(seconds / s);
		if (n >= 1)
			return `Il y a ${n} ${unit}${n > 1 && unit !== "mois" ? "s" : ""}`;
	}
	return "À l'instant";
}

function SecureNoteCard({ note, onEdit, onDelete }) {
	const [expanded, setExpanded] = useState(false);
	const [revealed, setRevealed] = useState(false);
	const [copied, setCopied] = useState(false);
	const { isRecentlyAuthenticated, markAsAuthenticated } = useReauth();
	const [showReauth, setShowReauth] = useState(false);
	const [pendingAction, setPendingAction] = useState(null);

	async function requireReauth(action) {
		const ok = await isRecentlyAuthenticated();
		if (!ok) {
			setPendingAction(action);
			setShowReauth(true);
			return false;
		}
		return true;
	}

	async function handleReveal() {
		if (!revealed) {
			if (!(await requireReauth("reveal"))) return;
		}
		setRevealed(!revealed);
	}

	async function handleCopy() {
		if (!(await requireReauth("copy"))) return;
		await navigator.clipboard.writeText(note.content ?? "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	function handleReauthSuccess() {
		markAsAuthenticated();
		setShowReauth(false);
		if (pendingAction === "reveal") setRevealed(true);
		if (pendingAction === "copy") {
			navigator.clipboard.writeText(note.content ?? "");
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		setPendingAction(null);
	}

	return (
		<Card hover className="group">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center text-xl shrink-0">
						{TYPE_ICONS[note.type] ?? "📝"}
					</div>
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h3 className="font-semibold text-[rgb(var(--color-text-primary))] truncate">
								{note.title}
							</h3>
							<span className="text-xs px-2 py-0.5 rounded-full bg-[rgb(var(--color-background))] text-[rgb(var(--color-text-tertiary))] border border-[rgb(var(--color-border))] shrink-0">
								{TYPE_LABELS[note.type] ?? note.type}
							</span>
						</div>
						<p className="text-xs text-[rgb(var(--color-text-tertiary))] italic">
							Modifié {getTimeAgo(note.updatedAt)}
						</p>

						{/* Content reveal */}
						{expanded && (
							<div className="mt-3">
								{revealed ? (
									<pre className="text-sm text-[rgb(var(--color-text-primary))] whitespace-pre-wrap font-mono bg-[rgb(var(--color-background))] p-3 rounded-lg border border-[rgb(var(--color-border))] overflow-x-auto">
										{note.content}
									</pre>
								) : (
									<p className="text-sm text-[rgb(var(--color-text-tertiary))] italic">
										🔒 Contenu masqué — cliquez sur 👁 pour
										révéler
									</p>
								)}
							</div>
						)}

						<button
							onClick={() => setExpanded(!expanded)}
							className="text-xs text-[rgb(var(--color-primary))] hover:underline mt-2"
						>
							{expanded ? "Masquer" : "Voir le contenu"}
						</button>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
					<button
						onClick={handleReveal}
						title={revealed ? "Masquer" : "Révéler"}
						className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
					>
						{revealed ? "🙈" : "👁"}
					</button>
					<button
						onClick={handleCopy}
						title="Copier"
						className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors relative"
					>
						{copied ? "✅" : "📋"}
					</button>
					<button
						onClick={() => onEdit(note)}
						title="Modifier"
						className="p-2 text-[rgb(var(--color-primary))] hover:opacity-80 transition-opacity"
					>
						✏️
					</button>
					<button
						onClick={() => onDelete(note)}
						title="Supprimer"
						className="p-2 text-[rgb(var(--color-error))] hover:opacity-80 transition-opacity"
					>
						🗑️
					</button>
				</div>
			</div>

			{showReauth && (
				<ReauthModal
					onSuccess={handleReauthSuccess}
					onClose={() => setShowReauth(false)}
				/>
			)}
		</Card>
	);
}

function VaultPage() {
	const { data: notes = [], isLoading } = useSecureNotes();
	const deleteMutation = useDeleteSecureNote();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [editingNote, setEditingNote] = useState(null);
	const [noteToDelete, setNoteToDelete] = useState(null);
	const [typeFilter, setTypeFilter] = useState("ALL");

	const types = ["ALL", ...new Set(notes.map((n) => n.type))];

	const filtered =
		typeFilter === "ALL"
			? notes
			: notes.filter((n) => n.type === typeFilter);

	function handleEdit(note) {
		setEditingNote(note);
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setEditingNote(null);
	}

	async function handleDelete() {
		if (!noteToDelete) return;
		try {
			await deleteMutation.mutateAsync(noteToDelete.id);
		} finally {
			setNoteToDelete(null);
		}
	}

	return (
		<div className="min-h-screen">
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<div data-tour="sidebar">
				<Sidebar
					isOpen={isSidebarOpen}
					onClose={() => setIsSidebarOpen(false)}
				/>
			</div>

			<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
				<div className="max-w-4xl mx-auto">
					{/* Page Header */}
					<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
						<div>
							<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-1">
								Notes sécurisées
							</h1>
							<p className="text-[rgb(var(--color-text-secondary))]">
								Cartes bancaires, codes PIN, identités et notes
								chiffrées
							</p>
						</div>
						<Button
							variant="primary"
							className="flex items-center gap-2 shrink-0"
							onClick={() => {
								setEditingNote(null);
								setShowModal(true);
							}}
						>
							<span className="text-lg">+</span>
							<span>Nouvelle note</span>
						</Button>
					</div>

					{/* Type filters */}
					{notes.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-6">
							{types.map((t) => (
								<button
									key={t}
									onClick={() => setTypeFilter(t)}
									className={`px-3 py-1.5 text-sm rounded-full transition-all ${
										typeFilter === t
											? "bg-[rgb(var(--color-primary))] text-white"
											: "bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-[rgb(var(--color-primary))]"
									}`}
								>
									{t === "ALL"
										? `Tous (${notes.length})`
										: `${TYPE_ICONS[t] ?? ""} ${TYPE_LABELS[t] ?? t}`}
								</button>
							))}
						</div>
					)}

					{/* Content */}
					{isLoading ? (
						<div className="text-center py-16 text-[rgb(var(--color-text-secondary))]">
							Chargement...
						</div>
					) : filtered.length === 0 ? (
						<div className="text-center py-16">
							<div className="text-5xl mb-4">🔐</div>
							<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
								{notes.length === 0
									? "Aucune note sécurisée"
									: "Aucune note dans ce filtre"}
							</h3>
							<p className="text-[rgb(var(--color-text-secondary))] mb-6 max-w-sm mx-auto">
								Stockez vos cartes bancaires, codes PIN,
								informations d&apos;identité et notes sensibles
								de façon chiffrée.
							</p>
							{notes.length === 0 && (
								<Button
									variant="primary"
									onClick={() => setShowModal(true)}
								>
									Créer ma première note
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{filtered.map((note) => (
								<SecureNoteCard
									key={note.id}
									note={note}
									onEdit={handleEdit}
									onDelete={setNoteToDelete}
								/>
							))}
						</div>
					)}
				</div>
			</main>

			{showModal && (
				<SecureNoteModal note={editingNote} onClose={closeModal} />
			)}

			{noteToDelete && (
				<ConfirmModal
					title="Supprimer la note ?"
					message={`Supprimer "${noteToDelete.title}" ? Cette action est irréversible.`}
					confirmLabel="Supprimer"
					onConfirm={handleDelete}
					onCancel={() => setNoteToDelete(null)}
				/>
			)}
		</div>
	);
}

export default withAuthProtection(VaultPage);
