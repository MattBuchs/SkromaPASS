"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAuth } from "@/hooks/useAuth";
import LockIcon from "../icons/Lock";
import SearchIcon from "../icons/Search";
import PlusIcon from "../icons/Plus";
import Button from "../ui/Button";

export default function Header({ onAddPassword, onToggleSidebar }) {
    const [showSearch, setShowSearch] = useState(false);
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

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-md shadow-md group-hover:shadow-lg transition-all duration-200">
                        <LockIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-lg md:text-xl font-bold text-[rgb(var(--color-text-primary))]">
                        MemKeyPass
                    </span>
                </Link>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
                    <div className="relative w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                        <input
                            type="text"
                            placeholder="Rechercher un mot de passe..."
                            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-md text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {/* Search Icon (Mobile) */}
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="md:hidden p-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
                    >
                        <SearchIcon className="w-5 h-5" />
                    </button>

                    <Button
                        variant="primary"
                        className="flex items-center gap-2"
                        onClick={onAddPassword}
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Ajouter</span>
                    </Button>

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
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-[rgb(var(--color-background))] transition-colors"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Search Bar */}
            {showSearch && (
                <div className="md:hidden px-4 pb-4 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))]">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-md text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
