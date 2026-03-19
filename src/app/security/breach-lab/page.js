"use client";

import { withAuthProtection } from "@/components/auth/withAuthProtection";
import ShieldIcon from "@/components/icons/Shield";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
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
	{ label: "", color: "", bar: 0 },
	{
		label: "Très faible — à changer immédiatement",
		color: "text-red-700",
		bar: 20,
		barColor: "bg-red-500",
		icon: "🔴",
	},
	{
		label: "Faible — facile à deviner",
		color: "text-orange-700",
		bar: 40,
		barColor: "bg-orange-400",
		icon: "🟠",
	},
	{
		label: "Moyen — peut être amélioré",
		color: "text-yellow-700",
		bar: 60,
		barColor: "bg-yellow-400",
		icon: "🟡",
	},
	{
		label: "Fort — bon mot de passe",
		color: "text-blue-700",
		bar: 80,
		barColor: "bg-blue-500",
		icon: "🔵",
	},
	{
		label: "Très fort — excellent choix !",
		color: "text-green-700",
		bar: 100,
		barColor: "bg-green-500",
		icon: "🟢",
	},
];

const CRACK_TIME_LABELS = [
	"quelques secondes",
	"quelques minutes",
	"plusieurs jours",
	"plusieurs années",
	"des siècles",
];

function getRiskLabel(riskLevel) {
	switch (riskLevel) {
		case "critical":
			return {
				text: "🔴 Risque critique",
				tone: "text-red-700 bg-red-100",
			};
		case "high":
			return {
				text: "🟠 Risque élevé",
				tone: "text-orange-700 bg-orange-100",
			};
		case "medium":
			return {
				text: "🟡 Risque modéré",
				tone: "text-yellow-700 bg-yellow-100",
			};
		case "low":
			return {
				text: "🟢 Risque faible",
				tone: "text-green-700 bg-green-100",
			};
		default:
			return {
				text: "✅ Aucune fuite détectée",
				tone: "text-green-700 bg-green-100",
			};
	}
}

