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
				throw new Error(data.error || "Erreur lors de la mise à jour");
			}

			queryClient.invalidateQueries({ queryKey: queryKeys.userProfile });
			showMessage("success", "Profil mis à jour avec succès");
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
			showMessage("error", "Les mots de passe ne correspondent pas");
			return;
		}

		if (passwordData.newPassword.length < 8) {
			showMessage(
				"error",
				"Le mot de passe doit contenir au moins 8 caractères",
			);
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
				throw new Error(data.error || "Erreur lors du changement");
			}

			showMessage("success", "Mot de passe changé avec succès");
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
			showMessage("error", "Veuillez entrer votre mot de passe");
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
				throw new Error(data.error || "Erreur lors de la suppression");
			}

			showMessage("success", "Compte supprimé. Redirection...");
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
								Paramètres
							</h1>
						</div>
						<p className="text-[rgb(var(--color-text-secondary))]">
							Gérez vos préférences et paramètres de sécurité
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
							Compte
						</button>
						<button
							onClick={() => setActiveTab("security")}
							className={`px-4 py-3 font-medium transition-colors cursor-pointer ${
								activeTab === "security"
									? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
									: "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
							}`}
						>
							Sécurité
						</button>
					</div>

					{/* Account Tab */}
					{activeTab === "account" && (
						<div className="space-y-6">
							<Card>
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									Informations du compte
								</h3>
								<form onSubmit={handleUpdateProfile}>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												Nom
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
												placeholder="Votre nom"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												Email
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
												? "Enregistrement..."
												: "Enregistrer les modifications"}
										</Button>
									</div>
								</form>
							</Card>

							<Card>
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									Modifier le mot de passe principal
								</h3>
								<form onSubmit={handleChangePassword}>
									<div className="space-y-4">
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												Mot de passe actuel
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
												placeholder="Votre mot de passe actuel"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												Nouveau mot de passe
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
												placeholder="Au moins 8 caractères"
												minLength={8}
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
												Confirmer le mot de passe
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
												placeholder="Confirmer le nouveau mot de passe"
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
												? "Changement..."
												: "Changer le mot de passe"}
										</Button>
									</div>
								</form>
							</Card>

							<Card data-tour="settings-menu">
								<h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
									Informations générales
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
										<span className="text-[rgb(var(--color-text-secondary))]">
											Compte créé le
										</span>
										<span className="text-[rgb(var(--color-text-primary))] font-medium">
											{fullProfile?.createdAt
												? new Date(
														fullProfile.createdAt,
													).toLocaleDateString(
														"fr-FR",
													)
												: "Chargement..."}
										</span>
									</div>
									<div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
										<span className="text-[rgb(var(--color-text-secondary))]">
											Email vérifié
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
													? "Vérifié"
													: "Non vérifié"
												: "Chargement..."}
										</span>
									</div>
									<div className="flex justify-between py-2">
										<span className="text-[rgb(var(--color-text-secondary))]">
											Mots de passe enregistrés
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
									Supprimer le compte
								</h3>
								<div className="space-y-4">
									<div>
										<p className="text-sm text-red-700 mb-3">
											Cette action est irréversible. Votre
											compte et tous vos mots de passe
											seront définitivement supprimés.
											Assurez-vous d&apos;avoir sauvegardé
											toutes les informations importantes
											avant de procéder.
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
												placeholder="Entrez votre mot de passe pour confirmer"
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
												Supprimer définitivement mon
												compte
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
				title="Supprimer votre compte"
				message="Êtes-vous sûr de vouloir supprimer votre compte ? Tous vos mots de passe seront définitivement supprimés. Cette action est irréversible."
				confirmText="Supprimer mon compte"
				variant="danger"
			/>
		</div>
	);
}

export default withAuthProtection(SettingsPage);
