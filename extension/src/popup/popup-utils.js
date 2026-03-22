// =====================================================================
// popup-utils.js — État global + helpers UI partagés
// =====================================================================

// Compatibilité Chrome / Firefox
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

let currentTab = null;

function showError(message) {
	const errorDiv = document.getElementById("error-message");
	errorDiv.textContent = message;
	errorDiv.style.display = "block";
}

function hideError() {
	document.getElementById("error-message").style.display = "none";
}

function showSuccess(message) {
	const successDiv = document.getElementById("success-message");
	successDiv.textContent = message;
	successDiv.style.display = "block";
	setTimeout(hideSuccess, 3000);
}

function hideSuccess() {
	document.getElementById("success-message").style.display = "none";
}

function openApp() {
	browserAPI.tabs.create({ url: "https://SkromaPASS.fr/dashboard" });
}
