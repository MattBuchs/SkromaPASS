"use client";

import { useAuth } from "@/hooks/useAuth";
import AuthRequired from "./AuthRequired";

/**
 * Composant HOC pour protéger les pages côté client
 * Affiche un message de connexion requise si l'utilisateur n'est pas authentifié
 */
export function withAuthProtection(Component) {
    return function ProtectedRoute(props) {
        const { isAuthenticated, isLoading } = useAuth();

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

        // Afficher le message de connexion requise si non authentifié
        if (!isAuthenticated) {
            return <AuthRequired />;
        }

        // Afficher le composant si authentifié
        return <Component {...props} />;
    };
}
