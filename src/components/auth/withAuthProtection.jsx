"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/**
 * Composant HOC pour protéger les pages côté client
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 */
export function withAuthProtection(Component) {
    return function ProtectedRoute(props) {
        const { isAuthenticated, isLoading } = useAuth();
        const router = useRouter();

        useEffect(() => {
            if (!isLoading && !isAuthenticated) {
                router.push("/login");
            }
        }, [isAuthenticated, isLoading, router]);

        // Afficher un loader pendant la vérification
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            );
        }

        // Ne rien afficher si non authentifié (la redirection est en cours)
        if (!isAuthenticated) {
            return null;
        }

        // Afficher le composant si authentifié
        return <Component {...props} />;
    };
}
