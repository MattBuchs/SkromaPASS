"use client";

import Loading from "@/components/layout/Loading";
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
			return <Loading />;
		}

		// Afficher le message de connexion requise si non authentifié
		if (!isAuthenticated) {
			return <AuthRequired />;
		}

		// Afficher le composant si authentifié
		return <Component {...props} />;
	};
}
