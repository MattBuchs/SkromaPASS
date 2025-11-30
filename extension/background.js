// Service Worker pour l'extension MemKeyPass
// Gère la communication entre le popup, les content scripts et l'API backend

const API_BASE_URL = "http://localhost:3000"; // À changer en production

// État de l'extension
let authToken = null;
let userSession = null;

// Initialisation
chrome.runtime.onInstalled.addListener(() => {
    console.log("MemKeyPass extension installée");

    // Récupérer le token depuis le storage
    chrome.storage.local.get(["authToken", "userSession"], (result) => {
        if (result.authToken) {
            authToken = result.authToken;
            userSession = result.userSession;
        }
    });
});

// Écouter les messages des content scripts et du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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
                sendResponse({
                    isAuthenticated: !!authToken,
                    user: userSession,
                });
                break;

            case "autofill":
                await handleAutofill(sender.tab.id, request.data, sendResponse);
                break;

            default:
                sendResponse({ success: false, error: "Action inconnue" });
        }
    } catch (error) {
        console.error("Erreur dans handleMessage:", error);
        sendResponse({ success: false, error: error.message });
    }
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
            }
        );

        const data = await response.json();

        if (response.ok && data.success) {
            authToken = data.token;
            userSession = data.user;

            // Sauvegarder dans le storage
            await chrome.storage.local.set({
                authToken: data.token,
                userSession: data.user,
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

    await chrome.storage.local.remove(["authToken", "userSession"]);
    sendResponse({ success: true });
}

// Récupérer les mots de passe pour une URL
async function getPasswordsForUrl(url, sendResponse) {
    if (!authToken) {
        sendResponse({ success: false, error: "Non authentifié" });
        return;
    }

    try {
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        const response = await fetch(
            `${API_BASE_URL}/api/auth/extension/passwords?domain=${encodeURIComponent(
                domain
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    "Content-Type": "application/json",
                },
            }
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
            error
        );
        sendResponse({ success: false, error: error.message });
    }
}

// Sauvegarder un nouveau mot de passe
async function saveNewPassword(passwordData, sendResponse) {
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
            }
        );

        const data = await response.json();

        if (response.ok) {
            // Afficher une notification
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon48.png",
                title: "MemKeyPass",
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
        await chrome.tabs.sendMessage(tabId, {
            action: "fillForm",
            data: passwordData,
        });

        sendResponse({ success: true });
    } catch (error) {
        console.error("Erreur lors de l'autofill:", error);
        sendResponse({ success: false, error: error.message });
    }
}

// Détecter les changements d'onglet pour proposer l'auto-remplissage
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url && authToken) {
        // Vérifier s'il y a des mots de passe pour cette URL
        try {
            const urlObj = new URL(tab.url);
            const domain = urlObj.hostname;

            const response = await fetch(
                `${API_BASE_URL}/api/auth/extension/passwords?domain=${encodeURIComponent(
                    domain
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok && data.passwords && data.passwords.length > 0) {
                // Il y a des mots de passe disponibles
                chrome.action.setBadgeText({
                    tabId,
                    text: data.passwords.length.toString(),
                });
                chrome.action.setBadgeBackgroundColor({
                    tabId,
                    color: "#14b8a6",
                });
            }
        } catch (error) {
            // Ignorer les erreurs (URLs internes, etc.)
        }
    }
});
