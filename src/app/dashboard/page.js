"use client";

import PasswordCard from "@/components/PasswordCard";
import { withAuthProtection } from "@/components/auth/withAuthProtection";
import LockIcon from "@/components/icons/Lock";
import PlusIcon from "@/components/icons/Plus";
import SearchIcon from "@/components/icons/Search";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AddPasswordModal from "@/components/modals/AddPasswordModal";
import EditPasswordModal from "@/components/modals/EditPasswordModal";
import ExportPasswordsModal from "@/components/modals/ExportPasswordsModal";
import ImportPasswordsModal from "@/components/modals/ImportPasswordsModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useFolders, usePasswords, useStats } from "@/hooks/useApi";
import { ArrowDown, ArrowUp, Download, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function Home() {
	const searchParams = useSearchParams();
	const { data: passwords = [], isLoading: loadingPasswords } =
		usePasswords();
	const { data: folders = [] } = useFolders();
	const { data: stats } = useStats();

	const [selectedFolder, setSelectedFolder] = useState("Tous");
	const [sortBy, setSortBy] = useState("recent");
	const [sortAsc, setSortAsc] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingPassword, setEditingPassword] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);

	const loading = loadingPasswords;

	// Détecter si on arrive depuis l'extension pour connexion automatique
	useEffect(() => {
		const source = searchParams.get("source");

		if (source === "extension") {
			fetch("/api/auth/extension/session-token", {
				credentials: "include",
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.token) {
						window.postMessage(
							{
								type: "MEMKEYPASS_LOGIN_TOKEN",
								token: data.token,
								user: data.user,
							},
							window.location.origin,
						);
					}
				})
				.catch(() => {});
		}
	}, [searchParams]);

	const handleSort = (key) => {
		if (sortBy === key) {
			setSortAsc((v) => !v);
		} else {
			setSortBy(key);
			setSortAsc(key === "alpha");
		}
	};

	const handleEditPassword = (password) => {
		setEditingPassword(password);
		setIsEditModalOpen(true);
	};

	const handleSaveEdit = () => {
		// React Query invalidera automatiquement les données
	};

	// Filtrer par dossier, recherche et trier
	const filteredPasswords = useMemo(() => {
		let filtered = passwords;

		// Filtrer par dossier
		if (selectedFolder !== "Tous") {
			filtered = filtered.filter((p) => p.folder?.id === selectedFolder);
		}

		// Filtrer par recherche (nom, website, url)
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(
				(p) =>
					p.name?.toLowerCase().includes(query) ||
					p.website?.toLowerCase().includes(query) ||
					p.url?.toLowerCase().includes(query),
			);
		}

		// Trier
		const sorted = [...filtered];
		if (sortBy === "recent") {
			sorted.sort((a, b) => {
				const diff = new Date(b.createdAt) - new Date(a.createdAt);
				return sortAsc ? -diff : diff;
			});
		} else if (sortBy === "alpha") {
			sorted.sort((a, b) => {
				const diff = (a.name || "").localeCompare(b.name || "", "fr");
				return sortAsc ? diff : -diff;
			});
		} else if (sortBy === "strength") {
			sorted.sort((a, b) => {
				const diff = (b.strength || 0) - (a.strength || 0);
				return sortAsc ? -diff : diff;
			});
		}

		return sorted;
	}, [passwords, selectedFolder, sortBy, sortAsc, searchQuery]);

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
					<p className="text-[rgb(var(--color-text-secondary))]">
						Chargement...
					</p>
				</div>
			</div>
		);
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

			{/* Main Content */}
			<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
				<div className="max-w-7xl mx-auto">
					{/* Page Header */}
					<div className="mb-8">
						<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
							<div>
								<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))] mb-2">
									Mes mots de passe
								</h1>
								<p className="text-[rgb(var(--color-text-secondary))]">
									Gérez tous vos mots de passe en un seul
									endroit sécurisé
								</p>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<Button
									variant="secondary"
									size="sm"
									className="flex items-center gap-1.5 cursor-pointer"
									onClick={() => setIsImportModalOpen(true)}
									title="Importer depuis Bitwarden, LastPass, Chrome..."
								>
									<Upload size={16} />
									<span className="hidden sm:inline">
										Importer
									</span>
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="flex items-center gap-1.5 cursor-pointer"
									onClick={() => setIsExportModalOpen(true)}
									title="Exporter le coffre chiffré (.mkp)"
								>
									<Download size={16} />
									<span className="hidden sm:inline">
										Exporter
									</span>
								</Button>
								<Button
									variant="primary"
									className="flex items-center gap-2"
									size="md"
									onClick={() => setIsModalOpen(true)}
									data-tour="add-password"
								>
									<PlusIcon className="w-5 h-5" />
									<span>Ajouter un mot de passe</span>
								</Button>
							</div>
						</div>

						{/* Search Bar */}
						<div className="relative max-w-2xl" data-tour="search">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
							<input
								type="text"
								placeholder="Rechercher par nom, site web ou URL..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-md text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
							/>
						</div>
					</div>

					{/* Stats Cards */}
					{stats && (
						<div
							className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
							data-tour="stats"
						>
							<Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-teal-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-teal-700 mb-1">
											Total des mots de passe
										</p>
										<p className="text-3xl font-bold text-teal-900">
											{stats.totalPasswords}
										</p>
									</div>
									<div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
										<LockIcon className="w-6 h-6 text-white" />
									</div>
								</div>
							</Card>

							<Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-green-700 mb-1">
											Mots de passe forts
										</p>
										<p className="text-3xl font-bold text-green-900">
											{stats.strongPasswords}
										</p>
									</div>
									<div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
										✓
									</div>
								</div>
							</Card>

							<Card className="bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-blue-700 mb-1">
											Score de sécurité
										</p>
										<p className="text-3xl font-bold text-blue-900">
											{stats.securityScore}%
										</p>
									</div>
									<div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
										{stats.securityScore >= 80
											? "A"
											: stats.securityScore >= 60
												? "B"
												: "C"}
									</div>
								</div>
							</Card>
						</div>
					)}

					{/* Filters & Sort */}
					<div
						className="mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-3"
						data-tour="filters"
					>
						{/* Folder filter pills */}
						<div className="flex items-center gap-2 overflow-x-auto pb-1 flex-1 pb-3">
							<button
								onClick={() => setSelectedFolder("Tous")}
								className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
									selectedFolder === "Tous"
										? "bg-[rgb(var(--color-primary))] text-white shadow-md"
										: "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
								}`}
							>
								Tous
							</button>
							{folders.map((folder) => (
								<button
									key={folder.id}
									onClick={() => setSelectedFolder(folder.id)}
									className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
										selectedFolder === folder.id
											? "bg-[rgb(var(--color-primary))] text-white shadow-md"
											: "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
									}`}
								>
									{folder.name}
								</button>
							))}
						</div>

						{/* Sort buttons */}
						<div className="flex items-center gap-1 shrink-0">
							{[
								{ key: "recent", label: "Récent" },
								{ key: "alpha", label: "A–Z" },
								{ key: "strength", label: "Force" },
							].map(({ key, label }) => {
								const active = sortBy === key;
								const Arrow = sortAsc ? ArrowUp : ArrowDown;
								return (
									<button
										key={key}
										onClick={() => handleSort(key)}
										className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
											active
												? "bg-[rgb(var(--color-primary))] text-white shadow-md"
												: "bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))]"
										}`}
									>
										{label}
										{active && <Arrow size={13} />}
									</button>
								);
							})}
						</div>
					</div>

					{/* Passwords List */}
					{filteredPasswords.length > 0 ? (
						<div className="space-y-4">
							{filteredPasswords.map((password) => (
								<PasswordCard
									key={password.id}
									password={password}
									onEdit={handleEditPassword}
								/>
							))}
						</div>
					) : (
						<Card className="text-center py-12">
							<LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-text-tertiary))] mb-4" />
							<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
								Aucun mot de passe
							</h3>
							<p className="text-[rgb(var(--color-text-secondary))] mb-4">
								{selectedFolder === "Tous"
									? "Commencez par ajouter votre premier mot de passe"
									: `Aucun mot de passe trouvé dans ce dossier`}
							</p>
							<Button
								variant="primary"
								onClick={() => setIsModalOpen(true)}
							>
								Ajouter un mot de passe
							</Button>
						</Card>
					)}
				</div>
			</main>

			{/* Modals */}
			<AddPasswordModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
			/>

			<EditPasswordModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setEditingPassword(null);
				}}
				onSave={handleSaveEdit}
				password={editingPassword}
			/>

			{isImportModalOpen && (
				<ImportPasswordsModal
					onClose={() => setIsImportModalOpen(false)}
				/>
			)}

			{isExportModalOpen && (
				<ExportPasswordsModal
					onClose={() => setIsExportModalOpen(false)}
				/>
			)}
		</div>
	);
}

export default withAuthProtection(Home);
