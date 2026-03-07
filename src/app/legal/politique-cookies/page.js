"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { CheckCircle, Cookie, Info, XCircle } from "lucide-react";
import { useState } from "react";

export default function PolitiqueCookiesPage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			<div className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
				<div className="max-w-4xl mx-auto">
					{/* En-tête */}
					<div className="mb-8">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
								<Cookie className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Politique de Cookies
								</h1>
								<p className="text-gray-600 mt-1">
									Comment MemKeyPass utilise les cookies
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Introduction */}
						<section>
							<p className="text-gray-700 leading-relaxed">
								Cette politique explique comment MemKeyPass
								utilise les cookies et technologies similaires
								pour améliorer votre expérience utilisateur et
								assurer le bon fonctionnement du service.
							</p>
						</section>

						{/* Qu'est-ce qu'un cookie */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Info className="w-5 h-5 text-indigo-600" />
								Qu&apos;est-ce qu&apos;un cookie ?
							</h2>
							<p className="text-gray-700 mb-3">
								Un cookie est un petit fichier texte déposé sur
								votre appareil (ordinateur, smartphone,
								tablette) lors de votre visite sur un site web.
								Les cookies permettent au site de mémoriser vos
								préférences et d&apos;améliorer votre
								expérience.
							</p>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<p className="text-blue-900 text-sm">
									<strong>Note :</strong> Les cookies ne
									peuvent pas endommager votre appareil ni
									exécuter des programmes. Ils ne contiennent
									pas de virus.
								</p>
							</div>
						</section>

						{/* Cookies utilisés */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Cookies utilisés par MemKeyPass
							</h2>

							{/* Cookies essentiels */}
							<div className="mb-6">
								<div className="flex items-center gap-2 mb-3">
									<CheckCircle className="w-5 h-5 text-green-600" />
									<h3 className="font-semibold text-gray-900 text-lg">
										Cookies strictement nécessaires
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									Ces cookies sont indispensables au
									fonctionnement du site et ne peuvent pas
									être désactivés. Ils sont généralement
									définis en réponse à vos actions (connexion,
									préférences).
								</p>
								<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Cookie
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Finalité
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Durée
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.session-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													Maintient votre session de
													connexion
												</td>
												<td className="px-4 py-3 text-gray-700">
													30 jours
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.csrf-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													Protection contre les
													attaques CSRF
												</td>
												<td className="px-4 py-3 text-gray-700">
													Session
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.callback-url
												</td>
												<td className="px-4 py-3 text-gray-700">
													Redirection après connexion
												</td>
												<td className="px-4 py-3 text-gray-700">
													Session
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													__Secure-next-auth.session-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													Session sécurisée (HTTPS)
												</td>
												<td className="px-4 py-3 text-gray-700">
													30 jours
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<p className="text-sm text-gray-600 mt-2">
									Ces cookies ne collectent aucune information
									personnelle identifiable et sont nécessaires
									pour que vous puissiez utiliser MemKeyPass.
								</p>
							</div>

							{/* Cloudflare Turnstile */}
							<div className="mb-6">
								<div className="flex items-center gap-2 mb-3">
									<CheckCircle className="w-5 h-5 text-green-600" />
									<h3 className="font-semibold text-gray-900 text-lg">
										Cookies de sécurité (Cloudflare
										Turnstile)
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									Cloudflare Turnstile est utilisé sur nos
									formulaires pour distinguer les humains des
									robots automatisés. Il peut déposer un token
									temporaire le temps de la vérification.
								</p>
								<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Cookie
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Finalité
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Durée
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													cf_clearance
												</td>
												<td className="px-4 py-3 text-gray-700">
													Vérification anti-bot
													Cloudflare
												</td>
												<td className="px-4 py-3 text-gray-700">
													Session
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>

							{/* Cookies non utilisés */}
							<div>
								<div className="flex items-center gap-2 mb-3">
									<XCircle className="w-5 h-5 text-red-600" />
									<h3 className="font-semibold text-gray-900 text-lg">
										Cookies que nous N&apos;UTILISONS PAS
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									MemKeyPass respecte votre vie privée et ne
									déploie <strong>aucun</strong> des cookies
									suivants :
								</p>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												Cookies publicitaires :
											</strong>{" "}
											Nous n&apos;affichons aucune
											publicité
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												Cookies de tracking :
											</strong>{" "}
											Nous ne suivons pas votre navigation
											sur d&apos;autres sites
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												Cookies de réseaux sociaux :
											</strong>{" "}
											Aucun bouton de partage tiers
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
										<span>
											<strong>
												Google Analytics, cookies
												publicitaires Cloudflare :
											</strong>{" "}
											Nous n&apos;utilisons pas de cookies
											de tracking tiers
										</span>
									</li>
								</ul>
							</div>
						</section>

						{/* Local Storage */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Stockage local (Local Storage)
							</h2>
							<p className="text-gray-700 mb-3">
								En plus des cookies, MemKeyPass utilise le
								stockage local de votre navigateur pour :
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
								<li>
									Mémoriser vos préférences d&apos;interface
									(thème, langue)
								</li>
								<li>
									Stocker temporairement des données de
									session
								</li>
								<li>
									Cache local pour améliorer les performances
								</li>
							</ul>
							<p className="text-gray-700 mt-3">
								<strong>Important :</strong> Vos mots de passe
								ne sont JAMAIS stockés en clair dans le Local
								Storage. Toutes les données sensibles sont
								chiffrées.
							</p>
						</section>

						{/* Gestion des cookies */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Gestion des cookies
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Via votre navigateur
									</h3>
									<p className="text-gray-700 mb-3">
										Vous pouvez configurer votre navigateur
										pour refuser les cookies ou être averti
										lors du dépôt d&apos;un cookie :
									</p>
									<ul className="space-y-2 text-gray-700">
										<li>
											• <strong>Chrome :</strong>{" "}
											Paramètres → Confidentialité et
											sécurité → Cookies
										</li>
										<li>
											• <strong>Firefox :</strong> Options
											→ Vie privée et sécurité → Cookies
										</li>
										<li>
											• <strong>Safari :</strong>{" "}
											Préférences → Confidentialité →
											Cookies
										</li>
										<li>
											• <strong>Edge :</strong> Paramètres
											→ Cookies et autorisations de site
										</li>
									</ul>
								</div>
								<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
										<div>
											<h4 className="font-semibold text-amber-900 mb-1">
												Attention
											</h4>
											<p className="text-amber-800 text-sm">
												Si vous désactivez tous les
												cookies, vous ne pourrez plus
												vous connecter à MemKeyPass car
												les cookies de session sont
												nécessaires au fonctionnement du
												service.
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* Extension navigateur */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Extension de navigateur
							</h2>
							<p className="text-gray-700 mb-3">
								L&apos;extension MemKeyPass utilise les API du
								navigateur pour :
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
								<li>
									Stocker votre token de session de manière
									sécurisée
								</li>
								<li>Communiquer avec l&apos;API MemKeyPass</li>
								<li>
									Remplir automatiquement vos identifiants
								</li>
							</ul>
							<p className="text-gray-700 mt-3">
								L&apos;extension ne collecte aucune donnée de
								navigation et ne communique qu&apos;avec les
								serveurs MemKeyPass.
							</p>
						</section>

						{/* Tiers */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Services tiers
							</h2>
							<p className="text-gray-700 mb-3">
								MemKeyPass fait appel à des services tiers pour
								l&apos;hébergement et l&apos;infrastructure :
							</p>
							<div className="space-y-3">
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Vercel (Hébergement web)
									</h4>
									<p className="text-gray-700 text-sm">
										Peut collecter des logs techniques
										(adresse IP, user-agent) pour assurer le
										fonctionnement du service.
									</p>
									<a
										href="https://vercel.com/legal/privacy-policy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										Politique de confidentialité Vercel
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Supabase (Base de données)
									</h4>
									<p className="text-gray-700 text-sm">
										Héberge vos données chiffrées dans des
										datacenters européens (RGPD compliant).
									</p>
									<a
										href="https://supabase.com/privacy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										Politique de confidentialité Supabase
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Resend (Envoi d&apos;emails)
									</h4>
									<p className="text-gray-700 text-sm">
										Service d&apos;envoi d&apos;emails
										transactionnels (vérification,
										notifications, réinitialisation de mot
										de passe).
									</p>
									<a
										href="https://resend.com/legal/privacy-policy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										Politique de confidentialité Resend
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Cloudflare Turnstile (Protection
										anti-bot)
									</h4>
									<p className="text-gray-700 text-sm">
										Protège les formulaires contre les
										soumissions automatisées. Traite
										uniquement les signaux nécessaires à la
										vérification, sans publicité ni tracking
										cross-site.
									</p>
									<a
										href="https://www.cloudflare.com/privacypolicy/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										Politique de confidentialité Cloudflare
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Cloudflare Web Analytics
									</h4>
									<p className="text-gray-700 text-sm">
										Mesure d&apos;audience sans cookies et
										sans traçage inter-sites. Collecte des
										statistiques anonymes (pages vues,
										performances) via un beacon JavaScript.
										Aucune donnée personnelle identifiable
										n&apos;est collectée.
									</p>
									<a
										href="https://www.cloudflare.com/web-analytics/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										En savoir plus sur Cloudflare Web
										Analytics
									</a>
								</div>
							</div>
						</section>

						{/* Modifications */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Modifications de cette politique
							</h2>
							<p className="text-gray-700">
								Nous nous réservons le droit de modifier cette
								politique de cookies. Toute modification sera
								communiquée sur cette page avec une mise à jour
								de la date de dernière modification.
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Questions
							</h2>
							<p className="text-gray-700">
								Pour toute question concernant notre utilisation
								des cookies, contactez-nous à{" "}
								<a
									href="mailto:mattbuchs25@gmail.com"
									className="text-indigo-600 hover:text-indigo-700 underline"
								>
									mattbuchs25@gmail.com
								</a>
							</p>
						</section>

						{/* Résumé */}
						<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
							<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-indigo-600" />
								En résumé
							</h3>
							<ul className="space-y-2 text-gray-700">
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										Nous utilisons uniquement des cookies
										essentiels au fonctionnement du service
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										Aucun cookie publicitaire ni de tracking
										inter-sites
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										Analytics via Cloudflare Web Analytics —
										sans cookies, sans données personnelles
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										Vos mots de passe sont toujours chiffrés
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>Conformité RGPD</span>
								</li>
							</ul>
						</div>

						{/* Dernière mise à jour */}
						<div className="pt-6 border-t border-gray-200">
							<p className="text-sm text-gray-500">
								Dernière mise à jour : 7 mars 2026
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
