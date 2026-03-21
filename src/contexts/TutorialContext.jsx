"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";

const TutorialContext = createContext();

const CACHE_KEY = "mkp_tutorial_";
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 jours

function getCachedTutorial(email) {
	try {
		const raw = localStorage.getItem(CACHE_KEY + email);
		if (!raw) return null;
		const { value, cachedAt } = JSON.parse(raw);
		if (Date.now() - cachedAt > CACHE_TTL) {
			localStorage.removeItem(CACHE_KEY + email);
			return null;
		}
		return value;
	} catch {
		return null;
	}
}

function setCachedTutorial(email, value) {
	try {
		localStorage.setItem(
			CACHE_KEY + email,
			JSON.stringify({ value, cachedAt: Date.now() }),
		);
	} catch {}
}

function clearCachedTutorial(email) {
	try {
		localStorage.removeItem(CACHE_KEY + email);
	} catch {}
}

export function TutorialProvider({ children }) {
	const { data: session, status } = useSession();
	const email = session?.user?.email ?? null;
	const [hasSeenTutorial, setHasSeenTutorial] = useState(true); // true par défaut pour éviter le flash
	const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
	const [isTutorialActive, setIsTutorialActive] = useState(false);

	useEffect(() => {
		// Ne récupérer l'état du tutoriel que si l'utilisateur est connecté
		if (status !== "authenticated" || !email) {
			return;
		}

		// Récupérer l'état du tutoriel (cache ou API)
		const fetchTutorialStatus = async () => {
			const cached = getCachedTutorial(email);
			if (cached !== null) {
				setHasSeenTutorial(cached);
				return;
			}
			try {
				const response = await fetch("/api/user/tutorial");
				if (response.ok) {
					const data = await response.json();
					setHasSeenTutorial(data.hasSeenTutorial);
					setCachedTutorial(email, data.hasSeenTutorial);
				}
			} catch (error) {
				console.error(
					"Erreur lors de la récupération du statut du tutoriel:",
					error,
				);
			}
		};
		fetchTutorialStatus();
	}, [status, email]);

	const markTutorialAsSeen = async () => {
		try {
			const response = await fetch("/api/user/tutorial", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hasSeenTutorial: true }),
			});
			if (response.ok) {
				setHasSeenTutorial(true);
				setIsTutorialActive(false);
				if (email) setCachedTutorial(email, true);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la mise à jour du statut du tutoriel:",
				error,
			);
		}
	};

	const resetTutorial = async () => {
		try {
			const response = await fetch("/api/user/tutorial", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ hasSeenTutorial: false }),
			});
			if (response.ok) {
				setHasSeenTutorial(false);
				setCurrentTutorialStep(0);
				if (email) clearCachedTutorial(email);
			}
		} catch (error) {
			console.error(
				"Erreur lors de la réinitialisation du tutoriel:",
				error,
			);
		}
	};

	const startTutorial = () => {
		setIsTutorialActive(true);
		setCurrentTutorialStep(0);
	};

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
