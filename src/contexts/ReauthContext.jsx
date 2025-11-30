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
    // État indiquant si l'utilisateur est récemment authentifié
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Liste des callbacks à appeler quand l'authentification expire
    const expirationCallbacksRef = useRef([]);
    // Référence au timer de vérification
    const checkTimerRef = useRef(null);

    // Vérifier périodiquement la validité du token côté serveur
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch("/api/auth/reauth-token", {
                    credentials: "include",
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.valid) {
                        setIsAuthenticated(true);
                        return;
                    }
                }

                // Token invalide ou expiré
                if (isAuthenticated) {
                    setIsAuthenticated(false);
                    // Appeler les callbacks d'expiration
                    expirationCallbacksRef.current.forEach((callback) => {
                        try {
                            callback();
                        } catch (error) {
                            if (process.env.NODE_ENV === "development") {
                                console.error(
                                    "Erreur lors de l'appel du callback d'expiration:",
                                    error
                                );
                            }
                        }
                    });
                }
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Erreur vérification auth:", error);
                }
            }
        };

        // Vérifier immédiatement au montage
        checkAuthStatus();

        // Vérifier toutes les 30 secondes
        checkTimerRef.current = setInterval(checkAuthStatus, 30000);

        // Nettoyage au démontage
        return () => {
            if (checkTimerRef.current) {
                clearInterval(checkTimerRef.current);
            }
        };
    }, [isAuthenticated]);

    /**
     * Vérifie si l'utilisateur est authentifié récemment
     */
    const isRecentlyAuthenticated = useCallback(() => {
        return isAuthenticated;
    }, [isAuthenticated]);

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

    /**
     * Obtient le temps restant avant expiration (approximatif)
     */
    const getTimeRemaining = useCallback(() => {
        // Cette fonction est maintenant approximative car le temps est géré côté serveur
        // Retourner une valeur fixe pour la compatibilité
        return isAuthenticated ? 15 * 60 : 0; // 15 minutes si authentifié
    }, [isAuthenticated]);

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
