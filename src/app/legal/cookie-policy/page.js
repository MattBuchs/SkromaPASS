"use client";

import Footer from "@/components/layout/Footer";
import HeaderHome from "@/components/layout/HeaderHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle, Cookie, Info, XCircle } from "lucide-react";

export default function PolitiqueCookiesPage() {
	const { locale } = useLanguage();
	const isFr = locale === "fr";
	const { theme } = useTheme();

	return (
		<div
			data-theme={theme}
			className={`auth-page min-h-screen ${theme === "dark" ? "bg-slate-900 dark" : "bg-linear-to-br from-gray-50 via-white to-gray-50"}`}
		>
			<HeaderHome />

			<div className="p-4 sm:p-6 lg:p-8">
				<div className="max-w-4xl mx-auto">
					{/* En-tête */}
					<div className="mb-8 mt-18">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
								<Cookie className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{isFr
										? "Politique de Cookies"
										: "Cookie Policy"}
								</h1>
								<p className="text-gray-600 mt-1">
									{isFr
										? "Comment SkromaPASS utilise les cookies"
										: "How SkromaPASS uses cookies"}
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Introduction */}
						<section>
							<p className="text-gray-700 leading-relaxed">
								{isFr
									? "Cette politique explique comment SkromaPASS utilise les cookies et technologies similaires pour améliorer votre expérience utilisateur et assurer le bon fonctionnement du service."
									: "This policy explains how SkromaPASS uses cookies and similar technologies to improve your user experience and ensure the proper functioning of the service."}
							</p>
						</section>

						{/* Qu'est-ce qu'un cookie */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Info className="w-5 h-5 text-indigo-600" />
								{isFr
									? "Qu'est-ce qu'un cookie ?"
									: "What is a cookie?"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, smartphone, tablette) lors de votre visite sur un site web. Les cookies permettent au site de mémoriser vos préférences et d'améliorer votre expérience."
									: "A cookie is a small text file placed on your device (computer, smartphone, tablet) when you visit a website. Cookies allow the site to remember your preferences and improve your experience."}
							</p>
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
								<p className="text-blue-900 text-sm">
									<strong>{isFr ? "Note :" : "Note:"}</strong>{" "}
									{isFr
										? "Les cookies ne peuvent pas endommager votre appareil ni exécuter des programmes. Ils ne contiennent pas de virus."
										: "Cookies cannot damage your device or run programs. They do not contain viruses."}
								</p>
							</div>
						</section>

						{/* Cookies utilisés */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Cookies utilisés par SkromaPASS"
									: "Cookies Used by SkromaPASS"}
							</h2>

							{/* Cookies essentiels */}
							<div className="mb-6">
								<div className="flex items-center gap-2 mb-3">
									<CheckCircle className="w-5 h-5 text-green-600" />
									<h3 className="font-semibold text-gray-900 text-lg">
										{isFr
											? "Cookies strictement nécessaires"
											: "Strictly Necessary Cookies"}
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									{isFr
										? "Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés. Ils sont généralement définis en réponse à vos actions (connexion, préférences)."
										: "These cookies are essential for the website to function and cannot be disabled. They are generally set in response to your actions (login, preferences)."}
								</p>
								<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Cookie
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													{isFr
														? "Finalité"
														: "Purpose"}
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													{isFr
														? "Durée"
														: "Duration"}
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200">
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.session-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Maintient votre session de connexion"
														: "Maintains your login session"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "30 jours"
														: "30 days"}
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.csrf-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Protection contre les attaques CSRF"
														: "Protection against CSRF attacks"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Session"
														: "Session"}
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													next-auth.callback-url
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Redirection après connexion"
														: "Redirect after login"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Session"
														: "Session"}
												</td>
											</tr>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													__Secure-next-auth.session-token
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Session sécurisée (HTTPS)"
														: "Secure session (HTTPS)"}
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "30 jours"
														: "30 days"}
												</td>
											</tr>
										</tbody>
									</table>
								</div>
								<p className="text-sm text-gray-600 mt-2">
									{isFr
										? "Ces cookies ne collectent aucune information personnelle identifiable et sont nécessaires pour que vous puissiez utiliser SkromaPASS."
										: "These cookies do not collect any personally identifiable information and are necessary for you to use SkromaPASS."}
								</p>
							</div>

							{/* Cloudflare Turnstile */}
							<div className="mb-6">
								<div className="flex items-center gap-2 mb-3">
									<CheckCircle className="w-5 h-5 text-green-600" />
									<h3 className="font-semibold text-gray-900 text-lg">
										{isFr
											? "Cookies de sécurité (Cloudflare Turnstile)"
											: "Security Cookies (Cloudflare Turnstile)"}
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									{isFr
										? "Cloudflare Turnstile est utilisé sur nos formulaires pour distinguer les humains des robots automatisés. Il peut déposer un token temporaire le temps de la vérification."
										: "Cloudflare Turnstile is used on our forms to distinguish humans from automated bots. It may set a temporary token during verification."}
								</p>
								<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													Cookie
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													{isFr
														? "Finalité"
														: "Purpose"}
												</th>
												<th className="px-4 py-3 text-left font-semibold text-gray-900">
													{isFr
														? "Durée"
														: "Duration"}
												</th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td className="px-4 py-3 font-mono text-xs text-gray-900">
													cf_clearance
												</td>
												<td className="px-4 py-3 text-gray-700">
													{isFr
														? "Vérification anti-bot Cloudflare"
														: "Cloudflare anti-bot verification"}
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
										{isFr
											? "Cookies que nous N'UTILISONS PAS"
											: "Cookies we DO NOT USE"}
									</h3>
								</div>
								<p className="text-gray-700 mb-3">
									{isFr ? (
										<>
											{
												"SkromaPASS respecte votre vie privée et ne déploie "
											}
											<strong>aucun</strong>
											{" des cookies suivants :"}
										</>
									) : (
										<>
											{
												"SkromaPASS respects your privacy and does not deploy "
											}
											<strong>any</strong>
											{" of the following cookies :"}
										</>
									)}
								</p>
								<ul className="space-y-2 text-gray-700">
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												{isFr
													? "Cookies publicitaires :"
													: "Advertising cookies:"}
											</strong>{" "}
											{isFr
												? "Nous n'affichons aucune publicité"
												: "We display no advertising"}
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												{isFr
													? "Cookies de tracking :"
													: "Tracking cookies:"}
											</strong>{" "}
											{isFr
												? "Nous ne suivons pas votre navigation sur d'autres sites"
												: "We do not track your browsing on other sites"}
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 hrink-0" />
										<span>
											<strong>
												{isFr
													? "Cookies de réseaux sociaux :"
													: "Social media cookies:"}
											</strong>{" "}
											{isFr
												? "Aucun bouton de partage tiers"
												: "No third-party share buttons"}
										</span>
									</li>
									<li className="flex items-start gap-2">
										<XCircle className="w-4 h-4 text-red-500 mt-1 shrink-0" />
										<span>
											<strong>
												{isFr
													? "Google Analytics, cookies publicitaires Cloudflare :"
													: "Google Analytics, Cloudflare advertising cookies:"}
											</strong>{" "}
											{isFr
												? "Nous n'utilisons pas de cookies de tracking tiers"
												: "We do not use third-party tracking cookies"}
										</span>
									</li>
								</ul>
							</div>
						</section>

						{/* Local Storage */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Stockage local (Local Storage)"
									: "Local Storage"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "En plus des cookies, SkromaPASS utilise le stockage local de votre navigateur pour :"
									: "In addition to cookies, SkromaPASS uses your browser's local storage for:"}
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
								<li>
									{isFr
										? "Mémoriser vos préférences d'interface (thème, langue)"
										: "Remembering your interface preferences (theme, language)"}
								</li>
								<li>
									{isFr
										? "Stocker temporairement des données de session"
										: "Temporarily storing session data"}
								</li>
								<li>
									{isFr
										? "Cache local pour améliorer les performances"
										: "Local cache to improve performance"}
								</li>
							</ul>
							<p className="text-gray-700 mt-3">
								{isFr ? (
									<>
										<strong>Important :</strong>
										{
											" Vos mots de passe ne sont JAMAIS stockés en clair dans le Local Storage. Toutes les données sensibles sont chiffrées."
										}
									</>
								) : (
									<>
										<strong>Important:</strong>
										{
											" Your passwords are NEVER stored in plain text in Local Storage. All sensitive data is encrypted."
										}
									</>
								)}
							</p>
						</section>

						{/* Gestion des cookies */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Gestion des cookies"
									: "Cookie Management"}
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "Via votre navigateur"
											: "Via your browser"}
									</h3>
									<p className="text-gray-700 mb-3">
										{isFr
											? "Vous pouvez configurer votre navigateur pour refuser les cookies ou être averti lors du dépôt d'un cookie :"
											: "You can configure your browser to refuse cookies or be notified when a cookie is set:"}
									</p>
									<ul className="space-y-2 text-gray-700">
										<li>
											• <strong>Chrome :</strong>{" "}
											{isFr
												? "Paramètres → Confidentialité et sécurité → Cookies"
												: "Settings → Privacy and security → Cookies"}
										</li>
										<li>
											• <strong>Firefox :</strong>{" "}
											{isFr
												? "Options → Vie privée et sécurité → Cookies"
												: "Options → Privacy & Security → Cookies"}
										</li>
										<li>
											• <strong>Safari :</strong>{" "}
											{isFr
												? "Préférences → Confidentialité → Cookies"
												: "Preferences → Privacy → Cookies"}
										</li>
										<li>
											• <strong>Edge :</strong>{" "}
											{isFr
												? "Paramètres → Cookies et autorisations de site"
												: "Settings → Cookies and site permissions"}
										</li>
									</ul>
								</div>
								<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
									<div className="flex items-start gap-3">
										<Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
										<div>
											<h4 className="font-semibold text-amber-900 mb-1">
												{isFr ? "Attention" : "Warning"}
											</h4>
											<p className="text-amber-800 text-sm">
												{isFr
													? "Si vous désactivez tous les cookies, vous ne pourrez plus vous connecter à SkromaPASS car les cookies de session sont nécessaires au fonctionnement du service."
													: "If you disable all cookies, you will no longer be able to log in to SkromaPASS as session cookies are required for the service to function."}
											</p>
										</div>
									</div>
								</div>
							</div>
						</section>

						{/* Extension navigateur */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Extension de navigateur"
									: "Browser Extension"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "L'extension SkromaPASS utilise les API du navigateur pour :"
									: "The SkromaPASS browser extension uses browser APIs to:"}
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
								<li>
									{isFr
										? "Stocker votre token de session de manière sécurisée"
										: "Securely store your session token"}
								</li>
								<li>
									{isFr
										? "Communiquer avec l'API SkromaPASS"
										: "Communicate with the SkromaPASS API"}
								</li>
								<li>
									{isFr
										? "Remplir automatiquement vos identifiants"
										: "Automatically fill in your credentials"}
								</li>
							</ul>
							<p className="text-gray-700 mt-3">
								{isFr
									? "L'extension ne collecte aucune donnée de navigation et ne communique qu'avec les serveurs SkromaPASS."
									: "The extension collects no browsing data and only communicates with SkromaPASS servers."}
							</p>
						</section>

						{/* Tiers */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Services tiers"
									: "Third-party Services"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "SkromaPASS fait appel à des services tiers pour l'hébergement et l'infrastructure :"
									: "SkromaPASS uses third-party services for hosting and infrastructure:"}
							</p>
							<div className="space-y-3">
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										{isFr
											? "Vercel (Hébergement web)"
											: "Vercel (Web hosting)"}
									</h4>
									<p className="text-gray-700 text-sm">
										{isFr
											? "Peut collecter des logs techniques (adresse IP, user-agent) pour assurer le fonctionnement du service."
											: "May collect technical logs (IP address, user-agent) to ensure the service operates correctly."}
									</p>
									<a
										href="https://vercel.com/legal/privacy-policy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										{isFr
											? "Politique de confidentialité Vercel"
											: "Vercel Privacy Policy"}
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										{isFr
											? "Supabase (Base de données)"
											: "Supabase (Database)"}
									</h4>
									<p className="text-gray-700 text-sm">
										{isFr
											? "Héberge vos données chiffrées dans des datacenters européens (RGPD compliant)."
											: "Hosts your encrypted data in European datacenters (GDPR compliant)."}
									</p>
									<a
										href="https://supabase.com/privacy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										{isFr
											? "Politique de confidentialité Supabase"
											: "Supabase Privacy Policy"}
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										{isFr
											? "Resend (Envoi d'emails)"
											: "Resend (Email sending)"}
									</h4>
									<p className="text-gray-700 text-sm">
										{isFr
											? "Service d'envoi d'emails transactionnels (vérification, notifications, réinitialisation de mot de passe)."
											: "Transactional email service (verification, notifications, password reset)."}
									</p>
									<a
										href="https://resend.com/legal/privacy-policy"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										{isFr
											? "Politique de confidentialité Resend"
											: "Resend Privacy Policy"}
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										{isFr
											? "Cloudflare Turnstile (Protection anti-bot)"
											: "Cloudflare Turnstile (Anti-bot protection)"}
									</h4>
									<p className="text-gray-700 text-sm">
										{isFr
											? "Protège les formulaires contre les soumissions automatisées. Traite uniquement les signaux nécessaires à la vérification, sans publicité ni tracking cross-site."
											: "Protects forms against automated submissions. Only processes signals necessary for verification, with no advertising or cross-site tracking."}
									</p>
									<a
										href="https://www.cloudflare.com/privacypolicy/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										{isFr
											? "Politique de confidentialité Cloudflare"
											: "Cloudflare Privacy Policy"}
									</a>
								</div>
								<div className="border border-gray-200 rounded-lg p-4">
									<h4 className="font-semibold text-gray-900 mb-1">
										Cloudflare Web Analytics
									</h4>
									<p className="text-gray-700 text-sm">
										{isFr
											? "Mesure d'audience sans cookies et sans traçage inter-sites. Collecte des statistiques anonymes (pages vues, performances) via un beacon JavaScript. Aucune donnée personnelle identifiable n'est collectée."
											: "Cookie-free, cross-site tracking-free analytics. Collects anonymous statistics (page views, performance) via a JavaScript beacon. No personally identifiable data is collected."}
									</p>
									<a
										href="https://www.cloudflare.com/web-analytics/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 text-sm underline mt-1 inline-block"
									>
										{isFr
											? "En savoir plus sur Cloudflare Web Analytics"
											: "Learn more about Cloudflare Web Analytics"}
									</a>
								</div>
							</div>
						</section>

						{/* Modifications */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Modifications de cette politique"
									: "Changes to This Policy"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Nous nous réservons le droit de modifier cette politique de cookies. Toute modification sera communiquée sur cette page avec une mise à jour de la date de dernière modification."
									: "We reserve the right to modify this cookie policy. Any changes will be communicated on this page along with an updated last-modified date."}
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "Questions" : "Questions / Contact"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Pour toute question concernant notre utilisation des cookies, contactez-nous à"
									: "For any questions regarding our use of cookies, contact us at"}{" "}
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
								{isFr ? "En résumé" : "In Summary"}
							</h3>
							<ul className="space-y-2 text-gray-700">
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										{isFr
											? "Nous utilisons uniquement des cookies essentiels au fonctionnement du service"
											: "We only use cookies essential for the service to function"}
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										{isFr
											? "Aucun cookie publicitaire ni de tracking inter-sites"
											: "No advertising cookies or cross-site tracking"}
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										{isFr
											? "Analytics via Cloudflare Web Analytics — sans cookies, sans données personnelles"
											: "Analytics via Cloudflare Web Analytics — no cookies, no personal data"}
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										{isFr
											? "Vos mots de passe sont toujours chiffrés"
											: "Your passwords are always encrypted"}
									</span>
								</li>
								<li className="flex items-start gap-2">
									<CheckCircle className="w-4 h-4 text-green-600 mt-1 shrink-0" />
									<span>
										{isFr
											? "Conformité RGPD"
											: "GDPR compliant"}
									</span>
								</li>
							</ul>
						</div>

						{/* Dernière mise à jour */}
						<div className="pt-6 border-t border-gray-200">
							<p className="text-sm text-gray-500">
								{isFr
									? "Dernière mise à jour : 7 mars 2026"
									: "Last updated: March 7, 2026"}
							</p>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
