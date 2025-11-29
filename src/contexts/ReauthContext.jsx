"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
} from "react";

const ReauthContext = createContext();

// Durée de validité de la session de réauthentification (1 minute)
const AUTH_VALIDITY_DURATION = 15 * 60 * 1000; // 15 minute en millisecondes

export function ReauthProvider({ children }) {
    // Timestamp de la dernière authentification réussie
    const [lastAuthTime, setLastAuthTime] = useState(null);
    // Liste des callbacks à appeler quand l'authentification expire (useRef pour éviter les closures)
    const expirationCallbacksRef = useRef([]);
    // Référence au timer d'expiration actuel
    const expirationTimerRef = useRef(null);

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
     * Marque l'utilisateur comme authentifié et démarre le timer d'expiration
     */
    const markAsAuthenticated = useCallback(() => {
        const now = Date.now();
        setLastAuthTime(now);

        // Nettoyer le timer précédent s'il existe
        if (expirationTimerRef.current) {
            clearTimeout(expirationTimerRef.current);
        }

        // Démarrer un nouveau timer pour appeler les callbacks d'expiration
        expirationTimerRef.current = setTimeout(() => {
            // Le temps d'expiration est atteint
            setLastAuthTime(null);
            // Appeler tous les callbacks enregistrés
            expirationCallbacksRef.current.forEach((callback) => {
                try {
                    callback();
                } catch (error) {
                    console.error(
                        "Erreur lors de l'appel du callback d'expiration:",
                        error
                    );
                }
            });
        }, AUTH_VALIDITY_DURATION);
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

    /**
     * Enregistre un callback à appeler lors de l'expiration
     */
    const onExpire = useCallback((callback) => {
        expirationCallbacksRef.current.push(callback);

        // Retourner une fonction de nettoyage
        return () => {
            expirationCallbacksRef.current =
                expirationCallbacksRef.current.filter((cb) => cb !== callback);
        };
    }, []);

    const value = {
        isRecentlyAuthenticated,
        markAsAuthenticated,
        resetAuthentication,
        getTimeRemaining,
        onExpire,
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
