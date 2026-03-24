// Service Worker pour l'extension SkromaPASS
// Gère la communication entre le popup, les content scripts et l'API backend

// Compatibilité Chrome / Firefox
const browserAPI = typeof browser !== "undefined" ? browser : chrome;

const API_BASE_URL = "https://skromapass.com";

// État de l'extension
let authToken = null;
let userSession = null;

// Initialisation - Charger l'état au démarrage
(async function initializeExtension() {
	await checkTokenExpiration();
	console.log("SkromaPASS extension initialisée");
})();

// Initialisation
browserAPI.runtime.onInstalled.addListener(async () => {
	console.log("SkromaPASS extension installée");
	await checkTokenExpiration();
});

// Vérifier aussi au démarrage du navigateur
browserAPI.runtime.onStartup.addListener(async () => {
	await checkTokenExpiration();
});

// Vérifier si le token est expiré
async function checkTokenExpiration() {
	return new Promise((resolve) => {
		browserAPI.storage.local.get(
			["authToken", "userSession", "tokenExpiresAt"],
			(result) => {
				if (result.authToken && result.tokenExpiresAt) {
					// Vérifier si le token est encore valide
					if (Date.now() < result.tokenExpiresAt) {
						authToken = result.authToken;
						userSession = result.userSession;
						console.log("Token valide, session restaurée");
					} else {
						// Token expiré, nettoyer le storage
						browserAPI.storage.local.remove([
							"authToken",
							"userSession",
							"tokenExpiresAt",
						]);
						authToken = null;
						userSession = null;
						console.log("Token expiré, session nettoyée");
					}
				}
				resolve();
			},
		);
	});
}

// Écouter les messages des content scripts et du popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
	handleMessage(request, sender, sendResponse);
	return true; // Indique qu'on va répondre de manière asynchrone
});

async function handleMessage(request, sender, sendResponse) {
	try {
		switch (request.action) {
			case "login":
				await handleLogin(request.data, sendResponse);
				break;

			case "logout":
				await handleLogout(sendResponse);
				break;

			case "getPasswords":
				await getPasswordsForUrl(request.url, sendResponse);
				break;

			case "savePassword":
				await saveNewPassword(request.data, sendResponse);
				break;

			case "checkAuth":
				await checkAuth(sendResponse);
				break;

			case "autofill":
				await handleAutofill(sender.tab.id, request.data, sendResponse);
				break;

			case "loginViaToken":
				await loginViaToken(request.token, request.user, sendResponse);
				break;

			case "openGeneratorForSignup":
				// Stocker l'ID de l'onglet pour que le popup sache qu'il est en mode signup
				await browserAPI.storage.local.set({
					signupModeTabId: sender.tab?.id,
				});
				// Tenter d'ouvrir le popup programmatiquement (Chrome 127+)
				let popupOpened = false;
				if (browserAPI.action && browserAPI.action.openPopup) {
					try {
						await browserAPI.action.openPopup();
						popupOpened = true;
					} catch (e) {
						/* Firefox : openPopup nécessite un geste utilisateur depuis le popup */
					}
				}
				// Fallback : ouvrir le popup dans une fenêtre dédiée (Firefox + anciens Chrome)
				if (!popupOpened) {
					await browserAPI.windows.create({
						url: browserAPI.runtime.getURL("popup.html"),
						type: "popup",
						width: 360,
						height: 550,
					});
				}
				sendResponse({ success: true });
				break;

			default:
				sendResponse({ success: false, error: "Action inconnue" });
		}
	} catch (error) {
		console.error("Erreur dans handleMessage:", error);
		sendResponse({ success: false, error: error.message });
	}
}

