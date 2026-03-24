"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
	const { t } = useLanguage();
	return (
		<footer className="py-12 px-4 border-t border-gray-200 bg-gray-50">
			<div className="container mx-auto max-w-6xl">
				<div className="grid md:grid-cols-3 gap-8 mb-8">
					{/* About */}
					<div>
						<h3 className="font-semibold text-gray-900 mb-4">
							SkromaPASS
						</h3>
						<p className="text-sm text-gray-600 mb-4">
							{t("home.footerAboutDesc")}
						</p>
						<Logo width={36} height={36} titleSize={"text-base"} />
					</div>

					{/* Navigation */}
					<div>
						<h3 className="font-semibold text-gray-900 mb-4">
							{t("home.footerNavTitle")}
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/dashboard"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/password-generator"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("headerHome.generator")}
								</Link>
							</li>
							<li>
								<Link
									href="/security"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("nav.security")}
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("headerHome.contact")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h3 className="font-semibold text-gray-900 mb-4">
							{t("home.footerLegalTitle")}
						</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/legal/mentions-legales"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("home.legalNotice")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/politique-confidentialite"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("home.privacyPolicy")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/cgu"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("home.terms")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/politique-cookies"
									className="text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("home.cookiePolicy")}
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright */}
				<div className="pt-8 border-t border-gray-300 text-center">
					<p className="text-sm text-gray-600">
						© {new Date().getFullYear()} SkromaPASS.{" "}
						{t("home.copyright")}
					</p>
					<p className="text-xs text-gray-500 mt-2">
						{t("home.footerInfo")}
					</p>
				</div>
			</div>
		</footer>
	);
}
