"use client";

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from "react";

const ReauthContext = createContext();

// Durée de validité de la session de réauthentification (1 minute)
const AUTH_VALIDITY_DURATION = 15 * 60 * 1000; // 15 minute en millisecondes

export function ReauthProvider({ children }) {
    // Timestamp de la dernière authentification réussie
    const [lastAuthTime, setLastAuthTime] = useState(() => {
        // Récupérer depuis localStorage au chargement
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("reauth_timestamp");
            if (stored) {
                const timestamp = parseInt(stored, 10);
                const now = Date.now();
                // Vérifier que le timestamp est toujours valide (< 15 minutes)
                if (now - timestamp < AUTH_VALIDITY_DURATION) {
                    return timestamp;
                }
            }
        }
        return null;
    });
    // Liste des callbacks à appeler quand l'authentification expire (useRef pour éviter les closures)
    const expirationCallbacksRef = useRef([]);
    // Référence au timer d'expiration actuel
    const expirationTimerRef = useRef(null);

    // Sauvegarder lastAuthTime dans localStorage et configurer le timer
    useEffect(() => {
        if (lastAuthTime) {
            // Sauvegarder dans localStorage
            localStorage.setItem("reauth_timestamp", lastAuthTime.toString());

            // Calculer le temps restant
            const now = Date.now();
            const elapsed = now - lastAuthTime;
            const remaining = AUTH_VALIDITY_DURATION - elapsed;

            if (remaining > 0) {
                // Nettoyer le timer précédent
                if (expirationTimerRef.current) {
                    clearTimeout(expirationTimerRef.current);
                }

                // Démarrer un timer pour le temps restant
                expirationTimerRef.current = setTimeout(() => {
                    setLastAuthTime(null);
                    localStorage.removeItem("reauth_timestamp");
                    // Appeler les callbacks d'expiration
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
                }, remaining);
            } else {
                // Le temps est déjà expiré
                setLastAuthTime(null);
                localStorage.removeItem("reauth_timestamp");
            }
        } else {
            // Supprimer de localStorage si null
            localStorage.removeItem("reauth_timestamp");
        }

        // Nettoyage au démontage
        return () => {
            if (expirationTimerRef.current) {
                clearTimeout(expirationTimerRef.current);
            }
        };
    }, [lastAuthTime]);

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
        // Le reste (sauvegarde localStorage et timer) est géré par useEffect
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
