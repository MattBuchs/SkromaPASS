"use client";

import { translations } from "@/lib/i18n/translations";
import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";

const LanguageContext = createContext(null);

// Module-level listener set for cross-component notification
const localeListeners = new Set();

function subscribeLocale(callback) {
	localeListeners.add(callback);
	// Also react to localStorage changes from other tabs
	window.addEventListener("storage", callback);
	return () => {
		localeListeners.delete(callback);
		window.removeEventListener("storage", callback);
	};
}

function getLocaleSnapshot() {
	const stored = localStorage.getItem("mkp_locale");
	if (stored === "en" || stored === "fr") return stored;
	// Browser language fallback
	return (navigator.language || "").startsWith("fr") ? "fr" : "en";
}

// Write locale to localStorage and notify all subscribers
export function writeLocale(lang) {
	localStorage.setItem("mkp_locale", lang);
	localeListeners.forEach((l) => l());
}

export function LanguageProvider({ children }) {
	const locale = useSyncExternalStore(
		subscribeLocale,
		getLocaleSnapshot,
		() => "en", // server snapshot
	);

	const setLocale = useCallback((lang) => {
		if (lang === "en" || lang === "fr") writeLocale(lang);
	}, []);

	const toggleLocale = useCallback(() => {
		writeLocale(locale === "fr" ? "en" : "fr");
	}, [locale]);

	const t = useCallback(
		(path) => {
			const parts = path.split(".");
			let value = translations[locale];
			for (const part of parts) {
				value = value?.[part];
			}
			return value ?? path;
		},
		[locale],
	);

	return (
		<LanguageContext.Provider
			value={{ locale, toggleLocale, setLocale, t }}
		>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	return useContext(LanguageContext);
}
