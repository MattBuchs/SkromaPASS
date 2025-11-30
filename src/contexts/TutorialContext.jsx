"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";

const TutorialContext = createContext();

export function TutorialProvider({ children }) {
    const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // true par défaut pour éviter le flash
    const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
    const [isTutorialActive, setIsTutorialActive] = useState(false);

    useEffect(() => {
        // Récupérer l'état du tutoriel depuis la BDD
        const fetchTutorialStatus = async () => {
            try {
                const response = await fetch("/api/user/tutorial");
                if (response.ok) {
                    const data = await response.json();
                    setHasSeenTutorial(data.hasSeenTutorial);
                }
            } catch (error) {
                console.error(
                    "Erreur lors de la récupération du statut du tutoriel:",
                    error
                );
            }
        };
        fetchTutorialStatus();
    }, []);

    const markTutorialAsSeen = useCallback(async () => {
        try {
            const response = await fetch("/api/user/tutorial", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hasSeenTutorial: true }),
            });
            if (response.ok) {
                setHasSeenTutorial(true);
                setIsTutorialActive(false);
            }
        } catch (error) {
            console.error(
                "Erreur lors de la mise à jour du statut du tutoriel:",
                error
            );
        }
    }, []);

    const resetTutorial = useCallback(async () => {
        try {
            const response = await fetch("/api/user/tutorial", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ hasSeenTutorial: false }),
            });
            if (response.ok) {
                setHasSeenTutorial(false);
                setCurrentTutorialStep(0);
            }
        } catch (error) {
            console.error(
                "Erreur lors de la réinitialisation du tutoriel:",
                error
            );
        }
    }, []);

    const startTutorial = useCallback(() => {
        setIsTutorialActive(true);
        setCurrentTutorialStep(0);
    }, []);

    return (
        <TutorialContext.Provider
            value={{
                hasSeenTutorial,
                markTutorialAsSeen,
                resetTutorial,
                currentTutorialStep,
                setCurrentTutorialStep,
                isTutorialActive,
                startTutorial,
                setIsTutorialActive,
            }}
        >
            {children}
        </TutorialContext.Provider>
    );
}

export function useTutorial() {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error("useTutorial must be used within a TutorialProvider");
    }
    return context;
}
