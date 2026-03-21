"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useReauth } from "@/contexts/ReauthContext";
import { useDeletePassword } from "@/hooks/useApi";
import { ArrowBigDownDash, ArrowBigRightDash, Share2 } from "lucide-react";
import { useState } from "react";
import CopyIcon from "./icons/Copy";
import EditIcon from "./icons/Edit";
import EyeIcon from "./icons/Eye";
import EyeSlashIcon from "./icons/EyeSlash";
import TrashIcon from "./icons/Trash";
import AlertModal from "./modals/AlertModal";
import ConfirmModal from "./modals/ConfirmModal";
import ReauthModal from "./modals/ReauthModal";
import SharePasswordModal from "./modals/SharePasswordModal";
import Button from "./ui/Button";
import Card from "./ui/Card";

// Fonction pour obtenir la couleur selon le nom
function getColorForName(name) {
	const colors = [
		"bg-blue-500",
		"bg-purple-500",
		"bg-pink-500",
		"bg-red-500",
		"bg-orange-500",
		"bg-yellow-500",
		"bg-green-500",
		"bg-teal-500",
		"bg-cyan-500",
		"bg-indigo-500",
	];
	const index = name.charCodeAt(0) % colors.length;
	return colors[index];
}

// Fonction pour calculer le temps écoulé