function BreachLabPage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [customPassword, setCustomPassword] = useState("");
	const [scanResult, setScanResult] = useState(null);
	const [manualResult, setManualResult] = useState(null);

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
				error: error.message || "Scan indisponible",
			});
		}
	};

	const handleManualCheck = async () => {
		if (!customPassword.trim()) {
			setManualResult({ error: "Entrez un mot de passe à vérifier." });
			return;
		}

		try {
			const result =
				await manualCheckMutation.mutateAsync(customPassword);
			setManualResult(result);
		} catch (error) {
			setManualResult({
				error: error.message || "Vérification indisponible",
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
								Détecteur de fuites
							</h1>
						</div>
						<p className="text-[rgb(var(--color-text-secondary))]">
							Vérifiez en un clic si vos mots de passe ont été
							volés lors d&apos;un piratage de site web. Vos mots
							de passe ne quittent jamais votre appareil.
						</p>
					</div>

					<div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
						<Card className="bg-linear-to-br from-rose-50 to-orange-50 border-rose-200">
							<h2 className="text-lg font-semibold text-rose-900 mb-2 flex items-center gap-2">
								<ShieldIcon className="w-5 h-5" />
								Analyser tous mes mots de passe
							</h2>
							<p className="text-sm text-rose-700 mb-1">
								Vérifie en quelques secondes si l&apos;un de vos
								mots de passe enregistrés a été compromis lors
								d&apos;un piratage.
							</p>
							<p className="text-xs text-rose-600 mb-4">
								🔒 Vos mots de passe ne sont jamais transmis —
								seule une empreinte partielle est envoyée.
							</p>
							<Button
								variant="primary"
								onClick={handleVaultScan}
								disabled={breachScanMutation.isPending}
							>
								{breachScanMutation.isPending
									? "Analyse en cours..."
									: "Lancer l'analyse"}
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
													? `⚠️ ${scanResult.compromisedDetected} mot(s) de passe trouvé(s) dans des piratages connus — changez-les dès maintenant.`
													: "✅ Aucun de vos mots de passe n'a été trouvé dans des piratages connus."}
											</p>
											<div className="grid grid-cols-3 gap-2 mt-3 text-center">
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														Mots de passe vérifiés
													</p>
													<p className="font-semibold text-rose-900">
														{scanResult.scanned}
													</p>
												</div>
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														Compromis détectés
													</p>
													<p className="font-semibold text-rose-900">
														{
															scanResult.compromisedDetected
														}
													</p>
												</div>
												<div className="rounded-md border border-rose-200 py-2">
													<p className="text-xs text-rose-700">
														Comptes mis à jour
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
														Mots de passe compromis
														:
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
																		⚠️{" "}
																		{entry.breachCount.toLocaleString(
																			"fr-FR",
																		)}{" "}
																		fuite(s)
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
								Tester un mot de passe
							</h2>
							<p className="text-sm text-blue-700 mb-1">
								Vous pouvez tester n&apos;importe quel mot de
								passe ici — même un que vous n&apos;avez pas
								encore enregistré.
							</p>
							<p className="text-xs text-blue-600 mb-4">
								🔒 Ce mot de passe n&apos;est jamais enregistré
								ni transmis en clair.
							</p>
							<input
								type="password"
								value={customPassword}
								onChange={(e) => {
									setCustomPassword(e.target.value);
									setManualResult(null);
								}}
								placeholder="Tapez un mot de passe à tester..."
								className="w-full px-3 py-2 rounded-md border border-blue-200 bg-white text-[rgb(var(--color-text-primary))] focus:outline-none focus:ring-2 focus:ring-blue-400"
							/>

							{customPassword.length > 0 && (
								<div className="mt-3">
									<div className="flex items-center justify-between mb-1">
										<span className="text-xs text-blue-700">
											Niveau de sécurité
										</span>
										<span
											className={`text-xs font-semibold ${strengthInfo.color}`}
										>
											{strengthInfo.icon}{" "}
											{strengthInfo.label}
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
										Un pirate aurait besoin de{" "}
										<strong>
											{CRACK_TIME_LABELS[strength - 1] ||
												"quelques secondes"}
										</strong>{" "}
										pour deviner ce mot de passe.
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
									? "Vérification en cours..."
									: "Vérifier si ce mot de passe a fuité"}
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
													? "⚠️ Ce mot de passe a été trouvé dans des piratages connus — évitez de l'utiliser."
													: "✅ Ce mot de passe n'a pas été trouvé dans des piratages connus."}
											</p>
											<div className="mt-2 flex flex-wrap items-center gap-2">
												<span
													className={`px-2 py-1 rounded-md text-xs font-semibold ${getRiskLabel(manualResult.riskLevel).tone}`}
												>
													{
														getRiskLabel(
															manualResult.riskLevel,
														).text
													}
												</span>
												{manualResult.breachCount >
													0 && (
													<span className="text-xs text-blue-800">
														Vu{" "}
														<strong>
															{manualResult.breachCount.toLocaleString(
																"fr-FR",
															)}
														</strong>{" "}
														fois dans des piratages
														de sites web
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
							Comment ça fonctionne ?
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									🔒 Votre confidentialité est protégée
								</p>
								<p className="text-xs text-violet-700 mt-1">
									Votre mot de passe n&apos;est jamais envoyé
									à Internet. Seule une version tronquée et
									illisible est utilisée pour la vérification.
								</p>
							</div>
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									⚡ Résultats instantanés
								</p>
								<p className="text-xs text-violet-700 mt-1">
									L&apos;analyse s&apos;appuie sur une base de
									données de milliards de mots de passe volés
									lors de piratages réels de sites web.
								</p>
							</div>
							<div className="rounded-lg bg-white border border-violet-200 p-4">
								<p className="text-sm font-semibold text-violet-900">
									🎯 Que faire si un mot de passe a fuité ?
								</p>
								<p className="text-xs text-violet-700 mt-1">
									Changez-le immédiatement sur le site
									concerné et générez-en un nouveau, unique et
									robuste.
								</p>
							</div>
						</div>
						<div className="mt-5">
							<Link href="/generator">
								<Button
									variant="secondary"
									className="border border-violet-400 hover:border-violet-500 text-violet-950"
								>
									Générer un mot de passe robuste
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
