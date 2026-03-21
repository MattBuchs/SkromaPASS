"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { AlertCircle, CheckCircle, Key, Lock, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function PinCodeSettings() {
	const { t } = useLanguage();
	const [hasPin, setHasPin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [showSetup, setShowSetup] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [pin, setPin] = useState("");
	const [confirmPin, setConfirmPin] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [deletePinPassword, setDeletePinPassword] = useState("");

	useEffect(() => {
		checkPinStatus();
	}, []);

	const checkPinStatus = async () => {
		try {
			const response = await fetch("/api/user/pin");
			const data = await response.json();
			setHasPin(data.hasPin);
		} catch (error) {
			console.error("Erreur vÃ©rification PIN:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validation
		if (pin.length < 4 || pin.length > 8) {
			setError(t("pin.errLength"));
			return;
		}

		if (!/^\d+$/.test(pin)) {
			setError(t("pin.errDigitsOnly"));
			return;
		}

		if (pin !== confirmPin) {
			setError(t("pin.errMismatch"));
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/user/pin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					pin,
					currentPassword,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("pin.errSetup"));
			}

			setSuccess(
				hasPin ? t("pin.successModified") : t("pin.successCreated"),
			);
			setHasPin(true);
			setShowSetup(false);
			setCurrentPassword("");
			setPin("");
			setConfirmPin("");
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = () => {
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!deletePinPassword) return;

		setShowDeleteModal(false);
		setIsLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/user/pin", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ currentPassword: deletePinPassword }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || t("pin.errDelete"));
			}

			setSuccess(t("pin.successDeleted"));
			setHasPin(false);
		} catch (error) {
			setError(error.message);
		} finally {
			setIsLoading(false);
			setDeletePinPassword("");
		}
	};

	if (isLoading && !showSetup) {
		return (
			<div className="flex items-center justify-center py-8">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				{/* Header */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{t("pin.title")}
					</h3>
					<p className="text-sm text-gray-600">{t("pin.desc")}</p>
				</div>

				{/* Messages */}
				{error && (
					<div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
						<AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
						<p className="text-sm">{error}</p>
					</div>
				)}

				{success && (
					<div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
						<CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
						<p className="text-sm">{success}</p>
					</div>
				)}

				{/* Ã‰tat actuel */}
				{!showSetup && (
					<div className="bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div className="flex items-center gap-3 sm:gap-4">
								<div
									className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
										hasPin
											? "bg-green-100 text-green-600"
											: "bg-gray-100 text-gray-400"
									}`}
								>
									<Key className="w-6 h-6" />
								</div>
								<div className="min-w-0">
									<p className="font-medium text-gray-900">
										{hasPin
											? t("pin.configured")
											: t("pin.notConfigured")}
									</p>
									<p className="text-sm text-gray-600">
										{hasPin
											? t("pin.configuredDesc")
											: t("pin.notConfiguredDesc")}
									</p>
								</div>
							</div>
							<div className="flex gap-2 sm:gap-2 flex-wrap sm:flex-nowrap">
								<Button
									onClick={() => setShowSetup(true)}
									variant="secondary"
									className="flex-1 sm:flex-none whitespace-nowrap"
								>
									{hasPin
										? t("pin.editBtn")
										: t("pin.createBtn")}
								</Button>
								{hasPin && (
									<Button
										onClick={handleDelete}
										variant="ghost"
										className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none whitespace-nowrap"
									>
										{t("pin.deleteBtn")}
									</Button>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Formulaire de configuration */}
				{showSetup && (
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<div className="flex gap-3">
								<Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
								<div className="text-sm text-blue-800">
									<p className="font-medium mb-1">
										{t("pin.formTitle")}
									</p>
									<ul className="list-disc list-inside space-y-1 text-blue-700">
										<li>{t("pin.rule1")}</li>
										<li>{t("pin.rule2")}</li>
										<li>{t("pin.rule3")}</li>
										<li>{t("pin.rule4")}</li>
									</ul>
								</div>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								{t("pin.passwordLabel")}
							</label>
							<Input
								type="password"
								value={currentPassword}
								onChange={(e) =>
									setCurrentPassword(e.target.value)
								}
								placeholder={t("pin.passwordPlaceholder")}
								required
							/>
							<p className="text-xs text-gray-500 mt-1">
								{t("pin.passwordHint")}
							</p>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								{t("pin.newPinLabel")}
							</label>
							<Input
								type="password"
								inputMode="numeric"
								pattern="\d*"
								value={pin}
								onChange={(e) =>
									setPin(
										e.target.value
											.replace(/\D/g, "")
											.slice(0, 8),
									)
								}
								placeholder={t("pin.pinPlaceholder")}
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								{t("pin.confirmPinLabel")}
							</label>
							<Input
								type="password"
								inputMode="numeric"
								pattern="\d*"
								value={confirmPin}
								onChange={(e) =>
									setConfirmPin(
										e.target.value
											.replace(/\D/g, "")
											.slice(0, 8),
									)
								}
								placeholder={t("pin.confirmPinPlaceholder")}
								required
							/>
						</div>

						<div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
							<Button
								type="submit"
								disabled={isLoading}
								className="flex-1 w-full sm:w-auto"
							>
								{isLoading
									? t("pin.savingBtn")
									: hasPin
										? t("pin.saveEditBtn")
										: t("pin.saveCreateBtn")}
							</Button>
							<Button
								type="button"
								variant="ghost"
								className="w-full sm:w-auto"
								onClick={() => {
									setShowSetup(false);
									setCurrentPassword("");
									setPin("");
									setConfirmPin("");
									setError("");
								}}
							>
								{t("pin.cancelBtn")}
							</Button>
						</div>
					</form>
				)}
			</div>

			{/* Modale de suppression du code PIN */}
			{showDeleteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-black/50 backdrop-blur-sm"
						onClick={() => {
							setShowDeleteModal(false);
							setDeletePinPassword("");
						}}
					/>
					<div className="relative bg-[rgb(var(--color-surface))] rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-start justify-between mb-4">
							<h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("pin.deleteModalTitle")}
							</h3>
							<button
								onClick={() => {
									setShowDeleteModal(false);
									setDeletePinPassword("");
								}}
								className="text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						<p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
							{t("pin.deleteModalDesc")}`r`n{" "}
						</p>
						<div className="mb-5">
							<label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
								{t("pin.deleteModalPasswordLabel")}
							</label>
							<Input
								type="password"
								value={deletePinPassword}
								onChange={(e) =>
									setDeletePinPassword(e.target.value)
								}
								placeholder={t(
									"pin.deleteModalPasswordPlaceholder",
								)}
								onKeyDown={(e) =>
									e.key === "Enter" &&
									deletePinPassword &&
									handleConfirmDelete()
								}
								autoFocus
							/>
						</div>
						<div className="flex gap-3 justify-end">
							<Button
								variant="secondary"
								onClick={() => {
									setShowDeleteModal(false);
									setDeletePinPassword("");
								}}
							>
								{t("pin.cancelBtn")}
							</Button>
							<Button
								variant="danger"
								onClick={handleConfirmDelete}
								disabled={!deletePinPassword || isLoading}
							>
								{t("pin.deleteConfirmBtn")}
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