export default function PasswordCard({ password, onEdit }) {
	const { t } = useLanguage();

	function getStrengthLabel(strength) {
		if (strength >= 70) return t("passwordModal.strengthStrong");
		if (strength >= 40) return t("passwordModal.strengthMedium");
		return t("passwordModal.strengthWeak");
	}

	function getTimeAgo(date) {
		const seconds = Math.floor((new Date() - new Date(date)) / 1000);
		const intervals = [
			{
				singular: t("passwordCard.timeUnitYear"),
				plural: t("passwordCard.timeUnitYearPlural"),
				seconds: 31536000,
			},
			{
				singular: t("passwordCard.timeUnitMonth"),
				plural: t("passwordCard.timeUnitMonthPlural"),
				seconds: 2592000,
			},
			{
				singular: t("passwordCard.timeUnitWeek"),
				plural: t("passwordCard.timeUnitWeekPlural"),
				seconds: 604800,
			},
			{
				singular: t("passwordCard.timeUnitDay"),
				plural: t("passwordCard.timeUnitDayPlural"),
				seconds: 86400,
			},
			{
				singular: t("passwordCard.timeUnitHour"),
				plural: t("passwordCard.timeUnitHourPlural"),
				seconds: 3600,
			},
			{
				singular: t("passwordCard.timeUnitMinute"),
				plural: t("passwordCard.timeUnitMinutePlural"),
				seconds: 60,
			},
		];
		const prefix = t("passwordCard.timeAgoPrefix");
		const suffix = t("passwordCard.timeAgoSuffix");
		for (const { singular, plural, seconds: siu } of intervals) {
			const interval = Math.floor(seconds / siu);
			if (interval >= 1) {
				const unit = interval > 1 ? plural : singular;
				return [prefix, interval, unit, suffix]
					.filter(Boolean)
					.join(" ");
			}
		}
		return t("passwordCard.timeAgoNow");
	}

	const [showPassword, setShowPassword] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [copied, setCopied] = useState(false);
	const [showConfirmDelete, setShowConfirmDelete] = useState(false);
	const [showErrorAlert, setShowErrorAlert] = useState(false);
	const [showReauthModal, setShowReauthModal] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);
	const [pendingAction, setPendingAction] = useState(null); // 'show', 'copy', 'edit', 'delete', 'share'
	const deletePasswordMutation = useDeletePassword();
	const { isRecentlyAuthenticated, markAsAuthenticated } = useReauth();

	const handleTogglePassword = async () => {
		// Si pas récemment authentifié, demander réauth
		const isAuth = await isRecentlyAuthenticated();
		if (!isAuth) {
			setPendingAction("show");
			setShowReauthModal(true);
			return;
		}

		// Sinon, afficher/masquer le mot de passe directement
		setShowPassword(!showPassword);
	};

	const handleReauthSuccess = () => {
		markAsAuthenticated();
		setShowReauthModal(false);

		// Exécuter l'action en attente
		switch (pendingAction) {
			case "show":
				setShowPassword(true);
				break;
			case "copy":
				navigator.clipboard.writeText(password.password);
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
				break;
			case "edit":
				onEdit(password);
				break;
			case "delete":
				setShowConfirmDelete(true);
				break;
			case "share":
				setShowShareModal(true);
				break;
		}

		setPendingAction(null);
	};

	const handleCopy = async () => {
		// Si pas récemment authentifié, demander réauth
		const isAuth = await isRecentlyAuthenticated();
		if (!isAuth) {
			setPendingAction("copy");
			setShowReauthModal(true);
			return;
		}

		navigator.clipboard.writeText(password.password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleEdit = async () => {
		// Si pas récemment authentifié, demander réauth
		const isAuth = await isRecentlyAuthenticated();
		if (!isAuth) {
			setPendingAction("edit");
			setShowReauthModal(true);
			return;
		}

		onEdit(password);
	};

	const handleDeleteClick = async () => {
		// Si pas récemment authentifié, demander réauth
		const isAuth = await isRecentlyAuthenticated();
		if (!isAuth) {
			setPendingAction("delete");
			setShowReauthModal(true);
			return;
		}

		setShowConfirmDelete(true);
	};

	const handleShare = async () => {
		const isAuth = await isRecentlyAuthenticated();
		if (!isAuth) {
			setPendingAction("share");
			setShowReauthModal(true);
			return;
		}
		setShowShareModal(true);
	};

	const handleDelete = async () => {
		try {
			await deletePasswordMutation.mutateAsync(password.id);
		} catch (error) {
			console.error("Error deleting password:", error);
			setShowErrorAlert(true);
		}
	};

	const strengthLabel = getStrengthLabel(password.strength);
	const color = getColorForName(password.name);
	const timeAgo = getTimeAgo(password.updatedAt);

	return (
		<Card hover className="group">
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 relative">
				<div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
					{/* Logo/Icon */}
					<div
						className={`w-10 h-10 sm:w-12 sm:h-12 ${color} rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md shrink-0`}
					>
						{password.name.charAt(0).toUpperCase()}
					</div>

					{/* Info */}
					<div className="flex-1 min-w-0">
						<div className="flex flex-wrap items-center gap-2 mb-1">
							<h3 className="text-base sm:text-lg font-semibold text-[rgb(var(--color-text-primary))] wrap-break-word">
								{password.name}
							</h3>
							<span
								className={`px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
									password.strength >= 70
										? "bg-green-100 text-green-700"
										: password.strength >= 40
											? "bg-yellow-100 text-yellow-700"
											: "bg-red-100 text-red-700"
								}`}
							>
								{strengthLabel}
							</span>
						</div>

						{/* Username/Email */}
						{(password.username || password.email) && (
							<p className="text-sm text-[rgb(var(--color-text-secondary))] mb-1">
								{password.username || password.email}
							</p>
						)}

						{/* Website */}
						{password.website && (
							<a
								href={
									password.url ||
									`https://${password.website}`
								}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm text-[rgb(var(--color-primary))] hover:underline mb-2 inline-block truncate w-full max-w-sm"
							>
								{password.website}
							</a>
						)}

						<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
							{password.folder && (
								<span className="flex items-center gap-1">
									📁 {password.folder.name}
								</span>
							)}
							<span className="sm:inline w-full sm:w-auto italic">
								{t("passwordCard.modifiedPrefix")}
								{timeAgo}
							</span>
						</div>

						{/* Notes - Expandable */}
						{password.notes && (
							<div className="mt-3">
								<button
									onClick={() => setShowDetails(!showDetails)}
									className="text-xs text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer flex items-center"
								>
									{showDetails ? (
										<ArrowBigDownDash />
									) : (
										<ArrowBigRightDash />
									)}{" "}
									<span className="ml-1 text-sm">
										{t("passwordCard.notesLabel")}
									</span>
								</button>
								{showDetails && (
									<p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2 p-3 bg-[rgb(var(--color-background))] rounded-md border border-[rgb(var(--color-border))]">
										{password.notes}
									</p>
								)}
							</div>
						)}
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 sm:ml-2 flex-wrap sm:flex-nowrap justify-end">
					<Button
						variant="ghost"
						size="sm"
						onClick={handleTogglePassword}
						className="p-2"
						title={
							showPassword
								? t("passwordCard.hideTitle")
								: t("passwordCard.viewTitle")
						}
						aria-label={
							showPassword
								? t("passwordCard.hideTitle")
								: t("passwordCard.viewTitle")
						}
					>
						{showPassword ? (
							<EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						) : (
							<EyeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleCopy}
						className="p-2 relative"
						title={t("passwordCard.copiedTitle")}
						aria-label={t("passwordCard.copiedTitle")}
					>
						<CopyIcon className="w-4 h-4 sm:w-5 sm:h-5" />
						{copied && (
							<span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-teal-700 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
								{t("passwordCard.copied")}
							</span>
						)}
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleShare}
						className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] p-2"
						title={t("passwordCard.shareTitle")}
						aria-label={t("passwordCard.shareTitle")}
					>
						<Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleEdit}
						className="text-teal-700 hover:text-teal-800 p-2"
						title={t("passwordCard.editTitle")}
						aria-label={t("passwordCard.editTitle")}
					>
						<EditIcon className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={handleDeleteClick}
						disabled={deletePasswordMutation.isPending}
						className="text-red-600 hover:text-red-700 p-2"
						title={t("passwordCard.deleteTitle")}
						aria-label={t("passwordCard.deleteTitle")}
					>
						<TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
					</Button>
				</div>
			</div>

			{/* Password Display */}
			{showPassword && (
				<div className="mt-4 pt-4 border-t border-[rgb(var(--color-border))] animate-slide-down">
					<div className="flex items-center justify-between bg-[rgb(var(--color-background))] rounded-lg p-3">
						<code className="text-sm font-mono text-[rgb(var(--color-text-primary))]">
							{password.password}
						</code>
						{copied && (
							<span className="text-xs text-[rgb(var(--color-success))] font-medium">
								{t("passwordCard.copied")}
							</span>
						)}
					</div>
				</div>
			)}

			{/* Modales */}
			<ReauthModal
				isOpen={showReauthModal}
				onClose={() => setShowReauthModal(false)}
				onSuccess={handleReauthSuccess}
			/>
			<ConfirmModal
				isOpen={showConfirmDelete}
				onClose={() => setShowConfirmDelete(false)}
				onConfirm={handleDelete}
				title={t("passwordCard.deleteTitle")}
				message={`${t("passwordCard.deleteMessagePrefix")}${password.name}${t("passwordCard.deleteMessageSuffix")}`}
				confirmText={t("passwordCard.deleteConfirmBtn")}
				variant="danger"
			/>
			<AlertModal
				isOpen={showErrorAlert}
				onClose={() => setShowErrorAlert(false)}
				title={t("passwordCard.errorTitle")}
				message={t("passwordCard.errorMessage")}
				variant="error"
			/>
			{showShareModal && (
				<SharePasswordModal
					password={password}
					onClose={() => setShowShareModal(false)}
				/>
			)}
		</Card>
	);
}
