"use client";

import Footer from "@/components/layout/Footer";
import HeaderHome from "@/components/layout/HeaderHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { CheckCircle, FileText, Shield, XCircle } from "lucide-react";

export default function CGUPage() {
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
								<FileText className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{isFr
										? "Conditions Générales d'Utilisation"
										: "Terms and Conditions of Use"}
								</h1>
								<p className="text-gray-600 mt-1">
									{isFr
										? "Conditions régissant l'utilisation de SkromaPASS"
										: "Conditions governing the use of SkromaPASS"}
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Préambule */}
						<section>
							<p className="text-gray-700 leading-relaxed">
								{isFr
									? "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation du service SkromaPASS, un gestionnaire de mots de passe en ligne. En créant un compte et en utilisant nos services, vous acceptez sans réserve ces conditions."
									: "These Terms and Conditions of Use (TOU) govern the use of the SkromaPASS service, an online password manager. By creating an account and using our services, you unconditionally accept these conditions."}
							</p>
						</section>

						{/* Objet */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "1. Objet" : "1. Purpose"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "SkromaPASS est un service permettant de stocker, gérer et sécuriser vos mots de passe et informations sensibles de manière chiffrée. Le service est accessible via une interface web et une extension de navigateur."
									: "SkromaPASS is a service for storing, managing and securing your passwords and sensitive information in an encrypted manner. The service is accessible via a web interface and a browser extension."}
							</p>
						</section>

						{/* Conditions d'accès */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "2. Conditions d'accès au service"
									: "2. Service Access Conditions"}
							</h2>
							<div className="space-y-3">
								<p className="text-gray-700">
									{isFr
										? "Pour utiliser SkromaPASS, vous devez :"
										: "To use SkromaPASS, you must:"}
								</p>
								<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
									<li>
										{isFr
											? "\u00catre âgé d'au moins 18 ans ou avoir l'autorisation d'un représentant légal"
											: "Be at least 18 years old or have the authorization of a legal representative"}
									</li>
									<li>
										{isFr
											? "Fournir des informations exactes et à jour lors de l'inscription"
											: "Provide accurate and up-to-date information upon registration"}
									</li>
									<li>
										{isFr
											? "Créer un mot de passe principal fort et unique"
											: "Create a strong and unique master password"}
									</li>
									<li>
										{isFr
											? "Vérifier votre adresse email"
											: "Verify your email address"}
									</li>
									<li>
										{isFr
											? "Accepter les présentes CGU et la Politique de Confidentialité"
											: "Accept these Terms and the Privacy Policy"}
									</li>
								</ul>
							</div>
						</section>

						{/* Création de compte */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "3. Création et gestion du compte"
									: "3. Account Creation and Management"}
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "3.1 Création du compte"
											: "3.1 Account Creation"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Vous vous engagez à fournir des informations exactes lors de l'inscription et à les maintenir à jour. Vous êtes seul responsable de l'activité sur votre compte."
											: "You agree to provide accurate information at registration and to keep it up to date. You are solely responsible for all activity on your account."}
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "3.2 Mot de passe du compte"
											: "3.2 Account Password"}
									</h3>
									<p className="text-gray-700 mb-2">
										{isFr
											? "Votre mot de passe protège l'accès à votre compte SkromaPASS. Vos données sont chiffrées côté serveur avec une clé AES-256 indépendante de votre mot de passe de connexion."
											: "Your password protects access to your SkromaPASS account. Your data is encrypted server-side with an AES-256 key independent of your login password."}
									</p>
									<p className="text-gray-700">
										{isFr
											? "En cas d'oubli, vous pouvez réinitialiser votre mot de passe via la fonction"
											: "If you forget it, you can reset your password via the"}{" "}
										<a
											href="/forgot-password"
											className="text-indigo-600 hover:text-indigo-700 underline font-medium"
										>
											{isFr
												? "Mot de passe oublié"
												: "Forgot Password"}
										</a>{" "}
										{isFr
											? "disponible sur la page de connexion. Un lien de réinitialisation valable 1 heure vous sera envoyé par email."
											: "available on the login page. A reset link valid for 1 hour will be sent to you by email."}
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "3.3 Sécurité du compte"
											: "3.3 Account Security"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Vous êtes responsable de la confidentialité de vos identifiants. Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte."
											: "You are responsible for the confidentiality of your credentials. You must notify us immediately of any unauthorized use of your account."}
									</p>
								</div>
							</div>
						</section>

						{/* Utilisation du service */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "4. Utilisation du service"
									: "4. Service Use"}
							</h2>
							<div className="space-y-4">
								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<CheckCircle className="w-5 h-5 text-green-600" />
										{isFr
											? "Usages autorisés"
											: "Permitted Uses"}
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
										<li>
											{isFr
												? "Stocker vos mots de passe personnels et professionnels"
												: "Store your personal and professional passwords"}
										</li>
										<li>
											{isFr
												? "Organiser vos identifiants par dossiers et catégories"
												: "Organize your credentials by folders and categories"}
										</li>
										<li>
											{isFr
												? "Générer des mots de passe sécurisés"
												: "Generate secure passwords"}
										</li>
										<li>
											{isFr
												? "Utiliser l'extension de navigateur"
												: "Use the browser extension"}
										</li>
										<li>
											{isFr
												? "Activer l'authentification à deux facteurs"
												: "Enable two-factor authentication"}
										</li>
									</ul>
								</div>
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<XCircle className="w-5 h-5 text-red-600" />
										{isFr
											? "Usages interdits"
											: "Prohibited Uses"}
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
										<li>
											{isFr
												? "Tenter de contourner les mesures de sécurité"
												: "Attempt to bypass security measures"}
										</li>
										<li>
											{isFr
												? "Partager votre compte avec des tiers"
												: "Share your account with third parties"}
										</li>
										<li>
											{isFr
												? "Utiliser le service pour des activités illégales"
												: "Use the service for illegal activities"}
										</li>
										<li>
											{isFr
												? "Stocker des données violant les droits de tiers"
												: "Store data that violates the rights of third parties"}
										</li>
										<li>
											{isFr
												? "Effectuer du reverse engineering sur l'application"
												: "Perform reverse engineering on the application"}
										</li>
										<li>
											{isFr
												? "Utiliser des scripts automatisés pour accéder au service"
												: "Use automated scripts to access the service"}
										</li>
										<li>
											{isFr
												? "Tenter d'accéder aux données d'autres utilisateurs"
												: "Attempt to access other users' data"}
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Propriété intellectuelle */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "5. Propriété intellectuelle"
									: "5. Intellectual Property"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "Tous les éléments du service SkromaPASS (code source, design, logos, marques) sont protégés par le droit d'auteur et sont la propriété exclusive de SkromaPASS."
									: "All elements of the SkromaPASS service (source code, design, logos, trademarks) are protected by copyright and are the exclusive property of SkromaPASS."}
							</p>
							<p className="text-gray-700">
								{isFr
									? "Vous conservez l'entière propriété de vos données (mots de passe, notes, etc.). SkromaPASS ne revendique aucun droit sur vos données personnelles."
									: "You retain full ownership of your data (passwords, notes, etc.). SkromaPASS claims no rights over your personal data."}
							</p>
						</section>

						{/* Responsabilités */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "6. Responsabilités et limitations"
									: "6. Responsibilities and Limitations"}
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "6.1 Responsabilités de SkromaPASS"
											: "6.1 SkromaPASS Responsibilities"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Nous mettons tout en œuvre pour assurer la sécurité et la disponibilité du service. Nous nous engageons à :"
											: "We do everything we can to ensure the security and availability of the service. We commit to:"}
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>
											{isFr
												? "Chiffrer vos données avec l'algorithme AES-256"
												: "Encrypt your data with the AES-256 algorithm"}
										</li>
										<li>
											{isFr
												? "Maintenir le service accessible 99% du temps (hors maintenance)"
												: "Keep the service accessible 99% of the time (excluding maintenance)"}
										</li>
										<li>
											{isFr
												? "Effectuer des sauvegardes régulières"
												: "Perform regular backups"}
										</li>
										<li>
											{isFr
												? "Vous notifier en cas d'incident de sécurité"
												: "Notify you in case of a security incident"}
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "6.2 Limitations de responsabilité"
											: "6.2 Liability Limitations"}
									</h3>
									<p className="text-gray-700 mb-2">
										{isFr
											? "SkromaPASS ne peut être tenu responsable :"
											: "SkromaPASS cannot be held liable for:"}
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
										<li>
											{isFr
												? "De la perte de votre mot de passe principal"
												: "Loss of your master password"}
										</li>
										<li>
											{isFr
												? "De l'utilisation non autorisée de votre compte due à votre négligence"
												: "Unauthorized use of your account due to your negligence"}
										</li>
										<li>
											{isFr
												? "Des interruptions temporaires du service (maintenance, force majeure)"
												: "Temporary service interruptions (maintenance, force majeure)"}
										</li>
										<li>
											{isFr
												? "De l'utilisation que vous faites des mots de passe stockés"
												: "How you use the stored passwords"}
										</li>
										<li>
											{isFr
												? "Des dommages indirects ou consécutifs"
												: "Indirect or consequential damages"}
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "6.3 Vos responsabilités"
											: "6.3 Your Responsibilities"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Vous êtes responsable de :"
											: "You are responsible for:"}
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>
											{isFr
												? "La sécurité de votre mot de passe principal"
												: "The security of your master password"}
										</li>
										<li>
											{isFr
												? "L'exactitude des données que vous stockez"
												: "The accuracy of the data you store"}
										</li>
										<li>
											{isFr
												? "L'utilisation conforme du service"
												: "Compliant use of the service"}
										</li>
										<li>
											{isFr
												? "La sécurité de vos appareils d'accès"
												: "The security of your access devices"}
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Tarification */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "7. Tarification" : "7. Pricing"}
							</h2>
							<p className="text-gray-700 mb-2">
								<strong>
									{isFr
										? "Service actuellement gratuit :"
										: "Currently free service:"}
								</strong>{" "}
								{isFr
									? "SkromaPASS est actuellement proposé gratuitement. Nous nous réservons le droit d'introduire des offres payantes à l'avenir."
									: "SkromaPASS is currently offered free of charge. We reserve the right to introduce paid offers in the future."}
							</p>
							<p className="text-gray-700">
								{isFr
									? "En cas d'introduction de tarifs, les utilisateurs existants seront informés."
									: "Upon introduction of pricing, existing users will be notified."}
							</p>
						</section>

						{/* Durée et résiliation */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "8. Durée et résiliation"
									: "8. Term and Termination"}
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "8.1 Résiliation par l'utilisateur"
											: "8.1 Termination by the User"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Vous pouvez supprimer votre compte à tout moment depuis la page Paramètres. La suppression est définitive et entraîne la suppression de toutes vos données sous 30 jours."
											: "You may delete your account at any time from the Settings page. Deletion is permanent and results in the removal of all your data within 30 days."}
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "8.2 Résiliation par SkromaPASS"
											: "8.2 Termination by SkromaPASS"}
									</h3>
									<p className="text-gray-700">
										{isFr
											? "Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de :"
											: "We reserve the right to suspend or delete your account in the event of:"}
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>
											{isFr
												? "Violation des présentes CGU"
												: "Violation of these Terms"}
										</li>
										<li>
											{isFr
												? "Activité frauduleuse ou illégale"
												: "Fraudulent or illegal activity"}
										</li>
										<li>
											{isFr
												? "Inactivité prolongée (plus de 24 mois)"
												: "Extended inactivity (more than 24 months)"}
										</li>
										<li>
											{isFr
												? "Non-paiement (si applicable)"
												: "Non-payment (if applicable)"}
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Données personnelles */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Shield className="w-5 h-5 text-indigo-600" />
								{isFr
									? "9. Protection des données personnelles"
									: "9. Personal Data Protection"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Le traitement de vos données personnelles est régi par notre"
									: "The processing of your personal data is governed by our"}{" "}
								<a
									href="/legal/privacy-policy"
									className="text-indigo-600 hover:text-indigo-700 underline font-medium"
								>
									{isFr
										? "Politique de Confidentialité"
										: "Privacy Policy"}
								</a>{" "}
								{isFr
									? "conforme au RGPD."
									: "compliant with GDPR."}
							</p>
						</section>

						{/* Modifications */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "10. Modifications des CGU"
									: "10. Changes to Terms"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les modifications importantes vous seront notifiées par email 15 jours avant leur entrée en vigueur. L'utilisation continue du service après modification vaut acceptation des nouvelles conditions."
									: "We reserve the right to modify these Terms at any time. Significant changes will be notified to you by email 15 days before they come into effect. Continued use of the service after modification constitutes acceptance of the new terms."}
							</p>
						</section>

						{/* Droit applicable */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "11. Droit applicable et juridiction"
									: "11. Applicable Law and Jurisdiction"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "Les présentes CGU sont régies par le droit français."
									: "These Terms are governed by French law."}
							</p>
							<p className="text-gray-700">
								{isFr
									? "En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, les tribunaux français seront seuls compétents."
									: "In the event of a dispute, the parties will endeavor to find an amicable solution. Failing that, French courts shall have exclusive jurisdiction."}
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "12. Contact" : "12. Contact"}
							</h2>
							<p className="text-gray-700 mb-2">
								{isFr
									? "Pour toute question concernant ces CGU :"
									: "For any questions about these Terms:"}
							</p>
							<ul className="space-y-1 text-gray-700">
								<li>
									{isFr ? "\u2022 Email :" : "\u2022 Email:"}{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										mattbuchs25@gmail.com
									</a>
								</li>
								<li>
									{isFr
										? "\u2022 Formulaire de contact :"
										: "\u2022 Contact form:"}{" "}
									<a
										href="/contact"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										contact
									</a>
								</li>
							</ul>
						</section>

						{/* Acceptation */}
						<div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
							<h3 className="font-semibold text-gray-900 mb-2">
								{isFr
									? "Acceptation des conditions"
									: "Acceptance of Terms"}
							</h3>
							<p className="text-gray-700">
								{isFr
									? "En créant un compte SkromaPASS, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes Conditions Générales d'Utilisation ainsi que la Politique de Confidentialité."
									: "By creating a SkromaPASS account, you acknowledge that you have read, understood and accepted all of these Terms and Conditions of Use as well as the Privacy Policy."}
							</p>
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
