"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import FolderIcon from "@/components/icons/Folder";
import LockIcon from "@/components/icons/Lock";
import PlusIcon from "@/components/icons/Plus";
import TrashIcon from "@/components/icons/Trash";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import AlertModal from "@/components/modals/AlertModal";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
	useAddFolder,
	useDeleteFolder,
	useFolders,
	useUpdateFolder,
} from "@/hooks/useApi";
import { Pencil } from "lucide-react";
import { useState } from "react";

const PRESET_COLORS = [
	{ id: 1, title: "Indigo", color: "#6366f1" },
	{ id: 2, title: "Purple", color: "#8b5cf6" },
	{ id: 3, title: "Pink", color: "#ec4899" },
	{ id: 4, title: "Red", color: "#ef4444" },
	{ id: 5, title: "Orange", color: "#f59e0b" },
	{ id: 14, title: "Lime", color: "#84cc16" },
	{ id: 6, title: "Green", color: "#10b981" },
	{ id: 7, title: "Cyan", color: "#06b6d4" },
	{ id: 8, title: "Blue", color: "#3b82f6" },
	{ id: 9, title: "Teal", color: "#14b8a6" },
	{ id: 13, title: "Yellow", color: "#eab308" },
	{ id: 10, title: "Orange-red", color: "#f97316" },
	{ id: 12, title: "Gray", color: "#6b7280" },
	{ id: 11, title: "Black", color: "#000000" },
];

