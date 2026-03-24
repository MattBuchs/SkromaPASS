"use client";

import PasswordCard from "@/components/PasswordCard";
import { withAuthProtection } from "@/components/auth/withAuthProtection";
import LockIcon from "@/components/icons/Lock";
import PlusIcon from "@/components/icons/Plus";
import SearchIcon from "@/components/icons/Search";
import Header from "@/components/layout/Header";
import Loading from "@/components/layout/Loading";
import Sidebar from "@/components/layout/Sidebar";
import AddPasswordModal from "@/components/modals/AddPasswordModal";
import EditPasswordModal from "@/components/modals/EditPasswordModal";
import ExportPasswordsModal from "@/components/modals/ExportPasswordsModal";
import ImportPasswordsModal from "@/components/modals/ImportPasswordsModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFolders, usePasswords, useStats } from "@/hooks/useApi";
import {
	ArrowDown,
	ArrowUp,
	ChevronLeft,
	ChevronRight,
	Download,
	Upload,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function Home() {
	const searchParams = useSearchParams();
	const { data: passwords = [], isLoading: loadingPasswords } =
		usePasswords();
	const { data: folders = [] } = useFolders();
	const { data: stats } = useStats();
	const { t } = useLanguage();

	const [selectedFolder, setSelectedFolder] = useState("ALL");
	const [sortBy, setSortBy] = useState("recent");
	const [sortAsc, setSortAsc] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editingPassword, setEditingPassword] = useState(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isImportModalOpen, setIsImportModalOpen] = useState(false);
	const [isExportModalOpen, setIsExportModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const ITEMS_PER_PAGE = 20;

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
								type: "SKROMAPASS_LOGIN_TOKEN",
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
		setCurrentPage(1);
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
		if (selectedFolder !== "ALL") {
			filtered = filtered.filter((p) => p.folder?.id === selectedFolder);
		}

		// Filtrer par recherche (nom, website, url)
		if (searchQuery.trim()) {
			const normalize = (str) =>
				str
					?.normalize("NFD")
					.replace(/[\u0300-\u036f]/g, "")
					.toLowerCase() ?? "";
			const query = normalize(searchQuery);

			filtered = filtered.filter(
				(p) =>
					normalize(p.name).includes(query) ||
					normalize(p.website).includes(query) ||
					normalize(p.email).includes(query) ||
					normalize(p.username).includes(query),
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

	const totalPages = Math.ceil(filteredPasswords.length / ITEMS_PER_PAGE);
	const paginatedPasswords = filteredPasswords.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE,
	);

	// Reset page when filters/search change
	const prevFiltersRef = React.useRef({ selectedFolder, searchQuery });
	React.useEffect(() => {
		const prev = prevFiltersRef.current;
		if (
			prev.selectedFolder !== selectedFolder ||
			prev.searchQuery !== searchQuery
		) {
			setCurrentPage(1);
			prevFiltersRef.current = { selectedFolder, searchQuery };
		}
	}, [selectedFolder, searchQuery]);

	if (loading) {
		return <Loading />;
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
								<div className="flex items-center gap-3 mb-2">
									<LockIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
									<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))]">
										{t("dashboard.title")}
									</h1>
								</div>
								<p className="text-[rgb(var(--color-text-secondary))]">
									{t("dashboard.subtitle")}
								</p>
							</div>

							<div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
								<div className="w-full flex gap-2 sm:w-auto">
									<Button
										variant="secondary"
										size="sm"
										className="flex items-center gap-1.5 cursor-pointer w-full sm:w-auto"
										onClick={() =>
											setIsImportModalOpen(true)
										}
										title={t("dashboard.importTitle")}
									>
										<Upload size={16} />
										<span>{t("dashboard.import")}</span>
									</Button>
									<Button
										variant="secondary"
										size="sm"
										className="flex items-center gap-1.5 cursor-pointer w-full sm:w-auto"
										onClick={() =>
											setIsExportModalOpen(true)
										}
										title={t("dashboard.exportTitle")}
									>
										<Download size={16} />
										<span>{t("dashboard.export")}</span>
									</Button>
								</div>
								<Button
									variant="primary"
									className="flex items-center gap-2 w-full sm:w-auto"
									size="md"
									onClick={() => setIsModalOpen(true)}
									data-tour="add-password"
								>
									<PlusIcon className="w-5 h-5" />
									<span>{t("dashboard.addPassword")}</span>
								</Button>
							</div>
						</div>

						{/* Search Bar */}
						<div className="relative max-w-2xl" data-tour="search">
							<SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
							<input
								type="text"
								placeholder={t("dashboard.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-10 pr-4 py-3 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-md text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
							/>
						</div>
					</div>

					{/* Stats Cards */}
					{stats && (
						<div
							className="grid-cols-1 md:grid-cols-3 gap-6 mb-8 hidden md:grid"
							data-tour="stats"
						>
							<Card className="bg-linear-to-br from-teal-50 to-cyan-50 border-teal-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-teal-700 mb-1">
											{t("dashboard.stats.total")}
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
											{t("dashboard.stats.strong")}
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
											{t("dashboard.stats.score")}
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
						className="mb-1 flex flex-col sm:flex-row items-start sm:items-center gap-3"
						data-tour="filters"
					>
						{/* Folder filter pills */}
						<div className="flex items-center gap-2 overflow-x-auto p-1 pb-3 flex-1 w-full">
							<Button
								onClick={() => setSelectedFolder("ALL")}
								variant={
									selectedFolder === "ALL"
										? "primary"
										: "secondary"
								}
								className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer"
							>
								{t("dashboard.filters.all")}
							</Button>
							{folders.map((folder) => (
								<Button
									key={folder.id}
									variant={
										selectedFolder === folder.id
											? "primary"
											: "secondary"
									}
									onClick={() => setSelectedFolder(folder.id)}
									className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer"
								>
									{folder.name}
								</Button>
							))}
						</div>

						{/* Sort buttons */}
						<div className="flex items-center gap-1 shrink-0 pb-2">
							{[
								{
									key: "recent",
									label: t("dashboard.filters.sort.recent"),
								},
								{ key: "alpha", label: "A–Z" },
								{
									key: "strength",
									label: t("dashboard.filters.sort.strength"),
								},
							].map(({ key, label }) => {
								const active = sortBy === key;
								const Arrow = sortAsc ? ArrowUp : ArrowDown;
								return (
									<Button
										key={key}
										onClick={() => handleSort(key)}
										variant={
											active ? "primary" : "secondary"
										}
										className="flex items-center gap-1 text-sm font-medium rounded-lg whitespace-nowrap"
									>
										{label}
										{active && <Arrow size={13} />}
									</Button>
								);
							})}
						</div>
					</div>

					{/* Passwords List */}
					{filteredPasswords.length > 0 ? (
						<>
							<div className="space-y-4">
								{paginatedPasswords.map((password) => (
									<PasswordCard
										key={password.id}
										password={password}
										onEdit={handleEditPassword}
									/>
								))}
							</div>

							{/* Pagination */}
							{totalPages > 1 && (
								<div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgb(var(--color-border))]">
									<p className="text-sm text-[rgb(var(--color-text-secondary))]">
										{(currentPage - 1) * ITEMS_PER_PAGE + 1}
										–
										{Math.min(
											currentPage * ITEMS_PER_PAGE,
											filteredPasswords.length,
										)}{" "}
										{t("dashboard.pagination.of")}{" "}
										{filteredPasswords.length}
									</p>
									<div className="flex items-center gap-1">
										<button
											onClick={() =>
												setCurrentPage((p) =>
													Math.max(1, p - 1),
												)
											}
											disabled={currentPage === 1}
											className="p-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
										>
											<ChevronLeft size={16} />
										</button>
										{Array.from(
											{ length: totalPages },
											(_, i) => i + 1,
										)
											.filter(
												(p) =>
													p === 1 ||
													p === totalPages ||
													Math.abs(p - currentPage) <=
														1,
											)
											.reduce((acc, p, idx, arr) => {
												if (
													idx > 0 &&
													p - arr[idx - 1] > 1
												)
													acc.push("…");
												acc.push(p);
												return acc;
											}, [])
											.map((p, idx) =>
												typeof p === "string" ? (
													<span
														key={`ellipsis-${idx}`}
														className="px-1 text-[rgb(var(--color-text-tertiary))] text-sm select-none"
													>
														{p}
													</span>
												) : (
													<button
														key={p}
														onClick={() =>
															setCurrentPage(p)
														}
														className={`min-w-9 h-9 px-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
															p === currentPage
																? "bg-[rgb(var(--color-primary))] text-white shadow-md"
																: "border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))]"
														}`}
													>
														{p}
													</button>
												),
											)}
										<button
											onClick={() =>
												setCurrentPage((p) =>
													Math.min(totalPages, p + 1),
												)
											}
											disabled={
												currentPage === totalPages
											}
											className="p-2 rounded-lg border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
										>
											<ChevronRight size={16} />
										</button>
									</div>
								</div>
							)}
						</>
					) : (
						<Card className="text-center py-12">
							<LockIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-text-tertiary))] mb-4" />
							<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
								{t("dashboard.empty.title")}
							</h3>
							<p className="text-[rgb(var(--color-text-secondary))] mb-4">
								{selectedFolder === "ALL"
									? t("dashboard.empty.allFolders")
									: t("dashboard.empty.folder")}
							</p>
							<Button
								variant="primary"
								onClick={() => setIsModalOpen(true)}
							>
								{t("dashboard.addPassword")}
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
