"use client";

import Link from "next/link";
import LockIcon from "../icons/Lock";
import SearchIcon from "../icons/Search";
import PlusIcon from "../icons/Plus";
import Button from "../ui/Button";

export default function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[rgb(var(--color-surface))] border-b border-[rgb(var(--color-border))] shadow-sm">
            <div className="flex items-center justify-between h-full px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-[var(--radius-md)] shadow-md group-hover:shadow-lg transition-all duration-200">
                        <LockIcon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                        MemKeyPass
                    </span>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-8">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--color-text-tertiary))]" />
                        <input
                            type="text"
                            placeholder="Rechercher un mot de passe..."
                            className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--color-background))] border border-[rgb(var(--color-border))] rounded-[var(--radius-md)] text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-5 h-5" />
                        <span>Ajouter</span>
                    </Button>

                    {/* User Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg transition-all duration-200">
                        U
                    </div>
                </div>
            </div>
        </header>
    );
}