// Vérifier l'authentification en chargeant depuis le storage si nécessaire
async function checkAuth(sendResponse) {
	// Si on a déjà le token en mémoire, répondre immédiatement
	if (authToken && userSession) {
		sendResponse({
			isAuthenticated: true,
			user: userSession,
		});
		return;
	}

	// Sinon, charger depuis le storage
	browserAPI.storage.local.get(
		["authToken", "userSession", "tokenExpiresAt"],
		(result) => {
			if (result.authToken && result.tokenExpiresAt) {
				// Vérifier si le token est encore valide
				if (Date.now() < result.tokenExpiresAt) {
					authToken = result.authToken;
					userSession = result.userSession;
					sendResponse({
						isAuthenticated: true,
						user: userSession,
					});
				} else {
					// Token expiré, nettoyer
					browserAPI.storage.local.remove([
						"authToken",
						"userSession",
						"tokenExpiresAt",
					]);
					authToken = null;
					userSession = null;
					sendResponse({
						isAuthenticated: false,
						user: null,
					});
				}
			} else {
				sendResponse({
					isAuthenticated: false,
					user: null,
				});
			}
		},
	);
}

// Gérer la connexion
async function handleLogin(credentials, sendResponse) {
	try {
		const response = await fetch(
			`${API_BASE_URL}/api/auth/extension/login`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(credentials),
			},
		);

		const data = await response.json();

		if (response.ok && data.success) {
			authToken = data.token;
			userSession = data.user;

			// Sauvegarder dans le storage avec date d'expiration (15 jours)
			const expiresAt = Date.now() + 15 * 24 * 60 * 60 * 1000; // 15 jours en millisecondes
			await browserAPI.storage.local.set({
				authToken: data.token,
				userSession: data.user,
				tokenExpiresAt: expiresAt,
			});

			sendResponse({ success: true, user: data.user });
		} else {
			sendResponse({
				success: false,
				error: data.error || "Erreur de connexion",
			});
		}
	} catch (error) {
		console.error("Erreur de connexion:", error);
		sendResponse({
			success: false,
			error: "Impossible de se connecter au serveur",
		});
	}
}

// Gérer la déconnexion
async function handleLogout(sendResponse) {
	authToken = null;
	userSession = null;

	await browserAPI.storage.local.remove(["authToken", "userSession"]);
	sendResponse({ success: true });
}

// Connexion via un token généré par le site
async function loginViaToken(token, user, sendResponse) {
	try {
		console.log("[SkromaPASS Background] loginViaToken appelé", {
			hasToken: !!token,
			hasUser: !!user,
		});

		if (!token || !user) {
			console.error(
				"[SkromaPASS Background] Token ou utilisateur manquant",
			);
			sendResponse({
				success: false,
				error: "Token ou utilisateur manquant",
			});
			return;
		}

		authToken = token;
		userSession = user;
		const expiresAt = Date.now() + 15 * 24 * 60 * 60 * 1000;

		await browserAPI.storage.local.set({
			authToken: token,
			userSession: user,
			tokenExpiresAt: expiresAt,
		});

		console.log("[SkromaPASS Background] Connexion réussie!", user.email);
		sendResponse({ success: true });
	} catch (e) {
		console.error("[SkromaPASS Background] Erreur loginViaToken:", e);
		sendResponse({ success: false, error: e.message });
	}
}

// Récupérer les mots de passe pour une URL
async function getPasswordsForUrl(url, sendResponse) {
	// S'assurer que le token est chargé
	if (!authToken) {
		await checkTokenExpiration();
	}

	if (!authToken) {
		sendResponse({ success: false, error: "Non authentifié" });
		return;
	}

	try {
		const urlObj = new URL(url);
		const domain = urlObj.hostname;

		const response = await fetch(
			`${API_BASE_URL}/api/auth/extension/passwords?domain=${encodeURIComponent(
				domain,
			)}`,
			{
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
			},
		);

		const data = await response.json();

		if (response.ok) {
			sendResponse({ success: true, passwords: data.passwords || [] });
		} else {
			if (response.status === 401) {
				// Token expiré
				await handleLogout(() => {});
			}
			sendResponse({ success: false, error: data.error || "Erreur" });
		}
	} catch (error) {
		console.error(
			"Erreur lors de la récupération des mots de passe:",
			error,
		);
		sendResponse({ success: false, error: error.message });
	}
}

