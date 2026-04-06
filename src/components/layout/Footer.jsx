"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
	const { t } = useLanguage();

	return (
		<footer className="force-dark bg-[#020617] border-t border-white/8 px-4 pt-16 pb-8">
			<div className="container mx-auto">
				{/* Main grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
					{/* Brand -- spans 2 cols on lg */}
					<div className="lg:col-span-2">
						<Logo
							url="/"
							titleSize="text-xl"
							textColor="text-white"
							width={36}
							height={36}
						/>
						<p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-xs">
							{t("footer.description")}
						</p>
						{/* Trust badges */}
						<div className="mt-5 flex flex-wrap gap-2">
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400/70 border border-teal-500/20 bg-teal-500/5 px-2.5 py-1 rounded-full">
								AES-256
							</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400/70 border border-teal-500/20 bg-teal-500/5 px-2.5 py-1 rounded-full">
								RGPD
							</span>
							<span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400/70 border border-teal-500/20 bg-teal-500/5 px-2.5 py-1 rounded-full">
								Zero-Knowledge
							</span>
						</div>
					</div>

					{/* Navigation */}
					<div>
						<p className="text-xs font-bold text-teal-400/70 uppercase tracking-widest mb-5">
							{t("footer.navigation")}
						</p>
						<ul className="flex flex-col gap-3">
							<li>
								<Link
									href="/register"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.register")}
								</Link>
							</li>
							<li>
								<Link
									href="/login"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.login")}
								</Link>
							</li>
							<li>
								<Link
									href="/password-generator"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.generator")}
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.contact")}
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div>
						<p className="text-xs font-bold text-teal-400/70 uppercase tracking-widest mb-5">
							{t("footer.legal")}
						</p>
						<ul className="flex flex-col gap-3">
							<li>
								<Link
									href="/legal/privacy-policy"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.privacy")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/legal-notice"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.legalNotice")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/terms-of-service"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.terms")}
								</Link>
							</li>
							<li>
								<Link
									href="/legal/cookie-policy"
									className="text-gray-400 hover:text-teal-400 text-sm transition-colors duration-200"
								>
									{t("footer.cookies")}
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
					<p className="text-gray-400 text-xs">
						{t("footer.copyright").replace(
							"{year}",
							new Date().getFullYear(),
						)}
					</p>
					<span className="text-xs text-gray-400 bg-white/4 border border-white/8 px-2.5 py-1 rounded-full">
						v2.0
					</span>
				</div>
			</div>
		</footer>
	);
}
