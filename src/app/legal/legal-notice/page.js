"use client";

import Footer from "@/components/layout/Footer";
import HeaderHome from "@/components/layout/HeaderHome";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Building2, Mail, Scale, User } from "lucide-react";

export default function MentionsLegalesPage() {
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
								<Scale className="w-6 h-6 text-white" />
							</div>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{isFr ? "Mentions Légales" : "Legal Notice"}
								</h1>
								<p className="text-gray-600 mt-1">
									{isFr
										? "Informations légales concernant SkromaPASS"
										: "Legal information about SkromaPASS"}
								</p>
							</div>
						</div>
					</div>

					{/* Contenu */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 space-y-8">
						{/* Éditeur du site */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Building2 className="w-5 h-5 text-indigo-600" />
								{isFr ? "Éditeur du site" : "Site Publisher"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr ? "Nom du site :" : "Site name:"}
									</strong>{" "}
									SkromaPASS
								</p>
								<p>
									<strong>
										{isFr ? "Propriétaire :" : "Owner:"}
									</strong>{" "}
									Buchs Matt
								</p>
								<p>
									<strong>
										{isFr
											? "Statut juridique :"
											: "Legal status:"}
									</strong>{" "}
									{isFr ? "Auto-entrepreneur" : "Sole trader"}
								</p>
								<p>
									<strong>
										{isFr
											? "Siège social :"
											: "Registered office:"}
									</strong>{" "}
									25300 Arçon, France
								</p>
								<p>
									<strong>SIRET :</strong> 939 480 224 00012
								</p>
								<p>
									<strong>
										{isFr ? "Email :" : "Email:"}
									</strong>{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										mattbuchs25@gmail.com
									</a>
								</p>
							</div>
						</section>

						{/* Directeur de publication */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<User className="w-5 h-5 text-indigo-600" />
								{isFr
									? "Directeur de publication"
									: "Publication Director"}
							</h2>
							<p className="text-gray-700">
								<strong>{isFr ? "Nom :" : "Name:"}</strong>{" "}
								Buchs Matt
							</p>
						</section>

						{/* Hébergement */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "Hébergement" : "Hosting"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr ? "Hébergeur :" : "Host:"}
									</strong>{" "}
									Vercel Inc.
								</p>
								<p>
									<strong>
										{isFr ? "Adresse :" : "Address:"}
									</strong>{" "}
									340 S Lemon Ave #4133, Walnut, CA 91789, USA
								</p>
								<p>
									<strong>
										{isFr ? "Site web :" : "Website:"}
									</strong>{" "}
									<a
										href="https://vercel.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										vercel.com
									</a>
								</p>
							</div>
						</section>

						{/* Base de données */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Hébergement de la base de données"
									: "Database Hosting"}
							</h2>
							<div className="space-y-2 text-gray-700">
								<p>
									<strong>
										{isFr ? "Hébergeur :" : "Host:"}
									</strong>{" "}
									Supabase Inc.
								</p>
								<p>
									<strong>
										{isFr ? "Adresse :" : "Address:"}
									</strong>{" "}
									970 Toa Payoh North, #07-04, Singapore
									318992
								</p>
								<p>
									<strong>
										{isFr ? "Site web :" : "Website:"}
									</strong>{" "}
									<a
										href="https://supabase.com"
										target="_blank"
										rel="noopener noreferrer"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										supabase.com
									</a>
								</p>
								<p className="text-sm text-gray-600 mt-2">
									{isFr
										? "Les données sont hébergées dans la région EU-WEST-1 (Irlande) et sont conformes au RGPD."
										: "Data is hosted in the EU-WEST-1 region (Ireland) and complies with GDPR."}
								</p>
							</div>
						</section>

						{/* Propriété intellectuelle */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Propriété intellectuelle"
									: "Intellectual Property"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "L\u2019ensemble du contenu de ce site (textes, images, vidéos, logos, icônes) est la propriété exclusive de SkromaPASS, sauf mention contraire."
									: "All content on this site (texts, images, videos, logos, icons) is the exclusive property of SkromaPASS, unless otherwise stated."}
							</p>
							<p className="text-gray-700">
								{isFr
									? "Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf autorisation écrite préalable."
									: "Any reproduction, representation, modification, publication or adaptation of all or part of the elements of the site, regardless of the means or process used, is prohibited without prior written authorisation."}
							</p>
						</section>

						{/* Données personnelles */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr
									? "Protection des données personnelles"
									: "Personal Data Protection"}
							</h2>
							<p className="text-gray-700 mb-3">
								{isFr
									? "SkromaPASS s\u2019engage à respecter la confidentialité de vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD)."
									: "SkromaPASS is committed to respecting the confidentiality of your personal data in accordance with the General Data Protection Regulation (GDPR)."}
							</p>
							<p className="text-gray-700">
								{isFr
									? "Pour en savoir plus, consultez notre"
									: "To find out more, please read our"}{" "}
								<a
									href="/legal/privacy-policy"
									className="text-indigo-600 hover:text-indigo-700 underline font-medium"
								>
									{isFr
										? "Politique de confidentialité"
										: "Privacy Policy"}
								</a>
								.
							</p>
						</section>

						{/* Cookies */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								{isFr ? "Cookies" : "Cookies"}
							</h2>
							<p className="text-gray-700">
								{isFr
									? "Ce site utilise des cookies uniquement pour assurer son bon fonctionnement et améliorer votre expérience utilisateur. Pour plus d\u2019informations, consultez notre"
									: "This site uses cookies only to ensure its proper functioning and improve your user experience. For more information, please read our"}{" "}
								<a
									href="/legal/cookie-policy"
									className="text-indigo-600 hover:text-indigo-700 underline font-medium"
								>
									{isFr
										? "Politique de cookies"
										: "Cookie Policy"}
								</a>
								.
							</p>
						</section>

						{/* Contact */}
						<section>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
								<Mail className="w-5 h-5 text-indigo-600" />
								{isFr ? "Contact" : "Contact"}
							</h2>
							<p className="text-gray-700 mb-2">
								{isFr
									? "Pour toute question concernant ces mentions légales, vous pouvez nous contacter :"
									: "For any questions regarding these legal notices, you can contact us:"}
							</p>
							<ul className="space-y-1 text-gray-700">
								<li>
									{isFr ? "• Par email :" : "• By email:"}{" "}
									<a
										href="mailto:mattbuchs25@gmail.com"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										mattbuchs25@gmail.com
									</a>
								</li>
								<li>
									{isFr ? "• Via notre" : "• Via our"}{" "}
									<a
										href="/contact"
										className="text-indigo-600 hover:text-indigo-700 underline"
									>
										{isFr
											? "formulaire de contact"
											: "contact form"}
									</a>
								</li>
							</ul>
						</section>

						{/* Dernière mise à jour */}
						<div className="pt-6 border-t border-gray-200">
							<p className="text-sm text-gray-500">
								Dernière mise à jour : 30 novembre 2025
							</p>
						</div>
					</div>
				</div>
			</div>

			<Footer />
		</div>
	);
}