// Sauvegarder un nouveau mot de passe
async function saveNewPassword(passwordData, sendResponse) {
	// S'assurer que le token est chargé
	if (!authToken) {
		await checkTokenExpiration();
	}

	if (!authToken) {
		sendResponse({ success: false, error: "Non authentifié" });
		return;
	}

	try {
		const response = await fetch(
			`${API_BASE_URL}/api/auth/extension/passwords`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${authToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(passwordData),
			},
		);

		const data = await response.json();

		if (response.ok) {
			// Afficher une notification
			browserAPI.notifications.create({
				type: "basic",
				iconUrl: "icons/icon48.png",
				title: "SkromaPASS",
				message: "Mot de passe enregistré avec succès !",
			});

			sendResponse({ success: true, password: data.password });
		} else {
			sendResponse({ success: false, error: data.error || "Erreur" });
		}
	} catch (error) {
		console.error("Erreur lors de la sauvegarde:", error);
		sendResponse({ success: false, error: error.message });
	}
}

// Gérer l'auto-remplissage
async function handleAutofill(tabId, passwordData, sendResponse) {
	try {
		// Envoyer les données au content script pour remplir les champs
		await browserAPI.tabs.sendMessage(tabId, {
			action: "fillForm",
			data: passwordData,
		});

		sendResponse({ success: true });
	} catch (error) {
		console.error("Erreur lors de l'autofill:", error);
		sendResponse({ success: false, error: error.message });
	}
}

// Gérer les raccourcis clavier
browserAPI.commands.onCommand.addListener(async (command) => {
	if (command === "autofill-current-site") {
		const [tab] = await browserAPI.tabs.query({
			active: true,
			currentWindow: true,
		});
		if (!tab || !tab.url) return;

		// Recharger le token depuis le storage si absent (ex: redémarrage Firefox)
		if (!authToken) {
			await checkTokenExpiration();
		}
		if (!authToken) return;

		try {
			const urlObj = new URL(tab.url);
			const domain = urlObj.hostname;

			const response = await fetch(
				`${API_BASE_URL}/api/auth/extension/passwords?domain=${encodeURIComponent(domain)}`,
				{ headers: { Authorization: `Bearer ${authToken}` } },
			);
			const data = await response.json();

			if (response.ok && data.passwords && data.passwords.length > 0) {
				if (data.passwords.length === 1) {
					// Un seul mot de passe : remplir directement
					await browserAPI.tabs.sendMessage(tab.id, {
						action: "fillForm",
						data: data.passwords[0],
					});
					browserAPI.notifications.create({
						type: "basic",
						iconUrl: "icons/icon48.png",
						title: "SkromaPASS",
						message: `Formulaire rempli avec "${data.passwords[0].name}"`,
					});
				} else {
					// Plusieurs mots de passe : envoyer un message au content script
					// pour afficher le sélecteur directement sur la page
					await browserAPI.tabs.sendMessage(tab.id, {
						action: "showSelectorKeyboard",
						passwords: data.passwords,
					});
				}
			} else {
				browserAPI.notifications.create({
					type: "basic",
					iconUrl: "icons/icon48.png",
					title: "SkromaPASS",
					message: "Aucun mot de passe enregistré pour ce site.",
				});
			}
		} catch (error) {
			console.error("Erreur commande autofill:", error);
		}
	}
});

// Détecter les changements d'onglet pour proposer l'auto-remplissage
browserAPI.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
	if (changeInfo.status === "complete" && tab.url && authToken) {
		// Vérifier s'il y a des mots de passe pour cette URL
		try {
			const urlObj = new URL(tab.url);
			const domain = urlObj.hostname;

			const response = await fetch(
				`${API_BASE_URL}/api/auth/extension/passwords?domain=${encodeURIComponent(
					domain,
				)}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
				},
			);

			const data = await response.json();

			if (response.ok && data.passwords && data.passwords.length > 0) {
				// Il y a des mots de passe disponibles
				browserAPI.action.setBadgeText({
					tabId,
					text: data.passwords.length.toString(),
				});
				browserAPI.action.setBadgeBackgroundColor({
					tabId,
					color: "#14b8a6",
				});
			}
		} catch (error) {
			// Ignorer les erreurs (URLs internes, etc.)
		}
	}
});
