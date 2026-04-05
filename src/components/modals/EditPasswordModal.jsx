"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useAddFolder, useFolders, useUpdatePassword } from "@/hooks/useApi";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import EyeIcon from "../icons/Eye";
import EyeSlashIcon from "../icons/EyeSlash";
import KeyIcon from "../icons/Key";
import Button from "../ui/Button";
import Input from "../ui/Input";
import AlertModal from "./AlertModal";

export default function EditPasswordModal({
	isOpen,
	onClose,
	onSave,
	password,
}) {
	const getInitialFormData = () => ({
		name: password?.name || "",
		username: password?.username || "",
		email: password?.email || "",
		password: password?.password || "",
		website:
			password?.website && password.website !== "https://"
				? password.website
				: "",
		notes: password?.notes || "",
		folderId: password?.folderId || "",
		strength: password?.strength || 0,
	});

	const [formData, setFormData] = useState(getInitialFormData);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(
		password?.strength || 0,
	);
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [showNewFolder, setShowNewFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	const { data: folders = [] } = useFolders();
	const { t } = useLanguage();
	const updatePasswordMutation = useUpdatePassword();
	const addFolderMutation = useAddFolder();

	const handleCreateFolder = async () => {
		if (!newFolderName.trim()) return;
		try {
			const result = await addFolderMutation.mutateAsync({
				name: newFolderName.trim(),
			});
			setFormData((prev) => ({ ...prev, folderId: result.id }));
			setNewFolderName("");
			setShowNewFolder(false);
		} catch (error) {
			console.error("Error creating folder:", error);
		}
	};

	// Réinitialiser le formulaire quand un nouveau password est chargé
	useEffect(() => {
		if (isOpen && password?.id) {
			setFormData(getInitialFormData());
			setPasswordStrength(password?.strength || 0);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [password?.id, isOpen]);

	// Calculer la force du mot de passe
	const calculatePasswordStrength = (pwd) => {
		let strength = 0;
		if (pwd.length >= 8) strength += 25;
		if (pwd.length >= 12) strength += 25;
		if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 20;
		if (/[0-9]/.test(pwd)) strength += 15;
		if (/[^a-zA-Z0-9]/.test(pwd)) strength += 15;
		return Math.min(strength, 100);
	};

	// Générer un mot de passe sécurisé
	const generatePassword = () => {
		const length = 16;
		const charset =
			"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";
		let password = "";
		for (let i = 0; i < length; i++) {
			password += charset.charAt(
				Math.floor(Math.random() * charset.length),
			);
		}
		setFormData({ ...formData, password });
		setPasswordStrength(calculatePasswordStrength(password));
	};

	const handlePasswordChange = (e) => {
		const pwd = e.target.value;
		setFormData({ ...formData, password: pwd });
		setPasswordStrength(calculatePasswordStrength(pwd));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Nettoyer les données avant l'envoi (ne pas envoyer l'id dans le body, il est dans l'URL)
			const dataToSend = {
				name: formData.name,
				username: formData.username || "",
				email: formData.email || "",
				password: formData.password,
				website:
					formData.website && formData.website !== "https://"
						? formData.website
						: "",
				notes: formData.notes || "",
				folderId: formData.folderId || "",
				strength: passwordStrength,
			};

			await updatePasswordMutation.mutateAsync({
				id: password.id,
				...dataToSend,
			});

			onSave();
			onClose();
			// Réinitialiser le formulaire
			setFormData({
				name: "",
				username: "",
				email: "",
				password: "",
				website: "",
				notes: "",
				strength: 0,
			});
			setPasswordStrength(0);
		} catch (error) {
			console.error("Error updating password:", error);
			setShowErrorAlert(true);
		}
	};

	if (!isOpen) return null;

	const getStrengthColor = () => {
		if (passwordStrength < 40) return "bg-red-500";
		if (passwordStrength < 70) return "bg-orange-500";
		return "bg-green-500";
	};

	const getStrengthLabel = () => {
		if (passwordStrength < 40) return t("passwordModal.strengthWeak");
		if (passwordStrength < 70) return t("passwordModal.strengthMedium");
		return t("passwordModal.strengthStrong");
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onClose}
			/>
			<div className="relative bg-[rgb(var(--color-surface))] rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col z-10">
				<div className="sticky top-0 z-10 p-6 border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] rounded-t-2xl">
					<div className="flex items-center justify-between">
						<h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">
							{t("passwordModal.editTitle")}
						</h2>
						<button
							type="button"
							onClick={onClose}
							className="text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
						>
							<svg
								className="w-6 h-6"
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
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="p-6 space-y-6 overflow-y-auto flex-1"
				>
					{/* Nom */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.editNameLabel")}
						</label>
						<Input
							type="text"
							placeholder={t("passwordModal.editNamePlaceholder")}
							value={formData.name}
							onChange={(e) => {
								const value = e.target.value.slice(0, 18);
								setFormData({
									...formData,
									name: value,
								});
							}}
							required
							maxLength={18}
							name="service-name"
							autoComplete="service-name"
						/>
					</div>

					{/* Dossier */}
					<div>
						<div className="flex items-center justify-between mb-2">
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))]">
								{t("passwordModal.folderLabel")}
							</label>
							<button
								type="button"
								onClick={() => setShowNewFolder((v) => !v)}
								className="flex items-center gap-1 text-xs text-[rgb(var(--color-primary))] hover:underline cursor-pointer"
							>
								<Plus className="w-3 h-3" />
								{t("passwordModal.folderNew")}
							</button>
						</div>
						<select
							value={formData.folderId}
							onChange={(e) =>
								setFormData({
									...formData,
									folderId: e.target.value,
								})
							}
							className="w-full px-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
						>
							<option value="">
								{t("passwordModal.folderNone")}
							</option>
							{folders.map((folder) => (
								<option key={folder.id} value={folder.id}>
									{folder.name}
								</option>
							))}
						</select>
						{showNewFolder && (
							<div className="mt-2 flex gap-2">
								<input
									type="text"
									placeholder={t(
										"passwordModal.folderNamePlaceholder",
									)}
									value={newFolderName}
									onChange={(e) =>
										setNewFolderName(e.target.value)
									}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleCreateFolder();
										}
									}}
									autoFocus
									className="flex-1 rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] px-3 py-1.5 text-sm text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20"
								/>
								<button
									type="button"
									onClick={handleCreateFolder}
									disabled={
										!newFolderName.trim() ||
										addFolderMutation.isPending
									}
									className="px-3 py-1.5 text-sm bg-[rgb(var(--color-primary))] text-white rounded-md hover:bg-[rgb(var(--color-primary-dark))] disabled:opacity-50 cursor-pointer transition-colors"
								>
									{addFolderMutation.isPending
										? "..."
										: t("passwordModal.folderCreate")}
								</button>
							</div>
						)}
					</div>

					{/* Username */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.usernameLabel")}
						</label>
						<Input
							type="text"
							placeholder={t(
								"passwordModal.editUsernamePlaceholder",
							)}
							value={formData.username}
							onChange={(e) =>
								setFormData({
									...formData,
									username: e.target.value,
								})
							}
							name="username"
							autoComplete="username"
						/>
					</div>

					{/* Email */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.emailLabel")}
						</label>
						<Input
							type="email"
							placeholder={t(
								"passwordModal.editEmailPlaceholder",
							)}
							value={formData.email}
							onChange={(e) =>
								setFormData({
									...formData,
									email: e.target.value,
								})
							}
							name="email"
							autoComplete="email"
						/>
					</div>

					{/* Mot de passe */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.passwordLabel")}
						</label>
						<div className="relative">
							<Input
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={formData.password}
								onChange={handlePasswordChange}
								required
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors cursor-pointer"
							>
								{showPassword ? (
									<EyeSlashIcon className="w-5 h-5" />
								) : (
									<EyeIcon className="w-5 h-5" />
								)}
							</button>
						</div>

						{/* Barre de force */}
						<div className="mt-2">
							<div className="flex items-center justify-between mb-1">
								<span className="text-xs text-[rgb(var(--color-text-tertiary))]">
									{t("passwordModal.strengthLabel")}
								</span>
								<span
									className={`text-xs font-medium ${
										passwordStrength < 40
											? "text-red-500"
											: passwordStrength < 70
												? "text-orange-500"
												: "text-green-500"
									}`}
								>
									{getStrengthLabel()}
								</span>
							</div>
							<div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded-full overflow-hidden">
								<div
									className={`h-full ${getStrengthColor()} transition-all duration-300`}
									style={{ width: `${passwordStrength}%` }}
								/>
							</div>
						</div>

						{/* Générer mot de passe */}
						<button
							type="button"
							onClick={generatePassword}
							className="mt-2 text-sm text-[rgb(var(--color-primary))] hover:text-[rgb(var(--color-primary-dark))] font-medium flex items-center gap-2 cursor-pointer"
						>
							<KeyIcon className="w-4 h-4" />
							{t("passwordModal.generateSecure")}
						</button>
					</div>

					{/* Site web */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.websiteLabel")}
						</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgb(var(--color-text-tertiary))] pointer-events-none z-10">
								https://
							</span>
							<input
								type="text"
								placeholder={t(
									"passwordModal.websitePlaceholder",
								)}
								value={formData.website.replace(
									/^https:\/\//,
									"",
								)}
								onChange={(e) => {
									let value = e.target.value.replace(
										/^https:\/\//,
										"",
									);
									setFormData({
										...formData,
										website: value
											? `https://${value}`
											: "",
									});
								}}
								className="w-full pl-[70px] pr-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors"
							/>
						</div>
					</div>

					{/* Notes */}
					<div>
						<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
							{t("passwordModal.notesLabel")}
						</label>
						<textarea
							placeholder={t("passwordModal.notesPlaceholder")}
							value={formData.notes}
							onChange={(e) =>
								setFormData({
									...formData,
									notes: e.target.value,
								})
							}
							rows={4}
							className="w-full px-4 py-3 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-xl text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:border-[rgb(var(--color-primary))] transition-colors resize-none"
						/>
					</div>
				</form>

				{/* Footer - Sticky */}
				<div className="sticky bottom-0 z-10 bg-[rgb(var(--color-surface))] border-t border-[rgb(var(--color-border))] px-6 py-4 rounded-b-2xl flex gap-3">
					<Button
						type="button"
						variant="secondary"
						onClick={onClose}
						disabled={updatePasswordMutation.isPending}
						className="flex-1"
					>
						{t("passwordModal.cancel")}
					</Button>
					<Button
						type="button"
						variant="primary"
						disabled={updatePasswordMutation.isPending}
						className="flex-1"
						onClick={(e) => {
							e.preventDefault();
							const modalContainer = e.target.closest(".fixed");
							const form = modalContainer?.querySelector("form");
							if (form) form.requestSubmit();
						}}
					>
						{updatePasswordMutation.isPending
							? t("passwordModal.editSubmitting")
							: t("passwordModal.editSubmit")}
					</Button>
				</div>
			</div>

			{/* Modale d'erreur */}
			<AlertModal
				isOpen={showErrorAlert}
				onClose={() => setShowErrorAlert(false)}
				title={t("passwordModal.errorTitle")}
				message={t("passwordModal.editError")}
				variant="error"
			/>
		</div>
	);
}
