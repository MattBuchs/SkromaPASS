// Script pour le popup de l'extension MemKeyPass

let currentTab = null;

// Initialisation
document.addEventListener("DOMContentLoaded", async () => {
	// Récupérer l'onglet actif
	const [tab] = await chrome.tabs.query({
		active: true,
		currentWindow: true,
	});
	currentTab = tab;

	// Vérifier l'authentification
	checkAuth();

	// Event listeners
	const loginSiteBtn = document.getElementById("login-via-site-btn");
	if (loginSiteBtn) {
		loginSiteBtn.addEventListener("click", connectViaSite);
	}
	document
		.getElementById("logout-btn")
		.addEventListener("click", handleLogout);
	document.getElementById("open-app-btn").addEventListener("click", openApp);

	// Paramètres du bouton
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

	// Générateur
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

	// Bouton "Utiliser ce mot de passe" (mode signup)
	document.getElementById("gen-use-btn").addEventListener("click", () => {
		const password = document.getElementById("gen-password").value;
		if (!password || !currentTab) return;
		chrome.tabs.sendMessage(
			currentTab.id,
			{ action: "fillSignupPassword", password },
			() => {
				chrome.storage.local.remove(["signupModeTabId"]);
				document.getElementById("gen-use-btn").style.display = "none";
				window.close();
			},
		);
	});

	// Charger les paramètres sauvegardés
	loadButtonSettings();

	// Initialiser le générateur
	updateGeneratorUI();

	// Charger les raccourcis actuels
	loadShortcuts();
	chrome.storage.onChanged.addListener((changes, area) => {
		if (
			area === "local" &&
			changes.authToken &&
			changes.authToken.newValue
		) {
			checkAuth();
		}
	});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area === "local" && changes.lastFormData) {
			const section = document.getElementById(
				"save-last-password-section",
			);
			const data = changes.lastFormData.newValue;
			if (!data) {
				if (section) section.style.display = "none";
			} else {
				const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;
				const isSameSite =
					currentTab &&
					currentTab.url &&
					new URL(currentTab.url).hostname === data.domain;
				if (isRecent && isSameSite) {
					showLastFormDataSection(data);
				} else if (section) {
					section.style.display = "none";
				}
			}
		}
	});
});

// Vérifier l'authentification
async function checkAuth() {
	chrome.runtime.sendMessage({ action: "checkAuth" }, (response) => {
		if (response.isAuthenticated) {
			showMainContainer(response.user);
			loadPasswordsForCurrentSite();
		} else {
			showAuthContainer();
			// Si une connexion via site est en attente, guider l'utilisateur
			chrome.storage.local.get(["pendingSiteLogin"], (result) => {
				const pending = result.pendingSiteLogin;
				if (pending) {
					// Laisser le bouton visible, mais on peut aussi ouvrir directement
					// connectViaSite(); // Si souhaité, décommenter pour ouvrir automatiquement
				}
			});
		}
	});
}

// Afficher le formulaire de connexion
function showAuthContainer() {
	document.getElementById("auth-container").classList.add("active");
	document.getElementById("main-container").classList.remove("active");
	document.getElementById("header-subtitle").textContent = "Connectez-vous";
}

