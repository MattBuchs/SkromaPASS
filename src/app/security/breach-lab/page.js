"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import ShieldIcon from "@/components/icons/Shield";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBreachScan, useManualPasswordCheck } from "@/hooks/useApi";
import { Radar, SearchCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

function estimateStrength(password) {
	let charset = 0;
	if (/[a-z]/.test(password)) charset += 26;
	if (/[A-Z]/.test(password)) charset += 26;
	if (/[0-9]/.test(password)) charset += 10;
	if (/[^A-Za-z0-9]/.test(password)) charset += 33;
	if (charset === 0) return 0;
	const entropy = Math.round(password.length * Math.log2(charset));
	if (entropy < 35) return 1;
	if (entropy < 50) return 2;
	if (entropy < 65) return 3;
	if (entropy < 80) return 4;
	return 5;
}

const STRENGTH_LABELS = [
	{ labelKey: "", color: "", bar: 0 },
	{
		labelKey: "breachLab.strength1",
		color: "text-red-700",
		bar: 20,
		barColor: "bg-red-500",
		icon: "🔴",
	},
	{
		labelKey: "breachLab.strength2",
		color: "text-orange-700",
		bar: 40,
		barColor: "bg-orange-400",
		icon: "🟠",
	},
	{
		labelKey: "breachLab.strength3",
		color: "text-yellow-700",
		bar: 60,
		barColor: "bg-yellow-400",
		icon: "🟡",
	},
	{
		labelKey: "breachLab.strength4",
		color: "text-blue-700",
		bar: 80,
		barColor: "bg-blue-500",
		icon: "🔵",
	},
	{
		labelKey: "breachLab.strength5",
		color: "text-green-700",
		bar: 100,
		barColor: "bg-green-500",
		icon: "🟢",
	},
];

const CRACK_TIME_LABELS = [
	"breachLab.crack0",
	"breachLab.crack1",
	"breachLab.crack2",
	"breachLab.crack3",
	"breachLab.crack4",
];

function getRiskLabel(riskLevel, t) {
	const toneMap = {
		critical: "text-red-700 bg-red-100",
		high: "text-orange-700 bg-orange-100",
		medium: "text-yellow-700 bg-yellow-100",
		low: "text-green-700 bg-green-100",
	};
	const keyMap = {
		critical: "breachLab.riskCritical",
		high: "breachLab.riskHigh",
		medium: "breachLab.riskMedium",
		low: "breachLab.riskLow",
	};
	return {
		text: t(keyMap[riskLevel] || "breachLab.riskNone"),
		tone: toneMap[riskLevel] || "text-green-700 bg-green-100",
	};
}

function BreachLabPage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [customPassword, setCustomPassword] = useState("");
	const [scanResult, setScanResult] = useState(null);
	const [manualResult, setManualResult] = useState(null);
	const { t, locale } = useLanguage();

	const breachScanMutation = useBreachScan();
	const manualCheckMutation = useManualPasswordCheck();

	const strength = useMemo(
		() => estimateStrength(customPassword),
		[customPassword],
	);
	const strengthInfo = STRENGTH_LABELS[strength] || STRENGTH_LABELS[0];

	const handleVaultScan = async () => {
		try {
			const result = await breachScanMutation.mutateAsync();
			setScanResult(result);
		} catch (error) {
			setScanResult({
				error: error.message || t("breachLab.scanUnavailable"),
			});
		}
	};

	const handleManualCheck = async () => {
		if (!customPassword.trim()) {
			setManualResult({ error: t("breachLab.enterPassword") });
			return;
		}

		try {
			const result =
				await manualCheckMutation.mutateAsync(customPassword);
			setManualResult(result);
		} catch (error) {
			setManualResult({
				error: error.message || t("breachLab.checkUnavailable"),
			});
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
				<div className="max-w-7xl mx-auto">
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-2">
							<Radar className="w-8 h-8 text-[rgb(var(--color-primary))]" />
							<h1 className="text-2xl sm:text-3xl font-bold text-[rgb(var(--color-text-primary))]">
								{t("breachLab.title")}
							</h1>
						</div>
						<p className="text-[rgb(var(--color-text-secondary))]">
							{t("breachLab.subtitle")}
						</p>
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
						<Card className="bg-linear-to-br from-rose-50 to-orange-50 border-rose-200">
							<h2 className="text-lg font-semibold text-rose-900 mb-2 flex items-center gap-2">
								<ShieldIcon className="w-5 h-5" />
								{t("breachLab.vaultCardTitle")}
							</h2>
							<p className="text-sm text-rose-700 mb-1">
								{t("breachLab.vaultCardDesc")}
							</p>
							<p className="text-xs text-rose-600 mb-4">
								{t("breachLab.vaultCardNote")}
							</p>
							<Button
								variant="primary"
								onClick={handleVaultScan}
								disabled={breachScanMutation.isPending}
							>
								{breachScanMutation.isPending
									? t("breachLab.scanningBtn")
									: t("breachLab.scanBtn")}
							</Button>

							{scanResult && (
								<div className="mt-4 rounded-lg border border-rose-200 bg-white p-4">
									{scanResult.error ? (
										<p className="text-sm text-red-700">
											{scanResult.error}
										</p>
									) : (
										<>
											<p className="font-medium text-rose-900">
												{scanResult.compromisedDetected >
												0
													? t(
															"breachLab.compromisedAlert",
														).replace(
															"{n}",
															scanResult.compromisedDetected,
														)
													: t("breachLab.safeAlert")}
											</p>
											<div className="grid grid-cols-3 gap-2 mt-3 text-center">
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														{t(
															"breachLab.statsChecked",
														)}
													</p>
													<p className="font-semibold text-rose-900">
														{scanResult.scanned}
													</p>
												</div>
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														{t(
															"breachLab.statsCompromised",
														)}
													</p>
													<p className="font-semibold text-rose-900">
														{
															scanResult.compromisedDetected
														}
													</p>
												</div>
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														{t(
															"breachLab.statsUpdated",
														)}
													</p>
													<p className="font-semibold text-rose-900">
														{
															scanResult.updatedEntries
														}
													</p>
												</div>
											</div>
											{scanResult.compromisedEntries
												?.length > 0 && (
												<div className="mt-4">
													<p className="text-xs font-semibold text-rose-800 mb-2">
														{t(
															"breachLab.statsCompromisedList",
														)}
													</p>
													<ul className="space-y-1">
														{scanResult.compromisedEntries.map(
															(entry) => (
																<li
																	key={
																		entry.id
																	}
																	className="flex items-center justify-between rounded-md bg-rose-50 border border-rose-200 px-3 py-1.5 text-sm"
																>
																	<span className="font-medium text-rose-900">
																		{
																			entry.name
																		}
																		{entry.website && (
																			<span className="ml-1 text-xs text-rose-600 font-normal">
																				(
																				{
																					entry.website
																				}

																				)
																			</span>
																		)}
																	</span>
																	<span className="text-xs text-rose-700 whitespace-nowrap ml-2">
																		{t(
																			"breachLab.breachCount",
																		).replace(
																			"{n}",
																			entry.breachCount.toLocaleString(
																				locale ===
																					"fr"
																					? "fr-FR"
																					: "en-US",
																			),
																		)}
																	</span>
																</li>
															),
														)}
													</ul>
												</div>
											)}
										</>
									)}
								</div>
							)}
						</Card>

						<Card className="bg-linear-to-br from-blue-50 to-cyan-50 border-blue-200">
							<h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
								<SearchCheck className="w-5 h-5" />
								{t("breachLab.manualCardTitle")}
							</h2>
							<p className="text-sm text-blue-700 mb-1">
								{t("breachLab.manualCardDesc")}
							</p>
							<p className="text-xs text-blue-600 mb-4">
								{t("breachLab.manualCardNote")}
							</p>
							<input
								type="password"
								value={customPassword}
								onChange={(e) => {
									setCustomPassword(e.target.value);
									setManualResult(null);
								}}
								placeholder={t("breachLab.manualPlaceholder")}
								className="w-full px-3 py-2 rounded-md border border-blue-200 bg-white text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>

							{customPassword.length > 0 && (
								<div className="mt-3">
									<div className="flex items-center justify-between mb-1">
										<span className="text-xs text-blue-700">
											{t("breachLab.strengthLabel")}
										</span>
										<span
											className={`text-xs font-semibold ${strengthInfo.color}`}
										>
											{strengthInfo.icon}{" "}
											{strengthInfo.labelKey
												? t(strengthInfo.labelKey)
												: ""}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.barColor}`}
											style={{
												width: `${strengthInfo.bar}%`,
											}}
										/>
									</div>
									<p className="text-xs text-blue-600 mt-1">
										{t("breachLab.crackTimeText").replace(
											"{time}",
											t(
												CRACK_TIME_LABELS[
													strength - 1
												] || "breachLab.crack0",
											),
										)}
									</p>
								</div>
							)}

							<Button
								variant="primary"
								onClick={handleManualCheck}
								disabled={manualCheckMutation.isPending}
								className="mt-4"
							>
								{manualCheckMutation.isPending
									? t("breachLab.checkingBtn")
									: t("breachLab.checkBtn")}
							</Button>

							{manualResult && (
								<div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">
									{manualResult.error ? (
										<p className="text-sm text-red-700">
											{manualResult.error}
										</p>
									) : (
										<>
											<p className="font-medium text-blue-900">
												{manualResult.isCompromised
													? t(
															"breachLab.compromisedManualAlert",
														)
													: t(
															"breachLab.safeManualAlert",
														)}
											</p>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<span
													className={`px-2 py-1 rounded-md text-xs font-semibold ${getRiskLabel(manualResult.riskLevel, t).tone}`}
												>
													{
														getRiskLabel(
															manualResult.riskLevel,
															t,
														).text
													}
												</span>
												{manualResult.breachCount >
													0 && (
													<span className="text-xs text-blue-800">
														{t(
															"breachLab.seenTimes",
														).replace(
															"{n}",
															manualResult.breachCount.toLocaleString(
																locale === "fr"
																	? "fr-FR"
																	: "en-US",
															),
														)}
													</span>
												)}
											</div>
										</>
									)}
								</div>
							)}
						</Card>
					</div>

					<Card className="bg-linear-to-br from-violet-50 to-fuchsia-50 border-violet-200">
						<h3 className="text-lg font-semibold text-violet-900 mb-4 flex items-center gap-2">
							<Sparkles className="w-5 h-5" />
							{t("breachLab.howTitle")}
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									{t("breachLab.howPrivacyTitle")}
								</p>
								<p className="text-xs text-violet-700 mt-1">
									{t("breachLab.howPrivacyDesc")}
								</p>
							</div>
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									{t("breachLab.howSpeedTitle")}
								</p>
								<p className="text-xs text-violet-700 mt-1">
									{t("breachLab.howSpeedDesc")}
								</p>
							</div>
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									{t("breachLab.howActionTitle")}
								</p>
								<p className="text-xs text-violet-700 mt-1">
									{t("breachLab.howActionDesc")}
								</p>
							</div>
						</div>
						<div className="mt-5">
							<Link href="/password-generator">
								<Button
									variant="secondary"
									className="border border-violet-400 hover:border-violet-500 text-violet-950"
								>
									{t("breachLab.generateBtn")}
								</Button>
							</Link>
						</div>
					</Card>
				</div>
			</main>
		</div>
	);
}

export default withAuthProtection(BreachLabPage);
