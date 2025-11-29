"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ReauthContext = createContext();

export function ReauthProvider({ children }) {
    // Timestamp de la dernière authentification réussie
    const [lastAuthTime, setLastAuthTime] = useState(null);

    // Durée de validité de la session de réauthentification (5 minutes)
    const AUTH_VALIDITY_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

    /**
     * Vérifie si l'utilisateur est authentifié récemment
     */
    const isRecentlyAuthenticated = useCallback(() => {
        if (!lastAuthTime) return false;

        const now = Date.now();
        const timeSinceAuth = now - lastAuthTime;

        return timeSinceAuth < AUTH_VALIDITY_DURATION;
    }, [lastAuthTime]);

    /**
     * Marque l'utilisateur comme authentifié
     */
    const markAsAuthenticated = useCallback(() => {
        setLastAuthTime(Date.now());
    }, []);

    /**
     * Réinitialise l'état d'authentification
     */
    const resetAuthentication = useCallback(() => {
        setLastAuthTime(null);
    }, []);

    /**
     * Obtient le temps restant avant expiration (en secondes)
     */
    const getTimeRemaining = useCallback(() => {
        if (!lastAuthTime) return 0;

        const now = Date.now();
        const timeSinceAuth = now - lastAuthTime;
        const remaining = AUTH_VALIDITY_DURATION - timeSinceAuth;

        return Math.max(0, Math.floor(remaining / 1000));
    }, [lastAuthTime]);

    const value = {
        isRecentlyAuthenticated,
        markAsAuthenticated,
        resetAuthentication,
        getTimeRemaining,
        lastAuthTime,
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
