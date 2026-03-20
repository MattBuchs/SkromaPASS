"use client";

import PasswordCard from "@/components/PasswordCard";
import Header from "@/components/layout/Header";
import AddPasswordModal from "@/components/modals/AddPasswordModal";
import EditPasswordModal from "@/components/modals/EditPasswordModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFolders, usePasswords } from "@/hooks/useApi";
import { ArrowLeft, FolderOpen, Lock, Plus, Search } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function FolderDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { data: folders = [], isLoading: loadingFolders } = useFolders();
	const { data: passwords = [], isLoading: loadingPasswords } =
		usePasswords();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editingPassword, setEditingPassword] = useState(null);
	const [searchQuery, setSearchQuery] = useState("");
	const { t } = useLanguage();

	const slug = params.slug;
	const folder = folders.find((f) => f.slug === slug);

	// Filtrer les mots de passe du dossier
	const folderPasswords = passwords.filter((p) => p.folderId === folder?.id);

	// Filtrer par recherche
	const filteredPasswords = folderPasswords.filter((password) => {
		const normalize = (str) =>
			str
				?.normalize("NFD")
				.replace(/[\u0300-\u036f]/g, "")
				.toLowerCase() ?? "";
		const query = normalize(searchQuery);
		return (
			normalize(password.name).includes(query) ||
			normalize(password.username).includes(query) ||
			normalize(password.email).includes(query) ||
			normalize(password.website).includes(query)
		);
	});

	if (loadingFolders || loadingPasswords) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="w-16 h-16 md:w-20 md:h-20 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
						<FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
					</div>
					<p className="text-gray-600 font-medium">
						{t("folderDetail.loading")}
					</p>
				</div>
			</div>
		);
	}

	if (!folder) {
		return (
			<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
				<div className="text-center max-w-md">
					<div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-red-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
						<svg
							className="w-10 h-10 md:w-12 md:h-12 text-red-500"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
						{t("folderDetail.notFound")}
					</h2>
					<p className="text-gray-600 mb-6">
						{t("folderDetail.notFoundDesc")}
					</p>
					<button
						onClick={() => router.push("/folders")}
						className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
					>
						<ArrowLeft className="w-5 h-5" />
						{t("folderDetail.backToFolders")}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
			<Header
				onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
				menuDispayed={false}
			/>

			<div className="p-4 md:p-6 lg:p-8 xl:ml-48 mt-16">
				{/* Breadcrumb */}
				<div className="mb-6 md:mb-8">
					<button
						onClick={() => router.push("/folders")}
						className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all mb-4 group cursor-pointer px-4 py-2"
					>
						<ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
						<span className="font-medium">
							{t("folderDetail.backToFolders")}
						</span>
					</button>
					<div className="flex items-center gap-2 text-sm">
						<span className="text-gray-500">
							{t("folderDetail.breadcrumbFolders")}
						</span>
						<svg
							className="w-4 h-4 text-gray-400"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span className="text-gray-900 font-semibold">
							{folder.name}
						</span>
					</div>
				</div>

				{/* En-tête du dossier */}
				<div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
					{/* Gradient background */}
					<div
						className="absolute inset-0 opacity-5"
						style={{ backgroundColor: folder.color }}
					/>

					{/* Color accent */}
					<div
						className="absolute top-0 left-0 right-0 h-2"
						style={{ backgroundColor: folder.color }}
					/>

					<div className="relative p-6 md:p-8">
						<div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
							<div className="flex items-start gap-4 md:gap-6 flex-1">
								<div
									className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
									style={{ backgroundColor: folder.color }}
								>
									<FolderOpen className="w-8 h-8 md:w-10 md:h-10 text-white" />
								</div>
								<div className="flex-1 min-w-0">
									<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 wrap-break-word">
										{folder.name}
									</h1>
									{folder.description ? (
										<p className="text-gray-600 text-sm md:text-base mb-3">
											{folder.description}
										</p>
									) : (
										<p className="text-gray-400 text-sm md:text-base mb-3 italic">
											{t("folderDetail.noDescription")}
										</p>
									)}
									<div className="flex items-center gap-2 text-sm md:text-base">
										<Lock className="w-4 h-4 text-gray-400" />
										<p className="font-semibold text-gray-700">
											{folderPasswords.length}{" "}
											<span className="text-gray-500 font-normal">
												{folderPasswords.length > 1
													? t(
															"folderDetail.passwords",
														)
													: t(
															"folderDetail.password",
														)}
											</span>
										</p>
									</div>
								</div>
							</div>
							<button
								onClick={() => setShowAddModal(true)}
								className="flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 w-full lg:w-auto font-medium cursor-pointer"
								style={{
									backgroundColor: folder.color,
									filter: "brightness(1)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.filter =
										"brightness(0.9)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.filter =
										"brightness(1)")
								}
							>
								<Plus className="w-5 h-5" />
								<span className="hidden sm:inline">
									{t("folderDetail.addPassword")}
								</span>
								<span className="sm:hidden">
									{t("folderDetail.addPasswordShort")}
								</span>
							</button>
						</div>
					</div>
				</div>

				{/* Barre de recherche */}
				{folderPasswords.length > 0 && (
					<div className="mb-6 md:mb-8">
						<div className="relative group">
							<Search
								className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors"
								style={{
									color: searchQuery
										? folder.color
										: undefined,
								}}
							/>
							<input
								type="text"
								placeholder={t(
									"folderDetail.searchPlaceholder",
								)}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm hover:shadow-md text-base"
								style={{
									"--tw-ring-color": folder.color,
								}}
								onFocus={(e) => {
									e.target.style.borderColor = folder.color;
									e.target.previousElementSibling.style.color =
										folder.color;
								}}
								onBlur={(e) => {
									if (!searchQuery) {
										e.target.style.borderColor = "";
										e.target.previousElementSibling.style.color =
											"";
									}
								}}
							/>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
								>
									<svg
										className="w-5 h-5"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							)}
						</div>
					</div>
				)}

				{/* Liste des mots de passe */}
				{filteredPasswords.length === 0 ? (
					<div className="bg-white rounded-2xl shadow-lg p-12 md:p-16 text-center border-2 border-dashed border-gray-300">
						<div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
							<Lock className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
						</div>
						<h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
							{searchQuery
								? t("folderDetail.noResults")
								: t("folderDetail.emptyFolder")}
						</h3>
						<p className="text-gray-600 mb-8 max-w-md mx-auto">
							{searchQuery
								? t("folderDetail.noResultsDesc")
								: t("folderDetail.emptyFolderDesc")}
						</p>
						{!searchQuery && (
							<button
								onClick={() => setShowAddModal(true)}
								className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium cursor-pointer"
								style={{
									backgroundColor: folder.color,
									filter: "brightness(1)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.filter =
										"brightness(0.9)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.filter =
										"brightness(1)")
								}
							>
								<Plus className="w-5 h-5" />
								{t("folderDetail.addFirst")}
							</button>
						)}
					</div>
				) : (
					<>
						{/* Stats bar */}
						<div className="mb-6 flex items-center justify-between bg-white rounded-xl px-6 py-4 shadow-sm border border-gray-200">
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<span className="font-semibold text-gray-900">
									{filteredPasswords.length}
								</span>
								{searchQuery
									? t("folderDetail.results")
									: t("folderDetail.passwordsCount")}
							</div>
							{searchQuery && (
								<button
									onClick={() => setSearchQuery("")}
									className="text-sm font-medium transition-all cursor-pointer"
									style={{ color: folder.color }}
									onMouseEnter={(e) =>
										(e.currentTarget.style.opacity = "0.8")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.opacity = "1")
									}
								>
									{t("folderDetail.clearSearch")}
								</button>
							)}
						</div>

						{/* Grid des mots de passe */}
						<div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
							{filteredPasswords.map((password) => (
								<PasswordCard
									key={password.id}
									password={password}
									onEdit={setEditingPassword}
								/>
							))}
						</div>
					</>
				)}

				{/* Modals */}
				{showAddModal && (
					<AddPasswordModal
						isOpen={showAddModal}
						onClose={() => setShowAddModal(false)}
						defaultFolderId={folder.id}
					/>
				)}

				{editingPassword && (
					<EditPasswordModal
						isOpen={!!editingPassword}
						onClose={() => setEditingPassword(null)}
						password={editingPassword}
					/>
				)}
			</div>
		</div>
	);
}
