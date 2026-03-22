// =====================================================================
// popup-auth.js — Authentification, connexion, déconnexion
// =====================================================================

// Vérifier l'état d'authentification
function checkAuth() {
	browserAPI.runtime.sendMessage({ action: "checkAuth" }, (response) => {
		if (response.isAuthenticated) {
			showMainContainer(response.user);
			loadPasswordsForCurrentSite();
		} else {
			showAuthContainer();
			browserAPI.storage.local.get(["pendingSiteLogin"], () => {
				// Flag de connexion en attente — le bouton "connexion via site" reste visible
			});
		}
	});
}

// Afficher l'écran de connexion
function showAuthContainer() {
	document.getElementById("auth-container").classList.add("active");
	document.getElementById("main-container").classList.remove("active");
	document.getElementById("header-subtitle").textContent = "Connectez-vous";
}

// Afficher l'interface principale après authentification
function showMainContainer(user) {
	document.getElementById("auth-container").classList.remove("active");
	document.getElementById("main-container").classList.add("active");
	document.getElementById("header-subtitle").textContent =
		"Vos mots de passe";
	document.getElementById("user-name").textContent =
		user.name || "Utilisateur";
	document.getElementById("user-email").textContent = user.email;

	checkLastFormData();

	// Mode signup : basculer sur le générateur si déclenché depuis une page d'inscription
	// Note : on vérifie juste signupModeTabId (pas currentTab.id) pour supporter
	// le cas Firefox où le popup est ouvert via windows.create (fenêtre séparée)
	browserAPI.storage.local.get(["signupModeTabId"], (result) => {
		if (result.signupModeTabId) {
			switchTab("generator");
			const useBtn = document.getElementById("gen-use-btn");
			useBtn.style.display = "";
			requestAnimationFrame(() => {
				useBtn.scrollIntoView({ block: "nearest" });
				window.scrollBy(0, 20);
			});
		}
	});
}

// Ouvrir SkromaPASS.fr pour se connecter via le site
async function connectViaSite() {
	await browserAPI.storage.local.set({ pendingSiteLogin: true });
	browserAPI.tabs.create({
		url: "https://SkromaPASS.fr/dashboard?source=extension",
	});
}

// Déconnecter l'utilisateur
async function handleLogout() {
	if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) return;
	browserAPI.runtime.sendMessage({ action: "logout" }, (response) => {
		if (response.success) {
			showAuthContainer();
			hideError();
			hideSuccess();
		}
	});
}
