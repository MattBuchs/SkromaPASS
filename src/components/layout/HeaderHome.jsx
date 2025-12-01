"use client";

import { Lock } from "lucide-react";
import Link from "next/link";
import React from "react";
import Button from "../ui/Button";
import { useSession } from "next-auth/react";

export default function HeaderHome() {
    const { data: session } = useSession();
    const isAuthenticated = !!session;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
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
                    <div className="flex items-center sm:gap-2">
                        {isAuthenticated ? (
                            <Link href="/dashboard">
                                <Button variant="primary">Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button
                                        variant="ghost"
                                        className="text-sm sm:text-base"
                                    >
                                        Connexion
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        variant="primary"
                                        className="text-sm sm:text-base"
                                    >
                                        S&apos;inscrire
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
