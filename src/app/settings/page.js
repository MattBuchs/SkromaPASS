"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import SettingsIcon from "@/components/icons/Settings";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ConfirmModal from "@/components/modals/ConfirmModal";
import BiometricSettings from "@/components/settings/BiometricSettings";
import PinCodeSettings from "@/components/settings/PinCodeSettings";
import TwoFactorSettings from "@/components/settings/TwoFactorSettings";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { queryKeys, useUserProfile } from "@/hooks/useApi";
import { useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function SettingsPage() {
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();
	const tabParam = searchParams.get("tab");
	const [activeTab, setActiveTab] = useState(tabParam || "account");
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState({ type: "", text: "" });
	const { t, locale } = useLanguage();

	// Profil chargé via React Query (mis en cache entre les navigations)
	const { data: fullProfile } = useUserProfile();

	// Données du profil pour l'édition — synchronisées depuis le cache
	const [profileData, setProfileData] = useState({
		email: "",
		name: "",
	});

	useEffect(() => {
		if (fullProfile) {
			setProfileData({
				email: fullProfile.email || "",
				name: fullProfile.name || "",
			});
		}
	}, [fullProfile]);

	// Données du changement de mot de passe
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	// Données de suppression de compte
	const [deletePassword, setDeletePassword] = useState("");
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);

	// Mettre à jour l'onglet actif si le paramètre URL change
	useEffect(() => {
		if (tabParam) {
			setActiveTab(tabParam);
		}
	}, [tabParam]);

	// Fonction pour afficher un message
	const showMessage = (type, text) => {
		setMessage({ type, text });
		setTimeout(() => setMessage({ type: "", text: "" }), 8000);
	};

	// Mettre à jour le profil
	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch("/api/user/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(profileData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("settings.errProfileUpdate"));
			}

			queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
			showMessage("success", t("settings.successProfile"));
		} catch (error) {
			showMessage("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	// Changer le mot de passe
	const handleChangePassword = async (e) => {
		e.preventDefault();

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			showMessage("error", t("settings.errPasswordMismatch"));
			return;
		}

		if (passwordData.newPassword.length < 8) {
			showMessage("error", t("settings.errPasswordTooShort"));
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/user/password", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentPassword: passwordData.currentPassword,
					newPassword: passwordData.newPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("settings.errPasswordChange"));
			}

			showMessage("success", t("settings.successPassword"));
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error) {
			showMessage("error", error.message);
		} finally {
			setLoading(false);
		}
	};

	// Supprimer le compte
	const handleDeleteAccount = async () => {
		if (!deletePassword) {
			showMessage("error", t("settings.errMustEnterPassword"));
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/user/delete", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password: deletePassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("settings.errDeleteAccount"));
			}

			showMessage("success", t("settings.successDelete"));
			setTimeout(() => {
				signOut({ callbackUrl: "/login" });
			}, 2000);
		} catch (error) {
			showMessage("error", error.message);
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen">
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
				<div className="max-w-5xl mx-auto">
					{/* Header */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<SettingsIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
							<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("settings.title")}
							</h1>
						</div>
						<p className="text-[rgb(var(--color-text-secondary))]">
							{t("settings.subtitle")}
						</p>
					</div>

					{/* Message de feedback */}
					{message.text && (
						<div
							className={`mb-6 p-4 rounded-lg ${
								message.type === "success"
									? "bg-green-50 text-green-800 border border-green-200"
									: "bg-red-50 text-red-800 border border-red-200"
							}`}
						>
							{message.text}
						</div>
					)}

					{/* Tabs */}
					<div className="flex gap-2 mb-6 border-b border-[rgb(var(--color-border))]">
						<button
							onClick={() => setActiveTab("account")}
							className={`px-4 py-3 font-medium transition-colors cursor-pointer ${
								activeTab === "account"
									? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
									: "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
							}`}
						>
							{t("settings.tabAccount")}
						</button>
						<button
							onClick={() => setActiveTab("security")}
							className={`px-4 py-3 font-medium transition-colors cursor-pointer ${
								activeTab === "security"
									? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
									: "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
							}`}
						>
							{t("settings.tabSecurity")}
						</button>
					</div>

					{/* Account Tab */}
					{activeTab === "account" && (
						<div className="space-y-6">
							<Card>
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									{t("settings.accountTitle")}
								</h3>
								<form onSubmit={handleUpdateProfile}>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												{t("settings.nameLabel")}
											</label>
											<Input
												type="text"
												value={profileData.name}
												onChange={(e) =>
													setProfileData({
														...profileData,
														name: e.target.value,
													})
												}
												placeholder={t(
													"settings.namePlaceholder",
												)}
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												{t("settings.emailLabel")}
											</label>
											<Input
												type="email"
												value={profileData.email}
												onChange={(e) =>
													setProfileData({
														...profileData,
														email: e.target.value,
													})
												}
												placeholder="votre@email.com"
												required
											/>
										</div>
										<Button
											type="submit"
											variant="primary"
											disabled={loading}
											className="w-full sm:w-auto"
										>
											{loading
												? t("settings.saving")
												: t("settings.saveChanges")}
										</Button>
									</div>
								</form>
							</Card>

							<Card>
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									{t("settings.passwordTitle")}
								</h3>
								<form onSubmit={handleChangePassword}>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												{t("settings.currentPassword")}
											</label>
											<Input
												type="password"
												value={
													passwordData.currentPassword
												}
												onChange={(e) =>
													setPasswordData({
														...passwordData,
														currentPassword:
															e.target.value,
													})
												}
												placeholder={t(
													"settings.currentPasswordPlaceholder",
												)}
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												{t("settings.newPassword")}
											</label>
											<Input
												type="password"
												value={passwordData.newPassword}
												onChange={(e) =>
													setPasswordData({
														...passwordData,
														newPassword:
															e.target.value,
													})
												}
												placeholder={t(
													"settings.newPasswordPlaceholder",
												)}
												minLength={8}
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												{t("settings.confirmPassword")}
											</label>
											<Input
												type="password"
												value={
													passwordData.confirmPassword
												}
												onChange={(e) =>
													setPasswordData({
														...passwordData,
														confirmPassword:
															e.target.value,
													})
												}
												placeholder={t(
													"settings.confirmPasswordPlaceholder",
												)}
												required
											/>
										</div>
										<Button
											type="submit"
											variant="primary"
											className="w-full sm:w-auto"
											disabled={loading}
										>
											{loading
												? t("settings.changingPassword")
												: t("settings.changePassword")}
										</Button>
									</div>
								</form>
							</Card>

							<Card data-tour="settings-menu">
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									{t("settings.generalTitle")}
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
										<span className="text-[rgb(var(--color-text-secondary))]">
											{t("settings.accountCreated")}
										</span>
										<span className="text-[rgb(var(--color-text-primary))] font-medium">
											{fullProfile?.createdAt
												? new Date(
														fullProfile.createdAt,
													).toLocaleDateString(
														locale === "fr"
															? "fr-FR"
															: "en-US",
													)
												: t("settings.loading")}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
										<span className="text-[rgb(var(--color-text-secondary))]">
											{t("settings.emailVerifiedLabel")}
										</span>
										<span
											className={`font-medium text-sm px-2 py-0.5 rounded-full ${
												fullProfile?.emailVerified
													? "bg-green-100 text-green-700"
													: "bg-yellow-100 text-yellow-700"
											}`}
										>
											{fullProfile
												? fullProfile.emailVerified
													? t("settings.verified")
													: t("settings.notVerified")
												: t("settings.loading")}
										</span>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-[rgb(var(--color-text-secondary))]">
											{t("settings.savedPasswords")}
										</span>
										<span className="text-[rgb(var(--color-text-primary))] font-medium">
											{fullProfile?._count?.passwords ??
												"—"}
										</span>
									</div>
								</div>
							</Card>

							<Card className="bg-red-50 border-red-200">
								<h3 className="text-lg font-semibold text-red-900 mb-4">
									{t("settings.deleteTitle")}
								</h3>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-red-700 mb-3">
											{t("settings.deleteDesc")}
										</p>
										<div className="space-y-3">
											<Input
												type="password"
												value={deletePassword}
												onChange={(e) =>
													setDeletePassword(
														e.target.value,
													)
												}
												placeholder={t(
													"settings.deletePlaceholder",
												)}
												className="bg-white"
											/>
											<Button
												variant="danger"
												onClick={() =>
													setShowConfirmDelete(true)
												}
												disabled={
													loading || !deletePassword
												}
											>
												{t("settings.deleteButton")}
											</Button>
										</div>
									</div>
								</div>
							</Card>
						</div>
					)}

					{/* Security Tab */}
					{activeTab === "security" && (
						<div className="space-y-6">
							{/* Code PIN */}
							<Card data-tour="pin-section">
								<PinCodeSettings />
							</Card>

							{/* Empreinte / Face ID / Windows Hello */}
							<Card>
								<BiometricSettings />
							</Card>

							{/* Authentification à deux facteurs */}
							<div data-tour="2fa-section">
								<TwoFactorSettings />
							</div>
						</div>
					)}
				</div>
			</main>

			{/* Modale de confirmation de suppression */}
			<ConfirmModal
				isOpen={showConfirmDelete}
				onClose={() => setShowConfirmDelete(false)}
				onConfirm={handleDeleteAccount}
				title={t("settings.deleteModalTitle")}
				message={t("settings.deleteModalMessage")}
				confirmText={t("settings.deleteModalConfirm")}
				variant="danger"
			/>
		</div>
	);
}

export default withAuthProtection(SettingsPage);
