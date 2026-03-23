"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Button from "../ui/Button";
import Logo from "./Logo";

export default function HeaderHome() {
	const { data: session } = useSession();
	const isAuthenticated = !!session;
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { t, locale, toggleLocale } = useLanguage();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Logo url="/" titleSize="text-xl sm:text-2xl" />

					{/* Navigation desktop */}
					<div className="hidden sm:flex items-center gap-2">
						{isAuthenticated ? (
							<>
								<Link href="/generator">
									<Button variant="ghost" className="px-2!">
										{t("headerHome.generator")}
									</Button>
								</Link>
								<Link href="/contact">
									<Button variant="ghost" className="pl-2!">
										{t("headerHome.contact")}
									</Button>
								</Link>
								<Link href="/dashboard">
									<Button variant="primary">
										{t("headerHome.dashboard")}
									</Button>
								</Link>
							</>
						) : (
							<>
								<Link href="/generator">
									<Button variant="ghost" className="px-2!">
										{t("headerHome.generator")}
									</Button>
								</Link>
								<Link href="/contact">
									<Button variant="ghost" className="px-2!">
										{t("headerHome.contact")}
									</Button>
								</Link>
								<Link href="/login">
									<Button variant="ghost" className="pl-2!">
										{t("headerHome.login")}
									</Button>
								</Link>
								<Link href="/register">
									<Button variant="primary">
										{t("headerHome.register")}
									</Button>
								</Link>
							</>
						)}
						<button
							onClick={toggleLocale}
							aria-label="Switch language"
							className="text-xs font-semibold px-2 py-1 rounded-md border border-teal-600 text-teal-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer absolute right-3 -bottom-10"
						>
							{locale === "fr" ? "FR" : "EN"}
						</button>
					</div>

					{/* Bouton hamburger mobile */}
					<div className="flex items-center gap-1 sm:hidden">
						<button
							onClick={toggleLocale}
							aria-label="Switch language"
							className="text-xs font-semibold px-2 py-1 rounded-md border border-teal-600 text-teal-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
						>
							{locale === "fr" ? "FR" : "EN"}
						</button>
						<button
							className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
							onClick={() => setIsMenuOpen((v) => !v)}
							aria-label={
								isMenuOpen
									? t("headerHome.closeMenu")
									: t("headerHome.openMenu")
							}
							aria-expanded={isMenuOpen}
						>
							{isMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Menu mobile deroulant */}
			{isMenuOpen && (
				<div className="sm:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md shadow-lg">
					<div className="container mx-auto px-4 py-3 flex flex-col gap-1">
						{isAuthenticated ? (
							<>
								<Link
									href="/generator"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										{t("headerHome.generator")}
									</Button>
								</Link>
								<Link
									href="/contact"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										{t("headerHome.contact")}
									</Button>
								</Link>
								<div className="pt-2 pb-1">
									<Link
										href="/dashboard"
										onClick={() => setIsMenuOpen(false)}
									>
										<Button
											variant="primary"
											className="w-full"
										>
											{t("headerHome.dashboard")}
										</Button>
									</Link>
								</div>
							</>
						) : (
							<>
								<Link
									href="/generator"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										{t("headerHome.generator")}
									</Button>
								</Link>
								<Link
									href="/contact"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										{t("headerHome.contact")}
									</Button>
								</Link>
								<Link
									href="/login"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button
										variant="ghost"
										className="w-full justify-start"
									>
										{t("headerHome.login")}
									</Button>
								</Link>
								<div className="pt-2 pb-1">
									<Link
										href="/register"
										onClick={() => setIsMenuOpen(false)}
									>
										<Button
											variant="primary"
											className="w-full"
										>
											{t("headerHome.register")}
										</Button>
									</Link>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
