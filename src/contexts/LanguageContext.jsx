"use client";

import { translations } from "@/lib/i18n/translations";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
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

// Write locale to localStorage + cookie (readable by API routes) and notify all subscribers
export function writeLocale(lang) {
	localStorage.setItem("mkp_locale", lang);
	document.cookie = `mkp_locale=${lang};path=/;max-age=31536000;SameSite=Lax`;
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

	// Sync the cookie with the real locale on mount + every locale change.
	// writeLocale is only called on explicit switches, so the cookie might be
	// absent or stale if the user never toggled since the cookie sync was added.
	useEffect(() => {
		document.cookie = `mkp_locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
		document.documentElement.lang = locale;
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
