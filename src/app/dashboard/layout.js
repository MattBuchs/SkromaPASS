"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, user, router]);

    // Afficher un loader pendant la vérification
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    // Ne rien afficher si non authentifié (redirection en cours)
    if (!isAuthenticated) {
        return null;
    }

    // Afficher le contenu si authentifié
    return <>{children}</>;
}
