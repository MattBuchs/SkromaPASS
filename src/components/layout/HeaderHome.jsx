"use client";

import { Lock, Menu, X } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import Button from "../ui/Button";
import { useSession } from "next-auth/react";

export default function HeaderHome() {
    const { data: session } = useSession();
    const isAuthenticated = !!session;
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-lg hidden sm:block">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <Link
                            href="/"
                            className="text-xl sm:text-2xl font-bold text-gray-900"
                        >
                            MemKeyPass
                        </Link>
                    </div>

                    {/* Navigation desktop */}
                    <div className="hidden sm:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                <Link href="/generator">
                                    <Button variant="ghost">Générateur</Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="ghost">Contact</Button>
                                </Link>
                                <Link href="/dashboard">
                                    <Button variant="primary">Dashboard</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/generator">
                                    <Button variant="ghost">Générateur</Button>
                                </Link>
                                <Link href="/contact">
                                    <Button variant="ghost">Contact</Button>
                                </Link>
                                <Link href="/login">
                                    <Button variant="ghost">Connexion</Button>
                                </Link>
                                <Link href="/register">
                                    <Button variant="primary">
                                        S&apos;inscrire
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Bouton hamburger mobile */}
                    <button
                        className="sm:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setIsMenuOpen((v) => !v)}
                        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
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

            {/* Menu mobile déroulant */}
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
                                        Générateur
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
                                        Contact
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
                                            Dashboard
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
                                        Générateur
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
                                        Contact
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
                                        Connexion
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
                                            S&apos;inscrire
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