function FoldersPage() {
	const { data: folders = [], isLoading: loading } = useFolders();
	const addFolderMutation = useAddFolder();
	const deleteFolderMutation = useDeleteFolder();
	const updateFolderMutation = useUpdateFolder();
	const { t, locale } = useLanguage();

	const [isCreating, setIsCreating] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");
	const [newFolderDescription, setNewFolderDescription] = useState("");
	const [newFolderColor, setNewFolderColor] = useState(
		PRESET_COLORS[0].color,
	);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [folderToDelete, setFolderToDelete] = useState(null);
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [editingFolder, setEditingFolder] = useState(null); // { id, name, description, color }

	const handleCreateFolder = async (e) => {
		e.preventDefault();
		if (!newFolderName.trim()) return;

		try {
			await addFolderMutation.mutateAsync({
				name: newFolderName,
				description: newFolderDescription,
				color: newFolderColor,
			});
			setNewFolderName("");
			setNewFolderDescription("");
			setNewFolderColor(PRESET_COLORS[0].color);
			setIsCreating(false);
		} catch (error) {
			console.error("Error creating folder:", error);
			setErrorMessage(t("folders.errorCreate"));
			setShowErrorAlert(true);
		}
	};

	const handleDeleteFolder = async () => {
		try {
			await deleteFolderMutation.mutateAsync(folderToDelete);
			setFolderToDelete(null);
		} catch (error) {
			console.error("Error deleting folder:", error);
			setErrorMessage(t("folders.errorDelete"));
			setShowErrorAlert(true);
		}
	};

	const handleUpdateFolder = async (e) => {
		e.preventDefault();
		if (!editingFolder?.name?.trim()) return;
		try {
			await updateFolderMutation.mutateAsync({
				id: editingFolder.id,
				name: editingFolder.name,
				description: editingFolder.description,
				color: editingFolder.color,
			});
			setEditingFolder(null);
		} catch (error) {
			console.error("Error updating folder:", error);
			setErrorMessage(t("folders.errorUpdate"));
			setShowErrorAlert(true);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen">
				<Header
					onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
				/>
				<Sidebar
					isOpen={isSidebarOpen}
					onClose={() => setIsSidebarOpen(false)}
				/>
				<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
					<div className="flex items-center justify-center h-96">
						<div className="text-center">
							<FolderIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
							<p className="text-[rgb(var(--color-text-secondary))]">
								{t("folders.loading")}
							</p>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8 bg-linear-to-br from-gray-50 via-white to-gray-50 min-h-screen">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div
						className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
						data-tour="folders-intro"
					>
						<div>
							<div className="flex items-center gap-3 mb-2">
								<div className="w-12 h-12 bg-linear-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center shadow-lg">
									<FolderIcon className="w-6 h-6 text-indigo-600" />
								</div>
								<div>
									<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
										{t("folders.title")}
									</h1>
									<p className="text-sm text-gray-500">
										{folders.length}{" "}
										{folders.length !== 1
											? t("folders.folders")
											: t("folders.folder")}
									</p>
								</div>
							</div>
						</div>
						<Button
							variant="primary"
							onClick={() => setIsCreating(true)}
							className="shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
							data-tour="create-folder"
						>
							<PlusIcon className="w-5 h-5 sm:mr-2" />
							<span className="hidden sm:inline">
								{t("folders.newButton")}
							</span>
							<span className="sm:hidden">
								{t("folders.newButtonShort")}
							</span>
						</Button>
					</div>

					{/* Create Folder Form */}
					{isCreating && (
						<div className="mb-8 animate-slide-down">
							<Card className="border-2 border-indigo-200 shadow-xl bg-white overflow-hidden">
								<div className="bg-linear-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
									<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
										<PlusIcon className="w-5 h-5 text-indigo-600" />
										{t("folders.createTitle")}
									</h3>
								</div>
								<form
									onSubmit={handleCreateFolder}
									className="p-6"
								>
									<div className="space-y-5">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												{t("folders.nameLabel")}{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<Input
												type="text"
												placeholder={t(
													"folders.namePlaceholder",
												)}
												value={newFolderName}
												onChange={(e) =>
													setNewFolderName(
														e.target.value,
													)
												}
												autoFocus
												required
												className="text-base"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												{t("folders.descLabel")}
												<span className="text-gray-400 font-normal ml-1">
													{t("folders.optional")}
												</span>
											</label>
											<Input
												type="text"
												placeholder={t(
													"folders.descPlaceholder",
												)}
												value={newFolderDescription}
												onChange={(e) =>
													setNewFolderDescription(
														e.target.value,
													)
												}
												className="text-base"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-3">
												{t("folders.colorLabel")}
											</label>
											<div className="flex gap-2.5 flex-wrap">
												{PRESET_COLORS.map((obj) => (
													<button
														key={obj.id}
														type="button"
														onClick={() =>
															setNewFolderColor(
																obj.color,
															)
														}
														className={`relative w-11 h-11 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
															newFolderColor ===
															obj.color
																? "ring-3 ring-offset-2 shadow-lg scale-110"
																: "hover:shadow-md"
														}`}
														style={{
															backgroundColor:
																obj.color,
															boxShadow:
																newFolderColor ===
																obj.color
																	? `0 0 0 3px ${obj}40`
																	: "",
														}}
														title={obj.title}
													>
														{newFolderColor ===
															obj && (
															<svg
																className="w-6 h-6 text-white absolute inset-0 m-auto"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		3
																	}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														)}
													</button>
												))}
											</div>
										</div>

										<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
											<Button
												type="submit"
												variant="primary"
												disabled={
													addFolderMutation.isPending
												}
												className="flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all"
											>
												{addFolderMutation.isPending ? (
													<>
														<svg
															className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
															xmlns="http://www.w3.org/2000/svg"
															fill="none"
															viewBox="0 0 24 24"
														>
															<circle
																className="opacity-25"
																cx="12"
																cy="12"
																r="10"
																stroke="currentColor"
																strokeWidth="4"
															></circle>
															<path
																className="opacity-75"
																fill="currentColor"
																d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
															></path>
														</svg>
														{t("folders.creating")}
													</>
												) : (
													<>
														<PlusIcon className="w-4 h-4 mr-2" />
														{t("folders.createButton")}
													</>
												)}
											</Button>
											<Button
												type="button"
												variant="secondary"
												onClick={() => {
													setIsCreating(false);
													setNewFolderName("");
													setNewFolderDescription("");
													setNewFolderColor(
														PRESET_COLORS[0],
													);
												}}
												className="flex-1 sm:flex-none"
											>
												{t("folders.cancel")}
											</Button>
										</div>
									</div>
								</form>
							</Card>
						</div>
					)}

					{/* Folders Grid */}
					{folders.length > 0 ? (
						<div
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
							data-tour="folder-list"
						>
							{folders.map((folder) => (
								<Card
									key={folder.id}
									className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border border-gray-200 hover:border-transparent"
									onClick={() =>
										(window.location.href = `/folders/${folder.slug}`)
									}
								>
									{/* Gradient overlay on hover */}
									<div
										className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
										style={{
											backgroundColor:
												folder.color || "#6366f1",
										}}
									/>

									{/* Color accent bar */}
									<div
										className="absolute top-0 left-0 right-0 h-1 transition-all duration-300 group-hover:h-2"
										style={{
											backgroundColor:
												folder.color || "#6366f1",
										}}
									/>

									<div className="relative p-5">
										<div className="flex items-start gap-4 mb-4">
											<div
												className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
												style={{
													backgroundColor:
														folder.color ||
														"#6366f1",
												}}
											>
												<FolderIcon className="w-7 h-7" />
											</div>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setEditingFolder({
														id: folder.id,
														name: folder.name,
														description:
															folder.description ||
															"",
														color:
															folder.color ||
															"#6366f1",
													});
												}}
												className="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-gray-400 hover:text-[rgb(var(--color-primary))] hover:bg-gray-100 rounded-xl hover:scale-110 active:scale-95 cursor-pointer"
												title={t("folders.editTooltip")}
											>
												<Pencil className="w-4 h-4" />
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setFolderToDelete(
														folder.id,
													);
													setShowConfirmDelete(true);
												}}
												className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 text-red-500 hover:bg-red-50 rounded-xl hover:scale-110 active:scale-95 cursor-pointer"
												title={t(
													"folders.deleteTooltip",
												)}
											>
												<TrashIcon className="w-5 h-5" />
											</button>
										</div>

										<div className="space-y-2">
											<h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-gray-700 transition-colors">
												{folder.name}
											</h3>
											{folder.description ? (
												<p className="text-sm text-gray-500 line-clamp-2 min-h-10">
													{folder.description}
												</p>
											) : (
												<p className="text-sm text-gray-400 italic min-h-10">
													{t("folders.noDescription")}
												</p>
											)}

											<div className="flex items-center gap-2 pt-3 border-t border-gray-100">
												<LockIcon className="w-4 h-4 text-gray-400" />
												<p className="text-sm font-semibold text-gray-700">
													{folder._count?.passwords ||
														0}{" "}
													<span className="text-gray-500 font-normal">
														{(folder._count?.passwords || 0) !== 1 ? t("folders.passwords") : t("folders.password")}
													</span>
												</p>
											</div>
										</div>
									</div>
								</Card>
							))}
						</div>
					) : (
						<Card className="text-center py-16 md:py-20 bg-linear-to-br from-gray-50 to-white border-2 border-dashed border-gray-300">
							<div className="w-20 h-20 md:w-24 md:h-24 bg-linear-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
								<FolderIcon className="w-10 h-10 md:w-12 md:h-12 text-indigo-600" />
							</div>
							<h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
								{t("folders.emptyTitle")}
							</h3>
							<p className="text-gray-600 mb-6 max-w-md mx-auto px-4">
								{t("folders.emptyDesc")}
								<br className="hidden sm:block" />
								{t("folders.emptyDescLine2")}
							</p>
							<Button
								variant="primary"
								onClick={() => setIsCreating(true)}
								className="shadow-lg hover:shadow-xl transition-all text-base px-6 py-3"
							>
								<PlusIcon className="w-5 h-5 mr-2" />
								{t("folders.createFirst")}
							</Button>
						</Card>
					)}

					{/* Edit Folder Form */}
					{editingFolder && (
						<div className="mt-8 animate-slide-down">
							<Card className="border-2 border-[rgb(var(--color-primary))]/30 shadow-xl bg-white overflow-hidden">
								<div className="bg-linear-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-teal-100">
									<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
										<Pencil className="w-5 h-5 text-[rgb(var(--color-primary))]" />
										{locale === "fr"
											? `Modifier « ${editingFolder.name} »`
											: `Edit «${editingFolder.name}»`}
									</h3>
								</div>
								<form
									onSubmit={handleUpdateFolder}
									className="p-6"
								>
									<div className="space-y-5">
										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												{t("folders.nameLabel")}{" "}
												<span className="text-red-500">
													*
												</span>
											</label>
											<Input
												type="text"
												value={editingFolder.name}
												onChange={(e) =>
													setEditingFolder({
														...editingFolder,
														name: e.target.value,
													})
												}
												autoFocus
												required
												className="text-base"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-2">
												{t("folders.descLabel")}
												<span className="text-gray-400 font-normal ml-1">
													{t("folders.optional")}
												</span>
											</label>
											<Input
												type="text"
												value={
													editingFolder.description
												}
												onChange={(e) =>
													setEditingFolder({
														...editingFolder,
														description:
															e.target.value,
													})
												}
												placeholder={t(
													"folders.descPlaceholder",
												)}
												className="text-base"
											/>
										</div>

										<div>
											<label className="block text-sm font-semibold text-gray-700 mb-3">
												{t("folders.colorLabel")}
											</label>
											<div className="flex gap-2.5 flex-wrap">
												{PRESET_COLORS.map((obj) => (
													<button
														key={obj.id}
														type="button"
														onClick={() =>
															setEditingFolder({
																...editingFolder,
																color: obj.color,
															})
														}
														className={`relative w-11 h-11 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer ${
															editingFolder.color ===
															obj.color
																? "ring-3 ring-offset-2 shadow-lg scale-110"
																: "hover:shadow-md"
														}`}
														style={{
															backgroundColor:
																obj.color,
														}}
														title={obj.title}
													>
														{editingFolder.color ===
															obj.color && (
															<svg
																className="w-6 h-6 text-white absolute inset-0 m-auto"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={
																		3
																	}
																	d="M5 13l4 4L19 7"
																/>
															</svg>
														)}
													</button>
												))}
											</div>
										</div>

										<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
											<Button
												type="submit"
												variant="primary"
												disabled={
													updateFolderMutation.isPending
												}
												className="flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all"
											>
												{updateFolderMutation.isPending
													? t("folders.saving")
													: t("folders.saveChanges")}
											</Button>
											<Button
												type="button"
												variant="secondary"
												onClick={() =>
													setEditingFolder(null)
												}
												className="flex-1 sm:flex-none"
											>
												{t("folders.cancel")}
											</Button>
										</div>
									</div>
								</form>
							</Card>
						</div>
					)}
				</div>
			</main>

			{/* Modales */}
			<ConfirmModal
				isOpen={showConfirmDelete}
				onClose={() => setShowConfirmDelete(false)}
				onConfirm={handleDeleteFolder}
				title={t("folders.deleteTitle")}
				message={t("folders.deleteMessage")}
				confirmText={t("folders.deleteConfirm")}
				variant="danger"
			/>
			<AlertModal
				isOpen={showErrorAlert}
				onClose={() => setShowErrorAlert(false)}
				title={t("folders.errorAlertTitle")}
				message={errorMessage}
				variant="error"
			/>
		</div>
	);
}

export default withAuthProtection(FoldersPage);
