// =====================================================================
// popup.js  Point d'entr�e principal du popup
// D�pend de : popup-utils.js, popup-passwords.js, popup-settings.js,
//             popup-generator.js, popup-shortcuts.js, popup-auth.js
// =====================================================================

// Navigation par onglets
function switchTab(tabName) {
	const vaultEl = document.getElementById("tab-vault");
	const generatorEl = document.getElementById("tab-generator");
	const vaultBtn = document.getElementById("tab-vault-btn");
	const generatorBtn = document.getElementById("tab-generator-btn");

	if (tabName === "vault") {
		vaultEl.style.display = "";
		generatorEl.style.display = "none";
		vaultBtn.classList.add("tab-active");
		generatorBtn.classList.remove("tab-active");
	} else {
		vaultEl.style.display = "none";
		generatorEl.style.display = "";
		vaultBtn.classList.remove("tab-active");
		generatorBtn.classList.add("tab-active");
		updateGeneratorUI();
	}
}

// Initialisation du popup
document.addEventListener("DOMContentLoaded", async () => {
	// R�cup�rer l'onglet actif
	const [tab] = await browserAPI.tabs.query({
		active: true,
		currentWindow: true,
	});
	currentTab = tab;

	// V�rifier l'authentification (affiche auth ou main container)
	checkAuth();

	// Boutons de navigation et de d�connexion
	const loginSiteBtn = document.getElementById("login-via-site-btn");
	if (loginSiteBtn) loginSiteBtn.addEventListener("click", connectViaSite);
	document
		.getElementById("logout-btn")
		.addEventListener("click", handleLogout);
	document.getElementById("open-app-btn").addEventListener("click", openApp);

	// Param�tres du bouton
	document
		.getElementById("button-enabled")
		.addEventListener("change", handleButtonEnabledChange);

	// Navigation par onglets
	document
		.getElementById("tab-vault-btn")
		.addEventListener("click", () => switchTab("vault"));
	document
		.getElementById("tab-generator-btn")
		.addEventListener("click", () => switchTab("generator"));

	// G�n�rateur : contr�les
	document
		.getElementById("gen-refresh-btn")
		.addEventListener("click", updateGeneratorUI);
	document
		.getElementById("gen-length")
		.addEventListener("input", updateGeneratorUI);
	document
		.getElementById("gen-uppercase")
		.addEventListener("change", updateGeneratorUI);
	document
		.getElementById("gen-digits")
		.addEventListener("change", updateGeneratorUI);
	document
		.getElementById("gen-symbols")
		.addEventListener("change", updateGeneratorUI);
	document
		.getElementById("gen-readable")
		.addEventListener("change", updateGeneratorUI);

	// G�n�rateur : copier le mot de passe
	document.getElementById("gen-copy-btn").addEventListener("click", () => {
		const pwd = document.getElementById("gen-password").value;
		if (pwd) {
			navigator.clipboard.writeText(pwd).then(() => {
				const btn = document.getElementById("gen-copy-btn");
				btn.innerHTML = "&#10003;";
				setTimeout(() => {
					btn.innerHTML =
						'<svg width="18" height="18"><use href="#ico-copy"/></svg>';
				}, 1500);
			});
		}
	});

	// G�n�rateur : utiliser le mot de passe g�n�r� (mode inscription)
	document.getElementById("gen-use-btn").addEventListener("click", () => {
		const password = document.getElementById("gen-password").value;
		if (!password) return;
		// Utiliser signupModeTabId en priorité (cas Firefox : popup ouvert via windows.create)
		browserAPI.storage.local.get(["signupModeTabId"], (result) => {
			const targetTabId = result.signupModeTabId || currentTab?.id;
			if (!targetTabId) return;
			browserAPI.tabs.sendMessage(
				targetTabId,
				{ action: "fillSignupPassword", password },
				() => {
					browserAPI.storage.local.remove(["signupModeTabId"]);
					document.getElementById("gen-use-btn").style.display =
						"none";
					window.close();
				},
			);
		});
	});

	// Charger les param�tres, le g�n�ateur et les raccourcis
	loadButtonSettings();
	updateGeneratorUI();
	loadShortcuts();

	// Écouter les changements d'authentification (connexion via site dans un autre onglet)
	browserAPI.storage.onChanged.addListener((changes, area) => {
		if (
			area === "local" &&
			changes.authToken &&
			changes.authToken.newValue
		) {
			checkAuth();
		}
	});

	// �couter les changements de formulaire � enregistrer
	browserAPI.storage.onChanged.addListener((changes, area) => {
		if (area === "local" && changes.lastFormData) {
			const section = document.getElementById(
				"save-last-password-section",
			);
			const data = changes.lastFormData.newValue;
			if (!data) {
				if (section) section.style.display = "none";
				return;
			}
			const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;
			const isSameSite =
				currentTab?.url &&
				new URL(currentTab.url).hostname === data.domain;
			if (isRecent && isSameSite) {
				showLastFormDataSection(data);
			} else if (section) {
				section.style.display = "none";
			}
		}
	});
});
