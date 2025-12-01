"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";

const ReauthContext = createContext();

export function ReauthProvider({ children }) {
    // État indiquant si l'utilisateur est récemment authentifié
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Référence pour éviter les vérifications en double
    const isCheckingRef = useRef(false);

    /**
     * Vérifie le statut d'authentification auprès du serveur
     * Cette méthode est appelée à la demande, pas automatiquement
     */
    const checkAuthStatus = useCallback(async () => {
        // Éviter les vérifications simultanées
        if (isCheckingRef.current) return isAuthenticated;

        isCheckingRef.current = true;
        try {
            const response = await fetch("/api/auth/reauth-token", {
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                const valid = data.valid || false;
                setIsAuthenticated(valid);
                return valid;
            }

            setIsAuthenticated(false);
            return false;
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Erreur vérification auth:", error);
            }
            setIsAuthenticated(false);
            return false;
        } finally {
            isCheckingRef.current = false;
        }
    }, [isAuthenticated]);

    /**
     * Vérifie si l'utilisateur est authentifié récemment
     * Vérifie auprès du serveur et met à jour l'état
     */
    const isRecentlyAuthenticated = useCallback(async () => {
        return await checkAuthStatus();
    }, [checkAuthStatus]);

    /**
     * Marque l'utilisateur comme authentifié (génère un token serveur)
     */
    const markAsAuthenticated = useCallback(async () => {
        try {
            const response = await fetch("/api/auth/reauth-token", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                setIsAuthenticated(true);
                return true;
            }
            return false;
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Erreur markAsAuthenticated:", error);
            }
            return false;
        }
    }, []);

    /**
     * Réinitialise l'état d'authentification (supprime le token)
     */
    const resetAuthentication = useCallback(async () => {
        try {
            await fetch("/api/auth/reauth-token", {
                method: "DELETE",
                credentials: "include",
            });
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error("Erreur resetAuthentication:", error);
            }
        }
        setIsAuthenticated(false);
    }, []);

    const value = {
        isRecentlyAuthenticated,
        markAsAuthenticated,
        resetAuthentication,
        checkAuthStatus,
        isAuthenticated,
    };

    return (
        <ReauthContext.Provider value={value}>
            {children}
        </ReauthContext.Provider>
    );
}

export function useReauth() {
    const context = useContext(ReauthContext);

    if (!context) {
        throw new Error("useReauth must be used within a ReauthProvider");
    }

    return context;
}
