"use client";

import {
	createContext,
	useCallback,
	useContext,
	useSyncExternalStore,
} from "react";

const ThemeContext = createContext(null);

const themeListeners = new Set();

function getSystemTheme() {
	return window.matchMedia("(prefers-color-scheme: light)").matches
		? "light"
		: "dark";
}

function subscribeTheme(callback) {
	themeListeners.add(callback);
	window.addEventListener("storage", callback);
	const mq = window.matchMedia("(prefers-color-scheme: light)");
	mq.addEventListener("change", callback);
	return () => {
		themeListeners.delete(callback);
		window.removeEventListener("storage", callback);
		mq.removeEventListener("change", callback);
	};
}

function getThemeSnapshot() {
	const stored = localStorage.getItem("mkp_theme");
	if (stored === "light" || stored === "dark") return stored;
	return getSystemTheme();
}

export function writeTheme(theme) {
	localStorage.setItem("mkp_theme", theme);
	themeListeners.forEach((l) => l());
}

export function ThemeProvider({ children }) {
	const theme = useSyncExternalStore(
		subscribeTheme,
		getThemeSnapshot,
		() => "dark", // server fallback — dark is the safe default before hydration
	);

	const toggleTheme = useCallback(() => {
		writeTheme(theme === "dark" ? "light" : "dark");
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
