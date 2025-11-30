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
        // Vérifier si l'utilisateur a déjà vu le tutoriel
        const seen = localStorage.getItem("hasSeenCompleteTutorial");
        setHasSeenTutorial(seen === "true");
    }, []);

    const markTutorialAsSeen = useCallback(() => {
        localStorage.setItem("hasSeenCompleteTutorial", "true");
        setHasSeenTutorial(true);
        setIsTutorialActive(false);
    }, []);

    const resetTutorial = useCallback(() => {
        localStorage.removeItem("hasSeenCompleteTutorial");
        setHasSeenTutorial(false);
        setCurrentTutorialStep(0);
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
