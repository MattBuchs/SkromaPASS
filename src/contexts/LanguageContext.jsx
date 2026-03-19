"use client";

import { translations } from "@/lib/i18n/translations";
import { createContext, useContext, useEffect, useState } from "react";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
	const [locale, setLocale] = useState("fr");

	useEffect(() => {
		const stored = localStorage.getItem("mkp_locale");
		if (stored === "en" || stored === "fr") setLocale(stored);
	}, []);

	const toggleLocale = () => {
		const next = locale === "fr" ? "en" : "fr";
		setLocale(next);
		localStorage.setItem("mkp_locale", next);
	};

	const t = (path) => {
		const parts = path.split(".");
		let value = translations[locale];
		for (const part of parts) {
			value = value?.[part];
		}
		return value ?? path;
	};

	return (
		<LanguageContext.Provider value={{ locale, toggleLocale, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	return useContext(LanguageContext);
}
