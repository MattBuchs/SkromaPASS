"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function Footer() {
	const { t } = useLanguage();
	return (
		<footer className="mt-16 py-8 px-4 border-t border-gray-200 bg-gray-50">
			<div className="max-w-7xl mx-auto">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
					{/* Navigation */}
					<div>
						<h4 className="font-semibold text-gray-900 text-sm mb-3">
							{t("footer.navigation")}
						</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="/dashboard"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/generator"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.generator")}
								</Link>
							</li>
							<li>
								<Link
									href="/security"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.security")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Support */}
					<div>
						<h4 className="font-semibold text-gray-900 text-sm mb-3">
							{t("footer.support")}
						</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="/contact"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									Contact
								</Link>
							</li>
							<li>
								<Link
									href="/settings"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.settings")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<h4 className="font-semibold text-gray-900 text-sm mb-3">
							{t("footer.legal")}
						</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="/legal/mentions-legales"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.legalNotice")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/politique-confidentialite"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.privacy")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/cgu"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.terms")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Security */}
					<div>
						<h4 className="font-semibold text-gray-900 text-sm mb-3">
							{t("footer.security")}
						</h4>
						<ul className="space-y-2">
							<li>
								<Link
									href="/legal/politique-cookies"
									className="text-xs text-gray-600 hover:text-indigo-600 transition-colors"
								>
									{t("footer.cookies")}
								</Link>
							</li>
							<li className="text-xs text-gray-600">
								🔒 {t("footer.encryption")}
							</li>
							<li className="text-xs text-gray-600">
								🇪🇺 {t("footer.gdpr")}
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright */}
				<div className="pt-6 border-t border-gray-200 text-center">
					<p className="text-xs text-gray-500">
						© {new Date().getFullYear()} MemKeyPass.{" "}
						{t("footer.copyright")}
					</p>
				</div>
			</div>
		</footer>
	);
}
