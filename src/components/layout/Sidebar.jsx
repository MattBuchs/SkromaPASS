"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LockIcon from "../icons/Lock";
import KeyIcon from "../icons/Key";
import FolderIcon from "../icons/Folder";
import ShieldIcon from "../icons/Shield";
import SettingsIcon from "../icons/Settings";

const navigation = [
    { name: "Tous les mots de passe", href: "/", icon: LockIcon },
    { name: "Générateur", href: "/generator", icon: KeyIcon },
    { name: "Dossiers", href: "/folders", icon: FolderIcon },
    { name: "Sécurité", href: "/security", icon: ShieldIcon },
    { name: "Paramètres", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-[rgb(var(--color-surface))] border-r border-[rgb(var(--color-border))] custom-scrollbar overflow-y-auto">
            <div className="p-4">
                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-[var(--radius-md)] transition-all duration-200 ${
                                    isActive
                                        ? "bg-[rgb(var(--color-primary))] text-white shadow-md"
                                        : "text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-background))] hover:text-[rgb(var(--color-text-primary))]"
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Stats Section */}
                <div className="mt-8 pt-6 border-t border-[rgb(var(--color-border))]">
                    <h3 className="px-4 text-xs font-semibold text-[rgb(var(--color-text-tertiary))] uppercase tracking-wider mb-3">
                        Statistiques
                    </h3>
                    <div className="space-y-3">
                        <div className="px-4 py-2 rounded-[var(--radius-md)] bg-[rgb(var(--color-background))]">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                    Mots de passe
                                </span>
                                <span className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                                    24
                                </span>
                            </div>
                        </div>
                        <div className="px-4 py-2 rounded-[var(--radius-md)] bg-[rgb(var(--color-background))]">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                                    Score de sécurité
                                </span>
                                <span className="text-lg font-semibold text-[rgb(var(--color-success))]">
                                    85%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-8 mx-4 p-4 rounded-[var(--radius-lg)] bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200">
                    <div className="flex items-center gap-2 mb-2">
                        <ShieldIcon className="w-5 h-5 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-900">
                            Sécurisé
                        </span>
                    </div>
                    <p className="text-xs text-teal-700">
                        Vos données sont chiffrées avec AES-256
                    </p>
                </div>
            </div>
        </aside>
    );
}
