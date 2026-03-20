"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import ReauthModal from "@/components/modals/ReauthModal";
import SecureNoteModal from "@/components/modals/SecureNoteModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useReauth } from "@/contexts/ReauthContext";
import { useDeleteSecureNote, useSecureNotes } from "@/hooks/useApi";
import { Check, Clipboard, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

function getTimeAgo(date, locale) {
	const seconds = Math.floor((new Date() - new Date(date)) / 1000);
	if (locale === "fr") {
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
		return "\u00c0 l'instant";
	} else {
		const intervals = {
			year: 31536000,
			month: 2592000,
			week: 604800,
			day: 86400,
			hour: 3600,
			minute: 60,
		};
		for (const [unit, s] of Object.entries(intervals)) {
			const n = Math.floor(seconds / s);
			if (n >= 1) return `${n} ${unit}${n > 1 ? "s" : ""} ago`;
		}
		return "Just now";
	}
}

function SecureNoteCard({ note, onEdit, onDelete }) {
	const [expanded, setExpanded] = useState(false);
	const [copied, setCopied] = useState(false);
	const { isRecentlyAuthenticated, markAsAuthenticated } = useReauth();
	const { t, locale } = useLanguage();
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

	async function handleToggleContent() {
		if (expanded) {
			setExpanded(false);
			return;
		}
		if (!(await requireReauth("reveal"))) return;
		setExpanded(true);
	}

	async function handleCopy() {
		if (!(await requireReauth("copy"))) return;
		await navigator.clipboard.writeText(note.content ?? "");
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	async function handleEdit() {
		if (!(await requireReauth("edit"))) return;
		onEdit(note);
	}

	async function handleDelete() {
		if (!(await requireReauth("delete"))) return;
		onDelete(note);
	}

	function handleReauthSuccess() {
		markAsAuthenticated();
		setShowReauth(false);
		if (pendingAction === "reveal") setExpanded(true);
		if (pendingAction === "copy") {
			navigator.clipboard.writeText(note.content ?? "");
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
		if (pendingAction === "edit") onEdit(note);
		if (pendingAction === "delete") onDelete(note);
		setPendingAction(null);
	}

	return (
		<Card hover className="group">
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-start gap-3 flex-1 min-w-0">
					<div className="w-10 h-10 rounded-xl bg-[rgb(var(--color-primary))]/10 flex items-center justify-center shrink-0">
						<FileText
							size={20}
							className="text-[rgb(var(--color-primary))]"
						/>
					</div>
					<div className="flex-1 min-w-0">
						<h3 className="font-semibold text-[rgb(var(--color-text-primary))] truncate mb-1">
							{note.title}
						</h3>
						<p className="text-xs text-[rgb(var(--color-text-tertiary))] italic">
							{t("vault.modifiedPrefix")}{" "}
							{getTimeAgo(note.updatedAt, locale)}
						</p>

						{/* Content */}
						{expanded && (
							<pre className="mt-3 text-sm text-[rgb(var(--color-text-primary))] whitespace-pre-wrap font-mono bg-[rgb(var(--color-background))] p-3 rounded-lg border border-[rgb(var(--color-border))] overflow-x-auto">
								{note.content}
							</pre>
						)}

						<button
							onClick={handleToggleContent}
							className="text-xs text-[rgb(var(--color-primary))] hover:underline mt-2 cursor-pointer"
						>
							{expanded
								? t("vault.hide")
								: t("vault.viewContent")}
						</button>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
					<button
						onClick={handleCopy}
						title={t("vault.copyContent")}
						className="p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
					>
						{copied ? <Check size={16} /> : <Clipboard size={16} />}
					</button>
					<button
						onClick={handleEdit}
						title={t("vault.editAction")}
						className="p-2 text-[rgb(var(--color-primary))] hover:opacity-80 transition-opacity cursor-pointer"
					>
						<Pencil size={16} />
					</button>
					<button
						onClick={handleDelete}
						title={t("vault.deleteAction")}
						className="p-2 text-[rgb(var(--color-error))] hover:opacity-80 transition-opacity cursor-pointer"
					>
						<Trash2 size={16} />
					</button>
				</div>
			</div>

			{showReauth && (
				<ReauthModal
					isOpen={showReauth}
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
	const { t, locale } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [editingNote, setEditingNote] = useState(null);
	const [noteToDelete, setNoteToDelete] = useState(null);

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
								{t("vault.title")}
							</h1>
							<p className="text-[rgb(var(--color-text-secondary))]">
								{t("vault.subtitle")}
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
							<span>{t("vault.newNote")}</span>
						</Button>
					</div>

					{/* Type filters removed — single note type */}

					{/* Content */}
					{isLoading ? (
						<div className="text-center py-16 text-[rgb(var(--color-text-secondary))]">
							{t("vault.loading")}
						</div>
					) : notes.length === 0 ? (
						<div className="text-center py-16">
							<div className="flex justify-center mb-4">
								<FileText
									size={48}
									className="text-[rgb(var(--color-text-tertiary))]"
								/>
							</div>
							<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
								{notes.length === 0
									? t("vault.emptyTitle")
									: t("vault.emptyTitleAlt")}
							</h3>
							<p className="text-[rgb(var(--color-text-secondary))] mb-6 max-w-sm mx-auto">
								{t("vault.emptyDesc")}
							</p>
							{notes.length === 0 && (
								<Button
									variant="primary"
									onClick={() => setShowModal(true)}
								>
									{t("vault.createFirst")}
								</Button>
							)}
						</div>
					) : (
						<div className="space-y-3">
							{notes.map((note) => (
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
					isOpen={true}
					title={t("vault.deleteTitle")}
					message={
						locale === "fr"
							? `Supprimer "${noteToDelete.title}" ? Cette action est irréversible.`
							: `Delete "${noteToDelete.title}"? This action is irreversible.`
					}
					confirmText={t("vault.deleteConfirm")}
					onConfirm={handleDelete}
					onClose={() => setNoteToDelete(null)}
				/>
			)}
		</div>
	);
}

export default withAuthProtection(VaultPage);
