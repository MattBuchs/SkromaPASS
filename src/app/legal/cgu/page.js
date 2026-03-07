"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { CheckCircle, FileText, Shield, XCircle } from "lucide-react";
import { useState } from "react";

export default function CGUPage() {
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
								<FileText className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									Conditions Générales d&apos;Utilisation
								</h1>
								<p className="text-gray-600 mt-1">
									Conditions régissant l&apos;utilisation de
									MemKeyPass
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Préambule */}
						<section>
							<p className="text-gray-700 leading-relaxed">
								Les présentes Conditions Générales
								d&apos;Utilisation (CGU) régissent
								l&apos;utilisation du service MemKeyPass, un
								gestionnaire de mots de passe en ligne. En
								créant un compte et en utilisant nos services,
								vous acceptez sans réserve ces conditions.
							</p>
						</section>

						{/* Objet */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								1. Objet
							</h2>
							<p className="text-gray-700">
								MemKeyPass est un service permettant de stocker,
								gérer et sécuriser vos mots de passe et
								informations sensibles de manière chiffrée. Le
								service est accessible via une interface web et
								une extension de navigateur.
							</p>
						</section>

						{/* Conditions d'accès */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								2. Conditions d&apos;accès au service
							</h2>
							<div className="space-y-3">
								<p className="text-gray-700">
									Pour utiliser MemKeyPass, vous devez :
								</p>
								<ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
									<li>
										Être âgé d&apos;au moins 18 ans ou avoir
										l&apos;autorisation d&apos;un
										représentant légal
									</li>
									<li>
										Fournir des informations exactes et à
										jour lors de l&apos;inscription
									</li>
									<li>
										Créer un mot de passe principal fort et
										unique
									</li>
									<li>Vérifier votre adresse email</li>
									<li>
										Accepter les présentes CGU et la
										Politique de Confidentialité
									</li>
								</ul>
							</div>
						</section>

						{/* Création de compte */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								3. Création et gestion du compte
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										3.1 Création du compte
									</h3>
									<p className="text-gray-700">
										Vous vous engagez à fournir des
										informations exactes lors de
										l&apos;inscription et à les maintenir à
										jour. Vous êtes seul responsable de
										l&apos;activité sur votre compte.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										3.2 Mot de passe du compte
									</h3>
									<p className="text-gray-700 mb-2">
										Votre mot de passe protège l&apos;accès
										à votre compte MemKeyPass. Vos données
										sont chiffrées côté serveur avec une clé
										AES-256 indépendante de votre mot de
										passe de connexion.
									</p>
									<p className="text-gray-700">
										En cas d&apos;oubli, vous pouvez
										réinitialiser votre mot de passe via la
										fonction{" "}
										<a
											href="/forgot-password"
											className="text-indigo-600 hover:text-indigo-700 underline font-medium"
										>
											Mot de passe oublié
										</a>{" "}
										disponible sur la page de connexion. Un
										lien de réinitialisation valable 1 heure
										vous sera envoyé par email.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										3.3 Sécurité du compte
									</h3>
									<p className="text-gray-700">
										Vous êtes responsable de la
										confidentialité de vos identifiants.
										Vous devez nous informer immédiatement
										de toute utilisation non autorisée de
										votre compte.
									</p>
								</div>
							</div>
						</section>

						{/* Utilisation du service */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								4. Utilisation du service
							</h2>
							<div className="space-y-4">
								<div className="bg-green-50 border border-green-200 rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<CheckCircle className="w-5 h-5 text-green-600" />
										Usages autorisés
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
										<li>
											Stocker vos mots de passe personnels
											et professionnels
										</li>
										<li>
											Organiser vos identifiants par
											dossiers et catégories
										</li>
										<li>
											Générer des mots de passe sécurisés
										</li>
										<li>
											Utiliser l&apos;extension de
											navigateur
										</li>
										<li>
											Activer l&apos;authentification à
											deux facteurs
										</li>
									</ul>
								</div>
								<div className="bg-red-50 border border-red-200 rounded-lg p-4">
									<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
										<XCircle className="w-5 h-5 text-red-600" />
										Usages interdits
									</h3>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-6">
										<li>
											Tenter de contourner les mesures de
											sécurité
										</li>
										<li>
											Partager votre compte avec des tiers
										</li>
										<li>
											Utiliser le service pour des
											activités illégales
										</li>
										<li>
											Stocker des données violant les
											droits de tiers
										</li>
										<li>
											Effectuer du reverse engineering sur
											l&apos;application
										</li>
										<li>
											Utiliser des scripts automatisés
											pour accéder au service
										</li>
										<li>
											Tenter d&apos;accéder aux données
											d&apos;autres utilisateurs
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Propriété intellectuelle */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								5. Propriété intellectuelle
							</h2>
							<p className="text-gray-700 mb-3">
								Tous les éléments du service MemKeyPass (code
								source, design, logos, marques) sont protégés
								par le droit d&apos;auteur et sont la propriété
								exclusive de MemKeyPass.
							</p>
							<p className="text-gray-700">
								Vous conservez l&apos;entière propriété de vos
								données (mots de passe, notes, etc.). MemKeyPass
								ne revendique aucun droit sur vos données
								personnelles.
							</p>
						</section>

						{/* Responsabilités */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								6. Responsabilités et limitations
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										6.1 Responsabilités de MemKeyPass
									</h3>
									<p className="text-gray-700">
										Nous mettons tout en œuvre pour assurer
										la sécurité et la disponibilité du
										service. Nous nous engageons à :
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>
											Chiffrer vos données avec
											l&apos;algorithme AES-256
										</li>
										<li>
											Maintenir le service accessible 99%
											du temps (hors maintenance)
										</li>
										<li>
											Effectuer des sauvegardes régulières
										</li>
										<li>
											Vous notifier en cas d&apos;incident
											de sécurité
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										6.2 Limitations de responsabilité
									</h3>
									<p className="text-gray-700 mb-2">
										MemKeyPass ne peut être tenu responsable
										:
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
										<li>
											De la perte de votre mot de passe
											principal
										</li>
										<li>
											De l&apos;utilisation non autorisée
											de votre compte due à votre
											négligence
										</li>
										<li>
											Des interruptions temporaires du
											service (maintenance, force majeure)
										</li>
										<li>
											De l&apos;utilisation que vous
											faites des mots de passe stockés
										</li>
										<li>
											Des dommages indirects ou
											consécutifs
										</li>
									</ul>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										6.3 Vos responsabilités
									</h3>
									<p className="text-gray-700">
										Vous êtes responsable de :
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>
											La sécurité de votre mot de passe
											principal
										</li>
										<li>
											L&apos;exactitude des données que
											vous stockez
										</li>
										<li>
											L&apos;utilisation conforme du
											service
										</li>
										<li>
											La sécurité de vos appareils
											d&apos;accès
										</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Tarification */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								7. Tarification
							</h2>
							<p className="text-gray-700 mb-2">
								<strong>Service actuellement gratuit :</strong>{" "}
								MemKeyPass est actuellement proposé
								gratuitement. Nous nous réservons le droit
								d&apos;introduire des offres payantes à
								l&apos;avenir.
							</p>
							<p className="text-gray-700">
								En cas d&apos;introduction de tarifs, les
								utilisateurs existants seront informés.
							</p>
						</section>

						{/* Durée et résiliation */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								8. Durée et résiliation
							</h2>
							<div className="space-y-4">
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										8.1 Résiliation par l&apos;utilisateur
									</h3>
									<p className="text-gray-700">
										Vous pouvez supprimer votre compte à
										tout moment depuis la page Paramètres.
										La suppression est définitive et
										entraîne la suppression de toutes vos
										données sous 30 jours.
									</p>
								</div>
								<div>
									<h3 className="font-semibold text-gray-900 mb-2">
										8.2 Résiliation par MemKeyPass
									</h3>
									<p className="text-gray-700">
										Nous nous réservons le droit de
										suspendre ou supprimer votre compte en
										cas de :
									</p>
									<ul className="list-disc list-inside space-y-1 text-gray-700 ml-4 mt-2">
										<li>Violation des présentes CGU</li>
										<li>
											Activité frauduleuse ou illégale
										</li>
										<li>
											Inactivité prolongée (plus de 24
											mois)
										</li>
										<li>Non-paiement (si applicable)</li>
									</ul>
								</div>
							</div>
						</section>

						{/* Données personnelles */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Shield className="w-5 h-5 text-indigo-600" />
								9. Protection des données personnelles
							</h2>
							<p className="text-gray-700">
								Le traitement de vos données personnelles est
								régi par notre{" "}
								<a
									href="/legal/politique-confidentialite"
									className="text-indigo-600 hover:text-indigo-700 underline font-medium"
								>
									Politique de Confidentialité
								</a>{" "}
								conforme au RGPD.
							</p>
						</section>

						{/* Modifications */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								10. Modifications des CGU
							</h2>
							<p className="text-gray-700">
								Nous nous réservons le droit de modifier les
								présentes CGU à tout moment. Les modifications
								importantes vous seront notifiées par email 15
								jours avant leur entrée en vigueur.
								L&apos;utilisation continue du service après
								modification vaut acceptation des nouvelles
								conditions.
							</p>
						</section>

						{/* Droit applicable */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								11. Droit applicable et juridiction
							</h2>
							<p className="text-gray-700 mb-3">
								Les présentes CGU sont régies par le droit
								français.
							</p>
							<p className="text-gray-700">
								En cas de litige, les parties s&apos;efforceront
								de trouver une solution amiable. À défaut, les
								tribunaux français seront seuls compétents.
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								12. Contact
							</h2>
							<p className="text-gray-700 mb-2">
								Pour toute question concernant ces CGU :
							</p>
							<ul className="space-y-1 text-gray-700">
								<li>
									• Email :{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										mattbuchs25@gmail.com
									</a>
								</li>
								<li>
									• Formulaire de contact :{" "}
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
								Acceptation des conditions
							</h3>
							<p className="text-gray-700">
								En créant un compte MemKeyPass, vous
								reconnaissez avoir lu, compris et accepté
								l&apos;intégralité des présentes Conditions
								Générales d&apos;Utilisation ainsi que la
								Politique de Confidentialité.
							</p>
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
