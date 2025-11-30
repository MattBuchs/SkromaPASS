"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTutorial } from "@/contexts/TutorialContext";
import TutorialTour from "./TutorialTour";
import { tutorialSteps } from "@/lib/tutorial-steps";

export default function GlobalTutorial() {
    const router = useRouter();
    const pathname = usePathname();
    const {
        hasSeenTutorial,
        isTutorialActive,
        currentTutorialStep,
        setCurrentTutorialStep,
        markTutorialAsSeen,
        startTutorial,
        setIsTutorialActive,
    } = useTutorial();

    // Démarrer le tutoriel automatiquement sur le dashboard si jamais vu (uniquement sur écrans >= 1024x600)
    useEffect(() => {
        const isScreenTooSmall =
            window.innerWidth < 1024 || window.innerHeight < 600;
        if (
            !hasSeenTutorial &&
            !isTutorialActive &&
            pathname === "/dashboard" &&
            !isScreenTooSmall
        ) {
            const timer = setTimeout(() => {
                startTutorial();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial, isTutorialActive, pathname, startTutorial]);

    // Filtrer les étapes pour la page actuelle
    const currentPageSteps = tutorialSteps.filter(
        (step) => step.page === pathname
    );

    // Trouver l'étape actuelle globale
    const currentGlobalStep = tutorialSteps[currentTutorialStep];

    // Trouver l'index de cette étape dans les étapes de la page actuelle
    const currentPageStepIndex = currentPageSteps.findIndex(
        (step) => step === currentGlobalStep
    );

    console.log("GlobalTutorial Debug:", {
        pathname,
        currentTutorialStep,
        currentPageSteps: currentPageSteps.map((s) => s.target),
        currentGlobalStep: currentGlobalStep?.target,
        currentPageStepIndex,
    });

    const handleNavigate = (path, stepIndex) => {
        setCurrentTutorialStep(stepIndex);
        // Si on navigue vers settings, forcer l'onglet sécurité
        if (path === "/settings") {
            router.push("/settings?tab=security");
        } else {
            router.push(path);
        }
    };

    const handleComplete = () => {
        markTutorialAsSeen();
        setIsTutorialActive(false);
    };

    const handleSkip = () => {
        markTutorialAsSeen();
        setIsTutorialActive(false);
    };

    // Ne pas afficher sur les écrans trop petits (< 1024x600)
    const isScreenTooSmall =
        typeof window !== "undefined" &&
        (window.innerWidth < 1024 || window.innerHeight < 600);

    // Ne rien afficher si le tutoriel n'est pas actif ou si on n'est pas sur une page du tutoriel
    if (
        !isTutorialActive ||
        currentPageSteps.length === 0 ||
        isScreenTooSmall
    ) {
        return null;
    }

    // Afficher seulement si on est sur la bonne page
    const currentStep = tutorialSteps[currentTutorialStep];
    if (!currentStep || currentStep.page !== pathname) {
        return null;
    }

    return (
        <TutorialTour
            steps={currentPageSteps}
            currentStepIndexOverride={
                currentPageStepIndex >= 0 ? currentPageStepIndex : 0
            }
            totalSteps={tutorialSteps.length}
            globalStepIndex={currentTutorialStep}
            onComplete={handleComplete}
            onSkip={handleSkip}
            onNavigate={handleNavigate}
            onStepChange={(localIndex) => {
                // Convertir l'index local en index global
                const stepToFind = currentPageSteps[localIndex];
                const globalIndex = tutorialSteps.indexOf(stepToFind);

                console.log("onStepChange called:", {
                    localIndex,
                    stepToFind: stepToFind?.target,
                    globalIndex,
                    currentTutorialStep,
                });

                if (globalIndex !== -1) {
                    setCurrentTutorialStep(globalIndex);
                }
            }}
        />
    );
}