// Afficher le container principal
function showMainContainer(user) {
	document.getElementById("auth-container").classList.remove("active");
	document.getElementById("main-container").classList.add("active");
	document.getElementById("header-subtitle").textContent =
		"Vos mots de passe";

	// Afficher les infos utilisateur
	document.getElementById("user-name").textContent =
		user.name || "Utilisateur";
	document.getElementById("user-email").textContent = user.email;

	// Vérifier s'il y a un dernier formulaire à enregistrer
	checkLastFormData();

	// Vérifier si on est en mode signup (déclenché depuis un bouton de formulaire d'inscription)
	chrome.storage.local.get(["signupModeTabId"], (result) => {
		if (
			result.signupModeTabId &&
			currentTab &&
			result.signupModeTabId === currentTab.id
		) {
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

// Connexion via le site
async function connectViaSite() {
	await chrome.storage.local.set({ pendingSiteLogin: true });
	const targetUrl = "https://memkeypass.fr/dashboard?source=extension";
	chrome.tabs.create({ url: targetUrl });
}

// Gérer la déconnexion
async function handleLogout() {
	if (!confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
		return;
	}

	chrome.runtime.sendMessage({ action: "logout" }, (response) => {
		if (response.success) {
			showAuthContainer();
			hideError();
			hideSuccess();
		}
	});
}

// Charger les mots de passe pour le site actuel
async function loadPasswordsForCurrentSite() {
	if (!currentTab || !currentTab.url) {
		showEmptyState("Aucun site web actif");
		return;
	}

	// Ignorer les pages internes
	if (
		currentTab.url.startsWith("chrome://") ||
		currentTab.url.startsWith("about:") ||
		currentTab.url.startsWith("edge://") ||
		currentTab.url.startsWith("chrome-extension://")
	) {
		showEmptyState(
			"Cette extension ne fonctionne pas sur les pages internes du navigateur",
		);
		return;
	}

	const passwordsList = document.getElementById("passwords-list");
	passwordsList.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>
  `;

	chrome.runtime.sendMessage(
		{
			action: "getPasswords",
			url: currentTab.url,
		},
		(response) => {
			if (response.success) {
				displayPasswords(response.passwords);
			} else {
				showEmptyState("Erreur : " + response.error);
			}
		},
	);
}

// Afficher les mots de passe
function displayPasswords(passwords) {
	const passwordsList = document.getElementById("passwords-list");

	if (!passwords || passwords.length === 0) {
		showEmptyState("Aucun mot de passe enregistré pour ce site");
		return;
	}

	passwordsList.innerHTML = "";

	passwords.forEach((pwd) => {
		const item = document.createElement("div");
		item.className = "password-item";

		// Zone d'info (clic = autofill)
		const info = document.createElement("div");
		info.className = "pwd-info";

		const name = document.createElement("div");
		name.className = "name";
		name.textContent = pwd.name;

		const username = document.createElement("div");
		username.className = "username";
		username.textContent = pwd.username || pwd.email || "Aucun identifiant";

		info.appendChild(name);
		info.appendChild(username);
		info.addEventListener("click", () => autofillPassword(pwd));

		// Boutons de copie rapide
		const actions = document.createElement("div");
		actions.className = "pwd-actions";

		const copyUserBtn = document.createElement("button");
		copyUserBtn.className = "copy-icon-btn";
		copyUserBtn.title = "Copier l'identifiant";
		copyUserBtn.textContent = "👤";
		copyUserBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			const text = pwd.email || pwd.username || "";
			if (text) {
				navigator.clipboard.writeText(text).then(() => {
					copyUserBtn.textContent = "✓";
					setTimeout(() => (copyUserBtn.textContent = "👤"), 1500);
				});
			}
		});

		const copyPwdBtn = document.createElement("button");
		copyPwdBtn.className = "copy-icon-btn";
		copyPwdBtn.title = "Copier le mot de passe";
		copyPwdBtn.textContent = "🔑";
		copyPwdBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			if (pwd.password) {
				navigator.clipboard.writeText(pwd.password).then(() => {
					copyPwdBtn.textContent = "✓";
					setTimeout(() => (copyPwdBtn.textContent = "🔑"), 1500);
				});
			}
		});

		actions.appendChild(copyUserBtn);
		actions.appendChild(copyPwdBtn);

		item.appendChild(info);
		item.appendChild(actions);

		passwordsList.appendChild(item);
	});
}

// Afficher un état vide
function showEmptyState(message) {
	const passwordsList = document.getElementById("passwords-list");
	passwordsList.innerHTML = `
    <div class="empty-state">
      <div class="icon"><svg width="48" height="48" style="opacity:0.4"><use href="#ico-lock"/></svg></div>
      <p>${message}</p>
    </div>
  `;
}

// Auto-remplir le mot de passe
async function autofillPassword(password) {
	// Envoyer le mot de passe au content script
	try {
		await chrome.tabs.sendMessage(currentTab.id, {
			action: "fillForm",
			data: password,
		});

		showSuccess("Mot de passe rempli avec succès !");

		// Fermer le popup après 1 seconde
		setTimeout(() => {
			window.close();
		}, 1000);
	} catch (error) {
		console.error("Erreur autofill:", error);
		showError("Impossible de remplir le formulaire. Veuillez réessayer.");
	}
}

// Ouvrir l'application web
function openApp() {
	chrome.tabs.create({ url: "https://memkeypass.fr/dashboard" });
}

// Afficher une erreur
function showError(message) {
	const errorDiv = document.getElementById("error-message");
	errorDiv.textContent = message;
	errorDiv.style.display = "block";
}

// Cacher l'erreur
function hideError() {
	const errorDiv = document.getElementById("error-message");
	errorDiv.style.display = "none";
}

// Afficher un message de succès
function showSuccess(message) {
	const successDiv = document.getElementById("success-message");
	successDiv.textContent = message;
	successDiv.style.display = "block";

	setTimeout(() => {
		hideSuccess();
	}, 3000);
}

// Charger les paramètres du bouton
async function loadButtonSettings() {
	chrome.storage.local.get(
		["buttonEnabled", "autoSubmitEnabled", "signupButtonEnabled"],
		(result) => {
			const buttonEnabled =
				result.buttonEnabled !== undefined
					? result.buttonEnabled
					: true;
			const autoSubmitEnabled =
				result.autoSubmitEnabled !== undefined
					? result.autoSubmitEnabled
					: true;
			const signupButtonEnabled =
				result.signupButtonEnabled !== undefined
					? result.signupButtonEnabled
					: true;

			document.getElementById("button-enabled").checked = buttonEnabled;
			const signupBtnCheckbox =
				document.getElementById("signup-btn-enabled");
			if (signupBtnCheckbox)
				signupBtnCheckbox.checked = signupButtonEnabled;
			const autoSubmitCheckbox = document.getElementById(
				"auto-submit-enabled",
			);
			if (autoSubmitCheckbox)
				autoSubmitCheckbox.checked = autoSubmitEnabled;
		},
	);
}

// Gérer le changement du bouton générateur inscription
document
	.getElementById("signup-btn-enabled")
	?.addEventListener("change", async (e) => {
		const enabled = e.target.checked;
		await chrome.storage.local.set({ signupButtonEnabled: enabled });
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				chrome.tabs
					.sendMessage(tab.id, {
						action: "updateButtonSettings",
						signupButtonEnabled: enabled,
					})
					.catch(() => {});
			});
		});
	});

// Gérer le changement d'activation du bouton
async function handleButtonEnabledChange(e) {
	const enabled = e.target.checked;

	await chrome.storage.local.set({ buttonEnabled: enabled });

	// Notifier tous les onglets du changement
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			chrome.tabs
				.sendMessage(tab.id, {
					action: "updateButtonSettings",
					enabled: enabled,
				})
				.catch(() => {}); // Ignorer les erreurs (pages sans content script)
		});
	});
}

// Gérer le changement d'auto-soumission
document
	.getElementById("auto-submit-enabled")
	?.addEventListener("change", async (e) => {
		const enabled = e.target.checked;
		await chrome.storage.local.set({ autoSubmitEnabled: enabled });
		chrome.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				chrome.tabs
					.sendMessage(tab.id, {
						action: "updateButtonSettings",
						autoSubmitEnabled: enabled,
					})
					.catch(() => {});
			});
		});
	});

// Cacher le message de succès
function hideSuccess() {
	const successDiv = document.getElementById("success-message");
	successDiv.style.display = "none";
}

// =====================================================================
// Navigation par onglets
// =====================================================================
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

// =====================================================================
// Générateur de mot de passe
// =====================================================================
function generatePassword() {
	const length = parseInt(document.getElementById("gen-length").value, 10);
	const useUppercase = document.getElementById("gen-uppercase").checked;
	const useDigits = document.getElementById("gen-digits").checked;
	const useSymbols = document.getElementById("gen-symbols").checked;
	const excludeAmbiguous = document.getElementById("gen-readable").checked;

	let lowercase = excludeAmbiguous
		? "abcdefghjkmnpqrstuvwxyz"
		: "abcdefghijklmnopqrstuvwxyz";
	const uppercase = excludeAmbiguous
		? "ABCDEFGHJKLMNPQRSTUVWXYZ"
		: "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const digits = excludeAmbiguous ? "23456789" : "0123456789";
	const symbols = "!@#$%^&*()-_=+[]{}";

	let charPool = lowercase;
	let mandatory = lowercase[Math.floor(Math.random() * lowercase.length)];

	if (useUppercase) {
		charPool += uppercase;
		mandatory += uppercase[Math.floor(Math.random() * uppercase.length)];
	}
	if (useDigits) {
		charPool += digits;
		mandatory += digits[Math.floor(Math.random() * digits.length)];
	}
	if (useSymbols) {
		charPool += symbols;
		mandatory += symbols[Math.floor(Math.random() * symbols.length)];
	}

	const remaining = Math.max(0, length - mandatory.length);
	const randomBytes = new Uint32Array(remaining);
	crypto.getRandomValues(randomBytes);

	let password = mandatory;
	for (let i = 0; i < remaining; i++) {
		password += charPool[randomBytes[i] % charPool.length];
	}

	// Mélange cryptographique
	const shuffleBytes = new Uint32Array(password.length);
	crypto.getRandomValues(shuffleBytes);
	return password
		.split("")
		.map((c, i) => ({ c, r: shuffleBytes[i] }))
		.sort((a, b) => a.r - b.r)
		.map((x) => x.c)
		.join("");
}

function updateGeneratorUI() {
	const password = generatePassword();
	document.getElementById("gen-password").value = password;
	document.getElementById("gen-length-display").textContent =
		document.getElementById("gen-length").value;
	updateStrengthBar(password);
}

function updateStrengthBar(password) {
	const bar = document.getElementById("gen-strength-bar");
	const label = document.getElementById("gen-strength-label");

	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (password.length >= 16) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	const levels = [
		{ max: 2, label: "Faible", color: "#ef4444", pct: 25 },
		{ max: 3, label: "Moyen", color: "#f59e0b", pct: 50 },
		{ max: 4, label: "Bon", color: "#84cc16", pct: 75 },
		{ max: 99, label: "Excellent", color: "#10b981", pct: 100 },
	];
	const strength = levels.find((l) => score <= l.max);

	bar.style.width = strength.pct + "%";
	bar.style.background = strength.color;
	label.textContent = `Force : ${strength.label}`;
	label.style.color = strength.color;
}

// =====================================================================
// Configuration des raccourcis clavier
// =====================================================================
function setupShortcutCapture(inputId, commandName, saveBtnId) {
	const input = document.getElementById(inputId);
	const saveBtn = document.getElementById(saveBtnId);
	if (!input || !saveBtn) return;

	const SUGGESTED = {
		_execute_action: "Alt+Shift+P",
		"autofill-current-site": "Alt+Shift+F",
	};

	let pendingShortcut = null;
	let capturing = false;

	// Charger le raccourci actuel
	if (chrome.commands && chrome.commands.getAll) {
		chrome.commands.getAll((commands) => {
			const cmd = commands.find((c) => c.name === commandName);
			input.value =
				cmd && cmd.shortcut
					? cmd.shortcut
					: SUGGESTED[commandName] || "Non défini";
		});
	}

	input.addEventListener("click", () => {
		capturing = true;
		pendingShortcut = null;
		input.value = "Appuyez un raccourci...";
		input.classList.add("capturing");
	});

	input.addEventListener("blur", () => {
		if (capturing && !pendingShortcut) {
			capturing = false;
			input.classList.remove("capturing");
			if (chrome.commands && chrome.commands.getAll) {
				chrome.commands.getAll((commands) => {
					const cmd = commands.find((c) => c.name === commandName);
					input.value =
						cmd && cmd.shortcut
							? cmd.shortcut
							: SUGGESTED[commandName] || "Non défini";
				});
			}
		}
	});

	input.addEventListener("keydown", (e) => {
		if (!capturing) return;
		e.preventDefault();
		e.stopPropagation();

		const key = e.key;
		if (["Control", "Alt", "Shift", "Meta", "Tab", "Escape"].includes(key))
			return;

		const mods = [];
		if (e.ctrlKey) mods.push("Ctrl");
		if (e.altKey) mods.push("Alt");
		if (e.shiftKey) mods.push("Shift");
		if (mods.length === 0) return;

		let chromeKey;
		if (key.length === 1 && /[A-Za-z]/.test(key)) {
			chromeKey = key.toUpperCase();
		} else if (key.length === 1 && /[0-9]/.test(key)) {
			chromeKey = key;
		} else if (key === ",") {
			chromeKey = "Comma";
		} else if (key === ".") {
			chromeKey = "Period";
		} else if (/^F\d+$/.test(key)) {
			chromeKey = key;
		} else {
			return;
		}

		pendingShortcut = [...mods, chromeKey].join("+");
		input.value = pendingShortcut;
		input.classList.remove("capturing");
		capturing = false;
	});

	saveBtn.addEventListener("click", () => {
		if (!pendingShortcut) {
			showSuccess("Aucun raccourci à sauvegarder");
			return;
		}
		if (chrome.commands && chrome.commands.update) {
			chrome.commands.update(
				{ name: commandName, shortcut: pendingShortcut },
				() => {
					if (chrome.runtime.lastError) {
						showError(
							"Raccourci invalide\u00a0: " +
								chrome.runtime.lastError.message,
						);
					} else {
						showSuccess(
							"Raccourci mis \u00e0 jour\u00a0: " +
								pendingShortcut,
						);
						pendingShortcut = null;
					}
				},
			);
		} else {
			showError(
				"L'API de mise \u00e0 jour des raccourcis n'est pas disponible",
			);
		}
	});
}

function loadShortcuts() {
	setupShortcutCapture(
		"shortcut-open",
		"_execute_action",
		"shortcut-open-save",
	);
	setupShortcutCapture(
		"shortcut-fill",
		"autofill-current-site",
		"shortcut-fill-save",
	);
}

// Vérifier s'il y a un dernier formulaire à enregistrer
function checkLastFormData() {
	chrome.storage.local.get(["lastFormData"], (result) => {
		const section = document.getElementById("save-last-password-section");
		const data = result.lastFormData;
		if (!data) {
			if (section) section.style.display = "none";
		} else {
			const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;
			const isSameSite =
				currentTab &&
				currentTab.url &&
				new URL(currentTab.url).hostname === data.domain;
			if (isRecent && isSameSite) {
				showLastFormDataSection(data);
			} else if (section) {
				section.style.display = "none";
			}
		}
	});
}

// Afficher la section pour enregistrer le dernier mot de passe
function showLastFormDataSection(data) {
	const section = document.getElementById("save-last-password-section");
	const domainEl = document.getElementById("last-form-domain");
	const usernameEl = document.getElementById("last-form-username");
	const nameInput = document.getElementById("last-form-name");
	const saveBtn = document.getElementById("save-last-password-btn");
	const dismissBtn = document.getElementById("dismiss-last-password-btn");

	domainEl.textContent = data.domain;
	usernameEl.textContent = data.email || data.username || "Non spécifié";
	nameInput.value = data.siteName || data.domain;

	section.style.display = "block";

	// Supprimer les anciens gestionnaires en clonant les boutons
	const newSaveBtn = saveBtn.cloneNode(true);
	const newDismissBtn = dismissBtn.cloneNode(true);
	saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
	dismissBtn.parentNode.replaceChild(newDismissBtn, dismissBtn);

	// Gestionnaire pour enregistrer
	newSaveBtn.addEventListener("click", async () => {
		const name = nameInput.value.trim();
		if (!name) {
			showError("Veuillez entrer un nom");
			return;
		}

		newSaveBtn.disabled = true;
		newSaveBtn.textContent = "Enregistrement...";

		chrome.runtime.sendMessage(
			{
				action: "savePassword",
				data: {
					name,
					url: data.url,
					domain: data.domain,
					username: data.username,
					email: data.email,
					password: data.password,
				},
			},
			(response) => {
				if (chrome.runtime.lastError) {
					console.error("Erreur runtime:", chrome.runtime.lastError);
					showError("Erreur de communication");
					newSaveBtn.disabled = false;
					newSaveBtn.textContent = "Enregistrer";
					return;
				}

				if (response && response.success) {
					showSuccess("Mot de passe enregistré !");
					section.style.display = "none";
					chrome.storage.local.remove(["lastFormData"]);
					// Recharger la liste
					loadPasswordsForCurrentSite();
				} else {
					showError(
						"Erreur : " + (response?.error || "Erreur inconnue"),
					);
					newSaveBtn.disabled = false;
					newSaveBtn.textContent = "Enregistrer";
				}
			},
		);
	});

	// Gestionnaire pour ignorer
	newDismissBtn.addEventListener("click", () => {
		section.style.display = "none";
		chrome.storage.local.remove(["lastFormData"]);
	});
}
