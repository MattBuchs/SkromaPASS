"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import LockIcon from "../icons/Lock";

export default function Header({ onToggleSidebar, menuDispayed = true }) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user } = useAuth();

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
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] shadow-sm">
            <div className="flex items-center justify-between h-full px-4 md:px-6">
                {/* Menu Hamburger (Mobile) */}
                {menuDispayed && (
                    <button
                        onClick={onToggleSidebar}
                        className="lg:hidden p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
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
                <div className="flex-1 flex justify-center lg:justify-start lg:ml-0">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 group"
                    >
                        <div className="hidden lg:flex bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-md shadow-md group-hover:shadow-lg transition-all duration-200">
                            <LockIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-[rgb(var(--color-text-primary))] group-hover:text-teal-600 transition-colors">
                            MemKeyPass
                        </span>
                    </Link>
                </div>

                {/* Actions */}
                {menuDispayed && (
                    <div className="flex items-center gap-2 md:gap-3">
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
                                        href="/settings"
                                        className="block px-4 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] transition-colors"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        Paramètres
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[rgb(var(--color-background))] transition-colors cursor-pointer"
                                    >
                                        Se déconnecter
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
