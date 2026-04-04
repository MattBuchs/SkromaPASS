"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function HeaderHome() {
	const { data: session } = useSession();
	const isAuthenticated = !!session;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const { t, locale, toggleLocale } = useLanguage();

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 32);
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 animate-header-slide-in transition-all duration-500 ${
				scrolled
					? "bg-[#020617]/90 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40"
					: "bg-transparent"
			}`}
		>
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Logo
						url="/"
						titleSize="text-xl sm:text-2xl"
						textColor="text-white"
					/>

					{/* Desktop nav */}
					<nav className="hidden md:flex items-center gap-1">
						<Link
							href="/password-generator"
							className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
						>
							{t("headerHome.generator")}
						</Link>
						<Link
							href="/contact"
							className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
						>
							{t("headerHome.contact")}
						</Link>

						<div className="w-px h-4 bg-white/10 mx-2" />

						{/* Lang switcher */}
						<button
							onClick={toggleLocale}
							aria-label="Switch language"
							className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border border-white/12 hover:border-teal-500/40 hover:bg-teal-500/8 transition-all duration-300 cursor-pointer"
						>
							<span
								className={`transition-colors duration-200 ${locale === "fr" ? "text-white" : "text-gray-600"}`}
							>
								FR
							</span>
							<span className="text-white/20">|</span>
							<span
								className={`transition-colors duration-200 ${locale === "en" ? "text-white" : "text-gray-600"}`}
							>
								EN
							</span>
						</button>

						<div className="w-px h-4 bg-white/10 mx-2" />

						{isAuthenticated ? (
							<Link
								href="/dashboard"
								className="inline-flex items-center bg-linear-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
							>
								{t("headerHome.dashboard")}
							</Link>
						) : (
							<>
								<Link
									href="/login"
									className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200"
								>
									{t("headerHome.login")}
								</Link>
								<Link
									href="/register"
									className="inline-flex items-center bg-linear-to-r from-teal-500 to-cyan-500 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-md shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
								>
									{t("headerHome.register")}
								</Link>
							</>
						)}
					</nav>

					{/* Mobile actions */}
					<div className="flex items-center gap-2 md:hidden">
						<button
							onClick={toggleLocale}
							aria-label="Switch language"
							className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-full border border-white/12 hover:border-teal-500/40 transition-all duration-300 cursor-pointer"
						>
							<span
								className={
									locale === "fr"
										? "text-white"
										: "text-gray-600"
								}
							>
								FR
							</span>
							<span className="text-white/20">|</span>
							<span
								className={
									locale === "en"
										? "text-white"
										: "text-gray-600"
								}
							>
								EN
							</span>
						</button>
						<button
							className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/8 transition-all cursor-pointer"
							onClick={() => setIsMenuOpen((v) => !v)}
							aria-label={
								isMenuOpen
									? t("headerHome.closeMenu")
									: t("headerHome.openMenu")
							}
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? (
								<X className="w-5 h-5" />
							) : (
								<Menu className="w-5 h-5" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMenuOpen && (
				<div className="sm:hidden border-t border-white/8 bg-[#020617]/98 backdrop-blur-2xl animate-slide-down">
					<div className="container mx-auto px-4 py-4 flex flex-col gap-1">
						<Link
							href="/password-generator"
							onClick={() => setIsMenuOpen(false)}
							className="text-gray-400 hover:text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
						>
							{t("headerHome.generator")}
						</Link>
						<Link
							href="/contact"
							onClick={() => setIsMenuOpen(false)}
							className="text-gray-400 hover:text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-white/5 transition-all"
						>
							{t("headerHome.contact")}
						</Link>
						<div className="h-px bg-white/8 my-2" />
						{isAuthenticated ? (
							<Link
								href="/dashboard"
								onClick={() => setIsMenuOpen(false)}
								className="flex justify-center items-center bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md shadow-teal-500/20 hover:opacity-90 transition-opacity"
							>
								{t("headerHome.dashboard")}
							</Link>
						) : (
							<>
								<Link
									href="/login"
									onClick={() => setIsMenuOpen(false)}
									className="text-gray-400 hover:text-white text-sm font-medium px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-center"
								>
									{t("headerHome.login")}
								</Link>
								<Link
									href="/register"
									onClick={() => setIsMenuOpen(false)}
									className="flex justify-center items-center bg-linear-to-r from-teal-500 to-cyan-500 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-md shadow-teal-500/20 hover:opacity-90 transition-opacity"
								>
									{t("headerHome.register")}
								</Link>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
