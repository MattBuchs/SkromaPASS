"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useLanguage } from "@/contexts/LanguageContext";
import {
	Database,
	Download,
	Eye,
	Lock,
	Shield,
	Trash2,
	UserCheck,
} from "lucide-react";
import { useState } from "react";

export default function PolitiqueConfidentialitePage() {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { locale } = useLanguage();
	const isFr = locale === "fr";

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
								<Shield className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{isFr
										? "Politique de Confidentialité"
										: "Privacy Policy"}
								</h1>
								<p className="text-gray-600 mt-1">
									{isFr
										? "Protection de vos données personnelles (RGPD)"
										: "Protection of your personal data (GDPR)"}
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
									? "SkromaPASS s'engage à protéger la vie privée de ses utilisateurs et à respecter le Règlement Général sur la Protection des Données (RGPD). Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles."
									: "SkromaPASS is committed to protecting the privacy of its users and complying with the General Data Protection Regulation (GDPR). This privacy policy explains how we collect, use, store and protect your personal data."}
							</p>
						</section>

						{/* Responsable du traitement */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<UserCheck className="w-5 h-5 text-indigo-600" />
								{isFr
									? "Responsable du traitement des données"
									: "Data Controller"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr ? "Responsable :" : "Controller:"}
									</strong>{" "}
									Buchs Matt
								</p>
								<p>
									<strong>
										{isFr ? "Adresse :" : "Address:"}
									</strong>{" "}
									25300 Arçon, France
								</p>
								<p>
									<strong>Email :</strong>{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										mattbuchs25@gmail.com
									</a>
								</p>
							</div>
						</section>

						{/* Données collectées */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Database className="w-5 h-5 text-indigo-600" />
								{isFr ? "Données collectées" : "Data Collected"}
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "Données d'identification"
											: "Identification Data"}
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>
											{isFr
												? "Nom et prénom"
												: "First and last name"}
										</li>
										<li>
											{isFr
												? "Adresse email"
												: "Email address"}
										</li>
										<li>
											{isFr
												? "Mot de passe (chiffré)"
												: "Password (encrypted)"}
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "Données de connexion"
											: "Connection Data"}
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>
											{isFr ? "Adresse IP" : "IP address"}
										</li>
										<li>
											{isFr
												? "Date et heure de connexion"
												: "Login date and time"}
										</li>
										<li>
											{isFr
												? "Type de navigateur"
												: "Browser type"}
										</li>
										<li>
											{isFr
												? "Système d'exploitation"
												: "Operating system"}
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										{isFr
											? "Données fonctionnelles"
											: "Functional Data"}
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>
											{isFr
												? "Mots de passe stockés (chiffrés avec AES-256)"
												: "Stored passwords (encrypted with AES-256)"}
										</li>
										<li>
											{isFr
												? "Dossiers et catégories créés"
												: "Folders and categories created"}
										</li>
										<li>
											{isFr
												? "Notes associées aux mots de passe"
												: "Notes associated with passwords"}
										</li>
										<li>
											{isFr
												? "Préférences utilisateur"
												: "User preferences"}
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Finalités du traitement */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Finalités du traitement"
									: "Purposes of Processing"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "Nous collectons et traitons vos données personnelles pour les finalités suivantes :"
									: "We collect and process your personal data for the following purposes:"}
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								<li>
									{isFr
										? "Création et gestion de votre compte utilisateur"
										: "Creation and management of your user account"}
								</li>
								<li>
									{isFr
										? "Authentification et sécurisation de l'accès"
										: "Authentication and securing access"}
								</li>
								<li>
									{isFr
										? "Stockage sécurisé de vos mots de passe"
										: "Secure storage of your passwords"}
								</li>
								<li>
									{isFr
										? "Amélioration de nos services"
										: "Improvement of our services"}
								</li>
								<li>
									{isFr
										? "Communication avec vous (support, notifications)"
										: "Communication with you (support, notifications)"}
								</li>
								<li>
									{isFr
										? "Respect de nos obligations légales"
										: "Compliance with our legal obligations"}
								</li>
								<li>
									{isFr
										? "Prévention de la fraude et de l'utilisation abusive"
										: "Prevention of fraud and misuse"}
								</li>
							</ul>
						</section>

						{/* Base légale */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Base légale du traitement"
									: "Legal Basis for Processing"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr
											? "Exécution du contrat :"
											: "Contract performance:"}
									</strong>{" "}
									{isFr
										? "Le traitement de vos données est nécessaire pour l'exécution du service SkromaPASS."
										: "The processing of your data is necessary for the execution of the SkromaPASS service."}
								</p>
								<p>
									<strong>
										{isFr ? "Consentement :" : "Consent:"}
									</strong>{" "}
									{isFr
										? "Vous consentez au traitement de vos données en créant un compte et en utilisant nos services."
										: "You consent to the processing of your data by creating an account and using our services."}
								</p>
								<p>
									<strong>
										{isFr
											? "Intérêt légitime :"
											: "Legitimate interest:"}
									</strong>{" "}
									{isFr
										? "Nous traitons certaines données pour améliorer nos services et assurer la sécurité de la plateforme."
										: "We process certain data to improve our services and ensure the security of the platform."}
								</p>
							</div>
						</section>

						{/* Sécurité */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Lock className="w-5 h-5 text-indigo-600" />
								{isFr
									? "Sécurité des données"
									: "Data Security"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "La sécurité de vos données est notre priorité absolue. Nous mettons en œuvre des mesures de sécurité avancées :"
									: "The security of your data is our absolute priority. We implement advanced security measures:"}
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								<li>
									<strong>Chiffrement AES-256 :</strong>{" "}
									{isFr
										? "Tous vos mots de passe sont chiffrés avec l'algorithme AES-256"
										: "All your passwords are encrypted with the AES-256 algorithm"}
								</li>
								<li>
									<strong>Hachage bcrypt :</strong>{" "}
									{isFr
										? "Votre mot de passe principal est haché avec bcrypt"
										: "Your master password is hashed with bcrypt"}
								</li>
								<li>
									<strong>HTTPS :</strong>{" "}
									{isFr
										? "Toutes les communications sont chiffrées via SSL/TLS"
										: "All communications are encrypted via SSL/TLS"}
								</li>
								<li>
									<strong>
										{isFr
											? "Authentification à deux facteurs (2FA) :"
											: "Two-factor authentication (2FA):"}
									</strong>{" "}
									{isFr
										? "Protection supplémentaire optionnelle"
										: "Optional additional protection"}
								</li>
								<li>
									<strong>
										{isFr
											? "Serveurs sécurisés :"
											: "Secure servers:"}
									</strong>{" "}
									{isFr
										? "Hébergement dans des datacenters certifiés (Supabase EU-WEST-1)"
										: "Hosted in certified data centers (Supabase EU-WEST-1)"}
								</li>
								<li>
									<strong>
										{isFr
											? "Surveillance :"
											: "Monitoring:"}
									</strong>{" "}
									{isFr
										? "Logs de sécurité et détection des activités suspectes"
										: "Security logs and suspicious activity detection"}
								</li>
							</ul>
						</section>

						{/* Durée de conservation */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Durée de conservation"
									: "Retention Period"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr
											? "Données de compte :"
											: "Account data:"}
									</strong>{" "}
									{isFr
										? "Conservées tant que votre compte est actif"
										: "Retained as long as your account is active"}
								</p>
								<p>
									<strong>
										{isFr
											? "Logs de connexion :"
											: "Connection logs:"}
									</strong>{" "}
									{isFr
										? "Conservés pendant 12 mois maximum"
										: "Retained for a maximum of 12 months"}
								</p>
								<p>
									<strong>
										{isFr
											? "Après suppression du compte :"
											: "After account deletion:"}
									</strong>{" "}
									{isFr
										? "Suppression définitive sous 30 jours, sauf obligation légale de conservation"
										: "Permanent deletion within 30 days, unless required by law"}
								</p>
							</div>
						</section>

						{/* Partage des données */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Partage des données
							</h2>
							<p className="text-gray-700 mb-3">
								<strong>
									SkromaPASS ne vend ni ne loue vos données
									personnelles.
								</strong>
							</p>
							<p className="text-gray-700 mb-3">
								Vos données peuvent être partagées uniquement
								dans les cas suivants :
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								<li>
									<strong>Prestataires techniques :</strong>{" "}
									Hébergement (Vercel, Supabase), emails
									(Resend), protection anti-bot et analytique
									(Cloudflare) - sous contrat de
									confidentialité
								</li>
								<li>
									<strong>Cloudflare Turnstile :</strong>{" "}
									Utilisé pour la protection anti-bot sur les
									formulaires (inscription, contact,
									réinitialisation de mot de passe). Traite
									les données selon la{" "}
									<a
										href="https://www.cloudflare.com/privacypolicy/"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										politique de confidentialité Cloudflare
									</a>
									.
								</li>
								<li>
									<strong>Cloudflare Web Analytics :</strong>{" "}
									Mesure d&apos;audience respectueuse de la
									vie privée (sans cookies, sans traçage
									inter-sites). Collecte des statistiques
									anonymes de navigation (pages vues,
									performances).
								</li>
								<li>
									<strong>Obligations légales :</strong> Si
									requis par la loi ou une autorité judiciaire
								</li>
								<li>
									<strong>Protection des droits :</strong>{" "}
									Pour protéger nos droits, notre propriété ou
									la sécurité de nos utilisateurs
								</li>
							</ul>
						</section>

						{/* Vos droits */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Eye className="w-5 h-5 text-indigo-600" />
								{isFr
									? "Vos droits (RGPD)"
									: "Your Rights (GDPR)"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "Conformément au RGPD, vous disposez des droits suivants :"
									: "In accordance with the GDPR, you have the following rights:"}
							</p>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Eye className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit d'accès"
												: "Right of access"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Obtenir une copie de vos données personnelles"
												: "Obtain a copy of your personal data"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Download className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit à la portabilité"
												: "Right to portability"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Recevoir vos données dans un format structuré"
												: "Receive your data in a structured format"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Trash2 className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit à l'effacement"
												: "Right to erasure"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Supprimer vos données (droit à l'oubli)"
												: "Delete your data (right to be forgotten)"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Lock className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit de rectification"
												: "Right to rectification"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Corriger vos données inexactes"
												: "Correct your inaccurate data"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit de limitation"
												: "Right to restriction"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Limiter le traitement de vos données"
												: "Restrict the processing of your data"}
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<UserCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											{isFr
												? "Droit d'opposition"
												: "Right to object"}
										</h3>
										<p className="text-gray-700 text-sm">
											{isFr
												? "Vous opposer au traitement de vos données"
												: "Object to the processing of your data"}
										</p>
									</div>
								</div>
							</div>
							<div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
								<p className="text-gray-700">
									<strong>
										{isFr
											? "Pour exercer vos droits :"
											: "To exercise your rights:"}
									</strong>{" "}
									{isFr
										? "Contactez-nous à"
										: "Contact us at"}{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline font-medium"
									>
										mattbuchs25@gmail.com
									</a>{" "}
									{isFr ? "ou via la page" : "or via the"}{" "}
									<a
										href="/contact"
										className="text-indigo-600 hover:text-indigo-700 underline font-medium"
									>
										Contact
									</a>
									.
								</p>
							</div>
						</section>

						{/* Réclamation */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Droit de réclamation"
									: "Right to Lodge a Complaint"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :"
									: "If you believe your rights are not being respected, you may lodge a complaint with the CNIL (French data protection authority) at:"}{" "}
								<a
									href="https://www.cnil.fr"
									target="_blank"
									rel="noopener noreferrer"
									className="text-indigo-600 hover:text-indigo-700 underline"
								>
									www.cnil.fr
								</a>
							</p>
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
									? "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications importantes vous seront notifiées par email et/ou via une notification sur la plateforme."
									: "We reserve the right to modify this privacy policy at any time. Significant changes will be notified to you by email and/or via a notification on the platform."}
							</p>
						</section>

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
		</div>
	);
}
