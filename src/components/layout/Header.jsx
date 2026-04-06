"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

export default function Header({ onToggleSidebar, menuDispayed = true }) {
	const [showUserMenu, setShowUserMenu] = useState(false);
	const { user, isAuthenticated } = useAuth();
	const { locale, toggleLocale, t } = useLanguage();
	const { theme, toggleTheme } = useTheme();

	const handleSignOut = async () => {
		await signOut({ callbackUrl: "/login" });
	};

	const getUserInitials = () => {
		if (!user?.name) return "U";
		return user.name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};
	return (
		<header
			className={`fixed top-0 left-0 right-0 z-50 h-16 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] shadow-sm ${theme === "dark" ? "dark" : ""}`}
		>
			<div className="flex items-center justify-between h-full px-4 md:px-6">
				{/* Menu Hamburger (Mobile) */}
				{menuDispayed && (
					<button
						onClick={onToggleSidebar}
						aria-label="Menu principal"
						className="lg:hidden p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors cursor-pointer"
					>
						<svg
							className="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>
				)}

				{/* Logo (Desktop) + Titre */}
				<div className="hidden lg:block">
					<Logo url="/" />
				</div>

				{/* Actions */}
				{menuDispayed && isAuthenticated && (
					<div className="flex items-center gap-2 md:gap-3">
						{/* Language toggle */}
						<button
							onClick={toggleLocale}
							aria-label="Switch language"
							className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-teal-500/40 hover:text-teal-600 hover:bg-teal-500/8 transition-all duration-200 cursor-pointer"
						>
							<span
								className={
									locale === "fr"
										? "text-[rgb(var(--color-text-primary))]"
										: "text-[rgb(var(--color-text-tertiary))]"
								}
							>
								FR
							</span>
							<span className="text-[rgb(var(--color-text-tertiary))]">
								|
							</span>
							<span
								className={
									locale === "en"
										? "text-[rgb(var(--color-text-primary))]"
										: "text-[rgb(var(--color-text-tertiary))]"
								}
							>
								EN
							</span>
						</button>

						{/* Theme toggle */}
						<button
							onClick={toggleTheme}
							aria-label="Toggle theme"
							className="p-1.5 rounded-full border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-secondary))] hover:border-teal-500/40 hover:text-teal-600 hover:bg-teal-500/8 transition-all duration-200 cursor-pointer"
						>
							{theme === "dark" ? (
								<Sun className="w-4 h-4" />
							) : (
								<Moon className="w-4 h-4" />
							)}
						</button>

						{/* User Avatar */}
						<div className="relative">
							<button
								onClick={() => setShowUserMenu(!showUserMenu)}
								className="w-10 h-10 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-all duration-200"
							>
								{getUserInitials()}
							</button>

							{/* User Menu Dropdown */}
							{showUserMenu && (
								<div className="absolute right-0 mt-2 w-48 bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-md shadow-lg py-1 z-50">
									<div className="px-4 py-2 border-b border-[rgb(var(--color-border))]">
										<p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
											{user?.name}
										</p>
										<p className="text-xs text-[rgb(var(--color-text-tertiary))] truncate">
											{user?.email}
										</p>
									</div>
									<Link
										href="/"
										className="block px-4 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] transition-colors"
										onClick={() => setShowUserMenu(false)}
									>
										{t("nav.home")}
									</Link>
									<Link
										href="/settings"
										className="block px-4 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] transition-colors"
										onClick={() => setShowUserMenu(false)}
									>
										{t("nav.settings")}
									</Link>
									<button
										onClick={handleSignOut}
										className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[rgb(var(--color-background))] transition-colors cursor-pointer"
									>
										{t("nav.signOut")}
									</button>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</header>
	);
}
