"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTutorial } from "@/contexts/TutorialContext";
import { Turnstile } from "@marsidev/react-turnstile";
import {
	AlertCircle,
	CheckCircle,
	Mail,
	MessageSquare,
	PlayCircle,
	Send,
	User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactPage() {
	const router = useRouter();
	const { t, locale } = useLanguage();
	const { resetTutorial, startTutorial } = useTutorial();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [errors, setErrors] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [apiError, setApiError] = useState("");
	const [turnstileToken, setTurnstileToken] = useState(null);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Effacer l'erreur du champ modifié
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setApiError("");
		setSuccess(false);
		setIsLoading(true);

		try {
			const response = await fetch("/api/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					cfTurnstileToken: turnstileToken,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					// Erreurs de validation Zod
					const formattedErrors = {};
					data.errors.forEach((error) => {
						formattedErrors[error.field] = error.message;
					});
					setErrors(formattedErrors);
				} else {
					setApiError(data.error || "Une erreur est survenue");
				}
				return;
			}

			// Succès
			setSuccess(true);
			setFormData({ name: "", email: "", subject: "", message: "" });

			// Masquer le message de succès après 5 secondes
			setTimeout(() => setSuccess(false), 5000);
		} catch (error) {
			setApiError(
				t("contact.errorNetwork"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			<main className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
				{/* En-tête */}
				<div className="max-w-4xl mx-auto mb-6 sm:mb-8">
					<div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
						<div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
							<Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
						</div>
						<div>
							<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
								{t("contact.title")}
							</h1>
							<p className="text-sm sm:text-base text-gray-600 mt-1">
								{t("contact.subtitle")}
							</p>
						</div>
					</div>
				</div>

				<div className="max-w-4xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
						{/* Informations de contact */}
						<div className="lg:col-span-1 space-y-4 sm:space-y-6">
							{/* Card Support */}
							<aside className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow min-w-[300px]">
								<div className="flex items-start gap-3 sm:gap-4">
									<div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
										<Mail className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
									</div>
									<div>
										<h2 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
											{t("contact.supportTitle")}
										</h2>
										<p className="text-xs sm:text-sm text-gray-600 mb-2">
											{t("contact.supportResponse")}
										</p>
									</div>
								</div>
							</aside>

							{/* Card Tutoriel */}
							<div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 hover:shadow-xl transition-shadow min-w-[300px] hidden lg:block">
								<div className="flex items-start gap-3 sm:gap-4">
									<div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
										<PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
									</div>
									<div className="flex-1">
										<h2 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
											{t("contact.tutorialTitle")}
										</h2>
										<p className="text-xs sm:text-sm text-gray-600 mb-3">
											{t("contact.tutorialDesc")}
										</p>
										<button
											onClick={async () => {
												await resetTutorial();
												startTutorial();
												router.push("/dashboard");
											}}
											className="text-xs sm:text-sm text-teal-700 hover:text-teal-800 font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
										>
											{t("contact.tutorialRestart")}
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Formulaire de contact */}
						<div className="lg:col-span-2">
							<div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-200">
								{/* Message de succès */}
								{success && (
									<div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start gap-3 animate-fade-in">
										<CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
										<div>
											<p className="text-sm font-medium text-green-900">
												{t("contact.successTitle")}
											</p>
											<p className="text-xs sm:text-sm text-green-700 mt-1">
												{t("contact.successDesc")}
											</p>
										</div>
									</div>
								)}

								{/* Message d'erreur global */}
								{apiError && (
									<div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-3 animate-fade-in">
										<AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
										<p className="text-sm text-red-700">
											{apiError}
										</p>
									</div>
								)}

								<form
									onSubmit={handleSubmit}
									className="space-y-4 sm:space-y-6"
								>
									{/* Nom */}
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.nameLabel")}{" "}
											<span
												htmlFor="name"
												className="text-xs text-gray-500"
											>
												{t("contact.nameOptional")}
											</span>
										</label>
										<div className="relative">
											<Input
												type="text"
												name="name"
												id="name"
												value={formData.name}
												onChange={handleChange}
												icon={User}
												placeholder={t(
													"contact.namePlaceholder",
												)}
												className={`pl-10 ${
													errors.name
														? "border-red-500"
														: ""
												}`}
											/>
										</div>
										{errors.name && (
											<p className="mt-1 text-sm text-red-600">
												{errors.name}
											</p>
										)}
									</div>

									{/* Email */}
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.emailLabel")}
										</label>
										<div className="relative">
											<Input
												type="email"
												name="email"
												id="email"
												value={formData.email}
												onChange={handleChange}
												placeholder={t(
													"contact.emailPlaceholder",
												)}
												required
												icon={Mail}
												className={`pl-10 ${
													errors.email
														? "border-red-500"
														: ""
												}`}
											/>
										</div>
										{errors.email && (
											<p className="mt-1 text-sm text-red-600">
												{errors.email}
											</p>
										)}
									</div>

									{/* Sujet */}
									<div>
										<label
											htmlFor="subject"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.subjectLabel")}
										</label>
										<Input
											type="text"
											name="subject"
											id="subject"
											value={formData.subject}
											onChange={handleChange}
											placeholder={t(
												"contact.subjectPlaceholder",
											)}
											required
											icon={MessageSquare}
											className={
												errors.subject
													? "border-red-500"
													: ""
											}
										/>
										{errors.subject && (
											<p className="mt-1 text-sm text-red-600">
												{errors.subject}
											</p>
										)}
									</div>

									{/* Message */}
									<div>
										<label
											htmlFor="message"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.messageLabel")}
										</label>
										<textarea
											name="message"
											id="message"
											value={formData.message}
											onChange={handleChange}
											rows={6}
											placeholder={t(
												"contact.messagePlaceholder",
											)}
											required
											className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-sm sm:text-base ${
												errors.message
													? "border-red-500"
													: "border-gray-300"
											}`}
										/>
										{errors.message && (
											<p className="mt-1 text-sm text-red-600">
												{errors.message}
											</p>
										)}
									</div>

									{/* Bouton d'envoi */}
									<div className="w-full">
										<Turnstile
											siteKey={
												process.env
													.NEXT_PUBLIC_TURNSTILE_SITE_KEY
											}
											onSuccess={setTurnstileToken}
											onError={() =>
												setTurnstileToken(null)
											}
											onExpire={() =>
												setTurnstileToken(null)
											}
											className="w-full"
											options={{
												theme: "light",
												language: locale,
												size: "flexible",
											}}
										/>
									</div>
									<Button
										type="submit"
										disabled={isLoading || !turnstileToken}
										className="w-full bg-linear-to-r from-teal-600 to-cyan-700 hover:from-teal-700 hover:to-cyan-800 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
									>
										{isLoading ? (
											<>
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												{t("contact.sendingButton")}
											</>
										) : (
											<>
												<Send className="w-5 h-5" />
												{t("contact.sendButton")}
											</>
										)}
									</Button>
								</form>

								{/* Note de confidentialité */}
								<div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
									<p className="text-xs sm:text-sm text-blue-800">
										{t("contact.privacyNote")}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
