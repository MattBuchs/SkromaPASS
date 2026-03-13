// =====================================================================
// content-utils.js — État global + utilitaires partagés
// =====================================================================

// Compatibilité Chrome / Firefox
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

// État global (accessible par tous les modules content-*.js)
let buttonSettings = {
	enabled: true,
	signupButtonEnabled: true,
	position: "auto",
};
let autoSubmitEnabled = true;

// Échapper le HTML pour éviter les injections XSS
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// Extraire un nom de site propre depuis un hostname
function extractSiteName(hostname) {
	let name = hostname.replace(/^www\./i, "");
	const parts = name.split(".");
	if (parts.length > 2 && parts[parts.length - 2].length <= 3) {
		return parts[parts.length - 3];
	}
	return parts[0];
}

// Capitaliser la première lettre
function capitalizeSiteName(name) {
	return name.charAt(0).toUpperCase() + name.slice(1);
}
