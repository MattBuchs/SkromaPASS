"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
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
									Politique de Confidentialité
								</h1>
								<p className="text-gray-600 mt-1">
									Protection de vos données personnelles
									(RGPD)
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Introduction */}
						<section>
							<p className="text-gray-700 leading-relaxed">
								MemKeyPass s&apos;engage à protéger la vie
								privée de ses utilisateurs et à respecter le
								Règlement Général sur la Protection des Données
								(RGPD). Cette politique de confidentialité
								explique comment nous collectons, utilisons,
								stockons et protégeons vos données personnelles.
							</p>
						</section>

						{/* Responsable du traitement */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<UserCheck className="w-5 h-5 text-indigo-600" />
								Responsable du traitement des données
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>Responsable :</strong> Buchs Matt
								</p>
								<p>
									<strong>Adresse :</strong> 25300 Arçon,
									France
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
								Données collectées
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Données d&apos;identification
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>Nom et prénom</li>
										<li>Adresse email</li>
										<li>Mot de passe (chiffré)</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Données de connexion
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>Adresse IP</li>
										<li>Date et heure de connexion</li>
										<li>Type de navigateur</li>
										<li>Système d&apos;exploitation</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Données fonctionnelles
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700">
										<li>
											Mots de passe stockés (chiffrés avec
											AES-256)
										</li>
										<li>Dossiers et catégories créés</li>
										<li>
											Notes associées aux mots de passe
										</li>
										<li>Préférences utilisateur</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Finalités du traitement */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Finalités du traitement
							</h2>
							<p className="text-gray-700 mb-3">
								Nous collectons et traitons vos données
								personnelles pour les finalités suivantes :
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								<li>
									Création et gestion de votre compte
									utilisateur
								</li>
								<li>
									Authentification et sécurisation de
									l&apos;accès
								</li>
								<li>Stockage sécurisé de vos mots de passe</li>
								<li>Amélioration de nos services</li>
								<li>
									Communication avec vous (support,
									notifications)
								</li>
								<li>Respect de nos obligations légales</li>
								<li>
									Prévention de la fraude et de
									l&apos;utilisation abusive
								</li>
							</ul>
						</section>

						{/* Base légale */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Base légale du traitement
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>Exécution du contrat :</strong> Le
									traitement de vos données est nécessaire
									pour l&apos;exécution du service MemKeyPass.
								</p>
								<p>
									<strong>Consentement :</strong> Vous
									consentez au traitement de vos données en
									créant un compte et en utilisant nos
									services.
								</p>
								<p>
									<strong>Intérêt légitime :</strong> Nous
									traitons certaines données pour améliorer
									nos services et assurer la sécurité de la
									plateforme.
								</p>
							</div>
						</section>

						{/* Sécurité */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Lock className="w-5 h-5 text-indigo-600" />
								Sécurité des données
							</h2>
							<p className="text-gray-700 mb-3">
								La sécurité de vos données est notre priorité
								absolue. Nous mettons en œuvre des mesures de
								sécurité avancées :
							</p>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								<li>
									<strong>Chiffrement AES-256 :</strong> Tous
									vos mots de passe sont chiffrés avec
									l&apos;algorithme AES-256
								</li>
								<li>
									<strong>Hachage bcrypt :</strong> Votre mot
									de passe principal est haché avec bcrypt
								</li>
								<li>
									<strong>HTTPS :</strong> Toutes les
									communications sont chiffrées via SSL/TLS
								</li>
								<li>
									<strong>
										Authentification à deux facteurs (2FA) :
									</strong>{" "}
									Protection supplémentaire optionnelle
								</li>
								<li>
									<strong>Serveurs sécurisés :</strong>{" "}
									Hébergement dans des datacenters certifiés
									(Supabase EU-WEST-1)
								</li>
								<li>
									<strong>Surveillance :</strong> Logs de
									sécurité et détection des activités
									suspectes
								</li>
							</ul>
						</section>

						{/* Durée de conservation */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Durée de conservation
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>Données de compte :</strong>{" "}
									Conservées tant que votre compte est actif
								</p>
								<p>
									<strong>Logs de connexion :</strong>{" "}
									Conservés pendant 12 mois maximum
								</p>
								<p>
									<strong>
										Après suppression du compte :
									</strong>{" "}
									Suppression définitive sous 30 jours, sauf
									obligation légale de conservation
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
									MemKeyPass ne vend ni ne loue vos données
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
								Vos droits (RGPD)
							</h2>
							<p className="text-gray-700 mb-3">
								Conformément au RGPD, vous disposez des droits
								suivants :
							</p>
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<Eye className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit d&apos;accès
										</h3>
										<p className="text-gray-700 text-sm">
											Obtenir une copie de vos données
											personnelles
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Download className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit à la portabilité
										</h3>
										<p className="text-gray-700 text-sm">
											Recevoir vos données dans un format
											structuré
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Trash2 className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit à l&apos;effacement
										</h3>
										<p className="text-gray-700 text-sm">
											Supprimer vos données (droit à
											l&apos;oubli)
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Lock className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit de rectification
										</h3>
										<p className="text-gray-700 text-sm">
											Corriger vos données inexactes
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit de limitation
										</h3>
										<p className="text-gray-700 text-sm">
											Limiter le traitement de vos données
										</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<UserCheck className="w-5 h-5 text-indigo-600 mt-0.5" />
									<div>
										<h3 className="font-semibold text-gray-900">
											Droit d&apos;opposition
										</h3>
										<p className="text-gray-700 text-sm">
											Vous opposer au traitement de vos
											données
										</p>
									</div>
								</div>
							</div>
							<div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
								<p className="text-gray-700">
									<strong>Pour exercer vos droits :</strong>{" "}
									Contactez-nous à{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline font-medium"
									>
										mattbuchs25@gmail.com
									</a>{" "}
									ou via la page{" "}
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
								Droit de réclamation
							</h2>
							<p className="text-gray-700">
								Si vous estimez que vos droits ne sont pas
								respectés, vous pouvez introduire une
								réclamation auprès de la CNIL (Commission
								Nationale de l&apos;Informatique et des
								Libertés) :{" "}
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
								Modifications de cette politique
							</h2>
							<p className="text-gray-700">
								Nous nous réservons le droit de modifier cette
								politique de confidentialité à tout moment. Les
								modifications importantes vous seront notifiées
								par email et/ou via une notification sur la
								plateforme.
							</p>
						</section>

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
