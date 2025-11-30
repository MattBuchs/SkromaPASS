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
    document.getElementById("login-btn").addEventListener("click", handleLogin);
    document
        .getElementById("logout-btn")
        .addEventListener("click", handleLogout);
    document.getElementById("open-app-btn").addEventListener("click", openApp);

    // Paramètres du bouton
    document
        .getElementById("button-enabled")
        .addEventListener("change", handleButtonEnabledChange);

    // Charger les paramètres sauvegardés
    loadButtonSettings();

    // Permettre la connexion avec Enter
    document.getElementById("password").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            handleLogin();
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
}

// Gérer la connexion
async function handleLogin() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showError("Veuillez remplir tous les champs");
        return;
    }

    const loginBtn = document.getElementById("login-btn");
    loginBtn.disabled = true;
    loginBtn.textContent = "Connexion...";

    chrome.runtime.sendMessage(
        {
            action: "login",
            data: { email, password },
        },
        (response) => {
            loginBtn.disabled = false;
            loginBtn.textContent = "Se connecter";

            if (response.success) {
                showMainContainer(response.user);
                loadPasswordsForCurrentSite();
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                hideError();
            } else {
                showError(response.error || "Erreur de connexion");
            }
        }
    );
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
            "Cette extension ne fonctionne pas sur les pages internes du navigateur"
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
        }
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

        const name = document.createElement("div");
        name.className = "name";
        name.textContent = pwd.name;

        const username = document.createElement("div");
        username.className = "username";
        username.textContent = pwd.username || pwd.email || "Aucun identifiant";

        item.appendChild(name);
        item.appendChild(username);

        item.addEventListener("click", () => {
            autofillPassword(pwd);
        });

        passwordsList.appendChild(item);
    });
}

// Afficher un état vide
function showEmptyState(message) {
    const passwordsList = document.getElementById("passwords-list");
    passwordsList.innerHTML = `
    <div class="empty-state">
      <div class="icon">🔒</div>
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
    chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
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
    chrome.storage.local.get(["buttonEnabled"], (result) => {
        const buttonEnabled =
            result.buttonEnabled !== undefined ? result.buttonEnabled : true;

        document.getElementById("button-enabled").checked = buttonEnabled;
    });
}

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

// Cacher le message de succès
function hideSuccess() {
    const successDiv = document.getElementById("success-message");
    successDiv.style.display = "none";
}
