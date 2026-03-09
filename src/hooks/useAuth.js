"use client";

import { useSession } from "next-auth/react";
import { useRef } from "react";

export function useAuth() {
	const { data: session, status } = useSession();
	const previousUserRef = useRef(null);

	// Conserver les données utilisateur précédentes pendant les rechargements
	// de session (ex: changement d'onglet) pour éviter les flashs de contenu vide
	if (session?.user) {
		previousUserRef.current = session.user;
	}

	const user =
		session?.user ||
		(status === "loading" ? previousUserRef.current : null);

	return {
		user,
		isAuthenticated: status === "authenticated",
		isLoading: status === "loading" && !previousUserRef.current,
		status,
	};
}
