"use client";

import LockIcon from "@/components/icons/Lock";
import ShieldIcon from "@/components/icons/Shield";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useStats } from "@/hooks/useApi";
import { AlertTriangle, Calendar, Radar } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function SecurityPage() {
	const { data: stats, isLoading: loading } = useStats();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { t } = useLanguage();
	const { theme } = useTheme();

	const getSecurityScoreColor = (score) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-yellow-600";
		return "text-red-600";
	};

	const getSecurityScoreLabel = (score) => {
		if (score >= 80) return t("security.scoreExcellent");
		if (score >= 60) return t("security.scoreGood");
		if (score >= 40) return t("security.scoreAvg");
		return t("security.scoreWeak");
	};

	if (loading) {
		return (
			<div
				className={`min-h-screen app-page bg-[rgb(var(--color-background))] ${theme === "dark" ? "dark" : ""}`}
			>
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
							<ShieldIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
							<p className="text-[rgb(var(--color-text-secondary))]">
								{t("security.loading")}
							</p>
						</div>
					</div>
				</main>
			</div>
		);
	}

	return (
		<div
			className={`min-h-screen app-page bg-[rgb(var(--color-background))] ${theme === "dark" ? "dark" : ""}`}
		>
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			<main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<ShieldIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
							<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("security.title")}
							</h1>
						</div>
						<p className="text-[rgb(var(--color-text-secondary))]">
							{t("security.subtitle")}
						</p>
					</div>

					{stats && (
						<Card className="mb-8 bg-linear-to-br from-indigo-50 to-purple-50 border-indigo-200">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h3 className="text-xl font-semibold text-[rgb(var(--color-text-primary))] mb-1">
										{t("security.scoreTitle")}
									</h3>
									<p className="text-sm text-[rgb(var(--color-text-secondary))]">
										{t("security.scoreDesc")}
									</p>
								</div>
								<div className="text-center">
									<div
										className={`text-5xl font-bold ${getSecurityScoreColor(
											stats.securityScore,
										)}`}
									>
										{stats.securityScore}
										<span className="text-2xl">/100</span>
									</div>
									<p
										className={`text-sm font-medium ${getSecurityScoreColor(
											stats.securityScore,
										)}`}
									>
										{getSecurityScoreLabel(
											stats.securityScore,
										)}
									</p>
								</div>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
								<div
									className={`h-full transition-all duration-500 ${
										stats.securityScore >= 80
											? "bg-green-500"
											: stats.securityScore >= 60
												? "bg-yellow-500"
												: "bg-red-500"
									}`}
									style={{ width: `${stats.securityScore}%` }}
								/>
							</div>
						</Card>
					)}

					<Card className="mb-8 bg-linear-to-r from-rose-50 via-orange-50 to-amber-50 border-rose-200">
						<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
							<div>
								<h3 className="text-xl font-semibold text-rose-900 flex items-center gap-2">
									<Radar className="w-5 h-5" />
									{t("security.breachLabTitle")}
								</h3>
								<p className="text-sm text-rose-700 mt-1">
									{t("security.breachLabDesc")}
								</p>
								<p className="text-xs text-rose-700 mt-2">
									{t("security.breachLabNote")}
								</p>
							</div>
							<Link href="/security/breach-lab">
								<Button variant="primary">
									{t("security.openBreachLab")}
								</Button>
							</Link>
						</div>

						{stats && (
							<div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
								<div className="rounded-md border border-rose-200 bg-white p-3">
									<p className="text-xs text-rose-700">
										{t("security.breachDetected")}
									</p>
									<p className="text-2xl font-bold text-rose-900">
										{stats.compromisedPasswords || 0}
									</p>
								</div>
								<div className="rounded-md border border-rose-200 bg-white p-3">
									<p className="text-xs text-rose-700">
										{t("security.weakLabel")}
									</p>
									<p className="text-2xl font-bold text-rose-900">
										{stats.weakPasswords || 0}
									</p>
								</div>
								<div className="rounded-md border border-rose-200 bg-white p-3">
									<p className="text-xs text-rose-700">
										{t("security.totalSecured")}
									</p>
									<p className="text-2xl font-bold text-rose-900">
										{stats.totalPasswords || 0}
									</p>
								</div>
							</div>
						)}
					</Card>

					{stats && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<Card className="bg-linear-to-br from-green-50 to-emerald-50 border-green-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-green-700 mb-1">
											{t("security.strongPasswords")}
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

							<Card className="bg-linear-to-br from-yellow-50 to-orange-50 border-yellow-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-yellow-700 mb-1">
											{t("security.mediumPasswords")}
										</p>
										<p className="text-3xl font-bold text-yellow-900">
											{stats.mediumPasswords || 0}
										</p>
									</div>
									<div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
										!
									</div>
								</div>
							</Card>

							<Card className="bg-linear-to-br from-red-50 to-rose-50 border-red-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-red-700 mb-1">
											{t("security.weakPasswords")}
										</p>
										<p className="text-3xl font-bold text-red-900">
											{stats.weakPasswords}
										</p>
									</div>
									<div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
										<AlertTriangle />
									</div>
								</div>
							</Card>

							<Card className="bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-blue-700 mb-1">
											{t("security.addedThisMonth")}
										</p>
										<p className="text-3xl font-bold text-blue-900">
											{stats.recentPasswords || 0}
										</p>
									</div>
									<div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
										<Calendar />
									</div>
								</div>
							</Card>
						</div>
					)}

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
						<Card className="bg-blue-50 border-blue-200">
							<h3 className="text-lg font-semibold text-blue-900 mb-4">
								{t("security.priorityTitle")}
							</h3>
							<div className="space-y-3">
								{stats?.compromisedPasswords > 0 && (
									<div className="flex items-start gap-3">
										<span className="text-2xl"></span>
										<div>
											<p className="font-medium text-red-900">
												{stats.compromisedPasswords}{" "}
												{t("security.compromisedAlert")}
											</p>
											<p className="text-sm text-red-700">
												{t(
													"security.compromisedAction",
												)}
											</p>
										</div>
									</div>
								)}
								{stats?.weakPasswords > 0 && (
									<div className="flex items-start gap-3">
										<span className="text-2xl"></span>
										<div>
											<p className="font-medium text-yellow-900">
												{stats.weakPasswords}{" "}
												{t("security.weakAlert")}
											</p>
											<p className="text-sm text-yellow-700">
												{t("security.weakAction")}
											</p>
										</div>
									</div>
								)}
								<div className="flex items-start gap-3">
									<span className="text-2xl"></span>
									<div>
										<p className="font-medium text-blue-900">
											{t("security.generateStrong")}
										</p>
										<Link href="/password-generator">
											<Button
												variant="primary"
												className="mt-2 text-sm"
											>
												{t("security.openGenerator")}
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</Card>

						<Card className="bg-purple-50 border-purple-200">
							<h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
								<LockIcon className="w-5 h-5" />
								{t("security.securityInfoTitle")}
							</h3>
							<div className="space-y-4">
								<div className="bg-white p-4 rounded-lg border border-purple-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-purple-900">
											{t("security.encryptionLabel")}
										</span>
										<span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium text-center">
											AES-256-GCM
										</span>
									</div>
									<p className="text-xs text-purple-700">
										{t("security.encryptionDesc")}
									</p>
								</div>

								<div className="bg-white p-4 rounded-lg border border-purple-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-purple-900">
											{t("security.pinLabel")}
										</span>
										<span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium text-center">
											{t("security.pinTime")}
										</span>
									</div>
									<p className="text-xs text-purple-700">
										{t("security.pinDesc")}
									</p>
								</div>

								<div className="bg-white p-4 rounded-lg border border-purple-200">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-purple-900">
											{t("security.tfaLabel")}
										</span>
										<span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium text-center">
											{t("security.tfaOptional")}
										</span>
									</div>
									<p className="text-xs text-purple-700">
										{t("security.tfaDesc")}
									</p>
								</div>
							</div>
						</Card>
					</div>

					<Card className="bg-linear-to-br from-sky-50 to-blue-50 border-sky-200">
						<h3 className="text-lg font-semibold text-sky-900 mb-2">
							{t("security.outerCardTitle")}
						</h3>
						<p className="text-sm text-sky-800">
							{t("security.outerCardDesc")}
						</p>
					</Card>
				</div>
			</main>
		</div>
	);
}
