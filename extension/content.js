// Content Script pour détecter et remplir les formulaires de connexion

// Variables globales pour les paramètres
let buttonSettings = {
    enabled: true,
    position: "auto",
};

// Détecter les formulaires de connexion sur la page
function detectLoginForms() {
    const forms = document.querySelectorAll("form");
    const loginForms = [];

    forms.forEach((form) => {
        const inputs = form.querySelectorAll("input");
        let hasPassword = false;
        let hasEmail = false;
        let hasUsername = false;

        inputs.forEach((input) => {
            const type = input.type.toLowerCase();
            const name = input.name.toLowerCase();
            const id = input.id.toLowerCase();
            const placeholder = input.placeholder?.toLowerCase() || "";

            if (type === "password") {
                hasPassword = true;
            } else if (
                type === "email" ||
                name.includes("email") ||
                id.includes("email") ||
                placeholder.includes("email")
            ) {
                hasEmail = true;
            } else if (
                type === "text" &&
                (name.includes("user") ||
                    name.includes("login") ||
                    id.includes("user") ||
                    id.includes("login") ||
                    placeholder.includes("user") ||
                    placeholder.includes("login"))
            ) {
                hasUsername = true;
            }
        });

        if (hasPassword && (hasEmail || hasUsername)) {
            loginForms.push(form);
        }
    });

    return loginForms;
}

// Trouver les champs spécifiques dans un formulaire
function findFormFields(form) {
    const inputs = form.querySelectorAll("input");
    const fields = {
        email: null,
        username: null,
        password: null,
    };

    inputs.forEach((input) => {
        const type = input.type.toLowerCase();
        const name = input.name.toLowerCase();
        const id = input.id.toLowerCase();
        const placeholder = input.placeholder?.toLowerCase() || "";

        if (type === "password" && !fields.password) {
            fields.password = input;
        } else if (
            type === "email" ||
            name.includes("email") ||
            id.includes("email") ||
            placeholder.includes("email")
        ) {
            fields.email = input;
        } else if (
            type === "text" &&
            !fields.username &&
            (name.includes("user") ||
                name.includes("login") ||
                id.includes("user") ||
                id.includes("login") ||
                placeholder.includes("user") ||
                placeholder.includes("login"))
        ) {
            fields.username = input;
        }
    });

    return fields;
}

// Ajouter un bouton MemKeyPass à côté des champs de mot de passe
function addMemKeyPassButton(passwordField, hasPasswords) {
    // Vérifier si le bouton est désactivé
    if (!buttonSettings.enabled) return;

    // Vérifier s'il y a des mots de passe disponibles
    if (!hasPasswords) return;

    // Vérifier si le bouton n'existe pas déjà
    if (passwordField.dataset.memkeypassButton) return;

    passwordField.dataset.memkeypassButton = "true";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "memkeypass-autofill-btn";
    button.title = "Remplir avec MemKeyPass";

    const parent = passwordField.parentElement;

    button.style.cssText = `
    position: absolute;
    right: 20px;
    top: 90%;
    transform: translateY(-50%);
    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
    border: none;
    border-radius: 6px;
    cursor: grab;
    width: 32px;
    height: 32px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;

    // Logo SVG clé (même que l'extension)
    button.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7" cy="7" r="3" fill="white"/>
      <circle cx="7" cy="7" r="1.2" fill="#14b8a6"/>
      <rect x="6" y="7" width="2" height="12" fill="white"/>
      <rect x="4" y="17" width="2" height="2" fill="white"/>
      <rect x="4" y="14" width="2" height="2" fill="white"/>
      <rect x="8" y="15.5" width="2" height="2" fill="white"/>
    </svg>
  `;

    // Positionner le parent en relative si nécessaire
    if (window.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
    }

    // Variables pour le drag and drop
    let isDragging = false;
    let dragStartTime = 0;
    let startX = 0;
    let startY = 0;
    let hasMoved = false;

    button.addEventListener("mousedown", (e) => {
        dragStartTime = Date.now();
        startX = e.clientX;
        startY = e.clientY;
        hasMoved = false;
        isDragging = true;
        button.style.cursor = "grabbing";
        button.style.transition = "none";
        e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const moveDistance =
            Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY);
        if (moveDistance > 5) {
            hasMoved = true;
        }

        // Calculer la position par rapport au parent
        const parentRect = parent.getBoundingClientRect();
        const buttonWidth = 32;
        const buttonHeight = 32;

        let newLeft = e.clientX - parentRect.left - buttonWidth / 2;
        let newTop = e.clientY - parentRect.top - buttonHeight / 2;

        // Limiter aux bordures du parent (permettre de dépasser un peu en bas)
        newLeft = Math.max(
            0,
            Math.min(newLeft, parentRect.width - buttonWidth)
        );
        newTop = Math.max(
            -buttonHeight / 8,
            Math.min(newTop, parentRect.height + buttonHeight / 8)
        );

        button.style.left = newLeft + "px";
        button.style.top = newTop + "px";
        button.style.right = "auto";
        button.style.transform = "none";
    });

    document.addEventListener("mouseup", (e) => {
        if (isDragging) {
            isDragging = false;
            button.style.cursor = "grab";
            button.style.transition = "all 0.2s ease";

            // Si le bouton n'a pas bougé ou très peu, c'est un clic
            if (!hasMoved || Date.now() - dragStartTime < 200) {
                // Demander les mots de passe au background script
                chrome.runtime.sendMessage(
                    { action: "getPasswords", url: window.location.href },
                    (response) => {
                        if (response.success && response.passwords.length > 0) {
                            showPasswordSelector(
                                passwordField,
                                response.passwords
                            );
                        } else {
                            alert("Aucun mot de passe enregistré pour ce site");
                        }
                    }
                );
            }
        }
    });

    parent.appendChild(button);
}

// Afficher un sélecteur de mot de passe
function showPasswordSelector(passwordField, passwords) {
    // Supprimer l'ancien sélecteur s'il existe
    const oldSelector = document.querySelector(".memkeypass-selector");
    if (oldSelector) oldSelector.remove();

    const selector = document.createElement("div");
    selector.className = "memkeypass-selector";
    selector.style.cssText = `
    position: absolute;
    background: white;
    border: 2px solid #14b8a6;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(20, 184, 166, 0.2);
    z-index: 10001;
    max-height: 300px;
    overflow-y: auto;
    min-width: 280px;
  `;

    passwords.forEach((pwd) => {
        const item = document.createElement("div");
        item.style.cssText = `
      padding: 14px 18px;
      cursor: pointer;
      border-bottom: 1px solid #f0f0f0;
      transition: all 0.2s ease;
    `;
        item.innerHTML = `
      <div style="font-weight: 600; color: #0f172a; font-size: 14px;">${escapeHtml(
          pwd.name
      )}</div>
      <div style="font-size: 13px; color: #64748b; margin-top: 4px;">
        ${escapeHtml(pwd.username || pwd.email || "")}
      </div>
    `;

        item.addEventListener("mouseover", () => {
            item.style.backgroundColor = "#f0fdfa";
            item.style.borderLeft = "3px solid #14b8a6";
            item.style.paddingLeft = "15px";
        });
        item.addEventListener("mouseout", () => {
            item.style.backgroundColor = "white";
            item.style.borderLeft = "none";
            item.style.paddingLeft = "18px";
        });

        item.addEventListener("click", () => {
            fillFormWithPassword(passwordField, pwd);
            selector.remove();
        });

        selector.appendChild(item);
    });

    // Positionner le sélecteur
    const rect = passwordField.getBoundingClientRect();
    selector.style.top = `${rect.bottom + window.scrollY + 5}px`;
    selector.style.left = `${rect.left + window.scrollX}px`;

    document.body.appendChild(selector);

    // Fermer au clic à l'extérieur
    setTimeout(() => {
        document.addEventListener(
            "click",
            (e) => {
                if (!selector.contains(e.target)) {
                    selector.remove();
                }
            },
            { once: true }
        );
    }, 100);
}

// Remplir le formulaire avec le mot de passe sélectionné
function fillFormWithPassword(passwordField, passwordData) {
    const form = passwordField.closest("form");
    if (!form) return;

    const fields = findFormFields(form);

    // Fonction pour remplir un champ avec tous les événements nécessaires
    const fillField = (field, value) => {
        if (!field || !value) return;

        // Focus sur le champ
        field.focus();

        // Mettre la valeur
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            "value"
        ).set;
        nativeInputValueSetter.call(field, value);

        // Déclencher tous les événements nécessaires pour les frameworks modernes
        const events = [
            new Event("input", { bubbles: true, cancelable: true }),
            new Event("change", { bubbles: true, cancelable: true }),
            new InputEvent("input", {
                bubbles: true,
                cancelable: true,
                inputType: "insertText",
                data: value,
            }),
            new KeyboardEvent("keydown", { bubbles: true, cancelable: true }),
            new KeyboardEvent("keyup", { bubbles: true, cancelable: true }),
        ];

        events.forEach((event) => field.dispatchEvent(event));

        // Blur pour valider
        setTimeout(() => field.blur(), 50);
    };

    // Remplir email OU username selon ce qui est disponible
    // Priorité : si le champ email existe et qu'on a un email dans les données, on l'utilise
    // Sinon, on utilise le username dans le champ username ou email
    if (fields.email) {
        // Si on a un champ email
        const valueToUse = passwordData.email || passwordData.username || "";
        fillField(fields.email, valueToUse);
    } else if (fields.username) {
        // Si on a un champ username mais pas de champ email
        const valueToUse = passwordData.email || passwordData.username || "";
        fillField(fields.username, valueToUse);
    }

    // Remplir le mot de passe après un délai pour permettre au premier champ de se valider
    setTimeout(() => {
        if (fields.password && passwordData.password) {
            fillField(fields.password, passwordData.password);
        }

        // Soumettre automatiquement le formulaire après un délai plus long
        setTimeout(() => {
            // Chercher le bouton de soumission
            const submitButton = form.querySelector(
                'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])'
            );

            if (submitButton && !submitButton.disabled) {
                // Simuler un clic sur le bouton de soumission
                submitButton.click();
            } else {
                // Fallback: soumettre le formulaire directement
                try {
                    form.submit();
                } catch (e) {
                    // Si la soumission échoue, essayer de déclencher l'événement submit
                    form.dispatchEvent(
                        new Event("submit", { bubbles: true, cancelable: true })
                    );
                }
            }
        }, 500);
    }, 200);
}

// Variable pour éviter les doubles déclenchements
let lastSubmissionTimestamp = 0;
let isProcessingSubmission = false;

// Détecter la soumission de formulaire pour proposer l'enregistrement
function setupFormSubmitListener(form) {
    if (form.dataset.memkeypassListener) return;
    form.dataset.memkeypassListener = "true";

    const storeFormDataForLater = () => {
        // Éviter les doubles déclenchements (moins de 500ms d'écart)
        const now = Date.now();
        if (isProcessingSubmission || now - lastSubmissionTimestamp < 500) {
            return;
        }

        isProcessingSubmission = true;
        lastSubmissionTimestamp = now;

        const fields = findFormFields(form);

        if (fields.password && fields.password.value) {
            // Détecter si c'est une inscription (plusieurs champs password) ou connexion
            const passwordFields = form.querySelectorAll(
                'input[type="password"]'
            );
            const isRegistration = passwordFields.length >= 2;

            const passwordData = {
                url: window.location.href,
                domain: window.location.hostname,
                username: fields.username?.value || "",
                email: fields.email?.value || "",
                password: fields.password.value,
                isRegistration: isRegistration,
                timestamp: Date.now(),
            };

            // Stocker dans le storage pour proposition manuelle
            chrome.storage.local.set({ lastFormData: passwordData });

            // Attendre un peu pour voir si la connexion réussit, puis proposer
            setTimeout(() => {
                showSavePasswordPrompt(passwordData);
                isProcessingSubmission = false;
            }, 1500);
        } else {
            isProcessingSubmission = false;
        }
    };

    // Écouter l'événement submit du formulaire
    form.addEventListener("submit", (e) => {
        storeFormDataForLater();
    });

    // Écouter aussi les clics sur les boutons de soumission
    const submitButtons = form.querySelectorAll(
        'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])'
    );

    submitButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            if (!button.disabled && button.type !== "reset") {
                // Délai court pour laisser le submit se déclencher d'abord
                setTimeout(storeFormDataForLater, 100);
            }
        });
    });

    // Écouter la touche Enter sur les champs input
    const allInputs = form.querySelectorAll("input");
    allInputs.forEach((input) => {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                // Délai court pour laisser le submit se déclencher d'abord
                setTimeout(storeFormDataForLater, 100);
            }
        });
    });
}

// Afficher une invite pour enregistrer le mot de passe
function showSavePasswordPrompt(passwordData) {
    // Vérifier si un prompt n'existe pas déjà
    const existingPrompt = document.querySelector(".memkeypass-save-prompt");
    if (existingPrompt) {
        return; // Ne pas afficher un deuxième prompt
    }

    // Vérifier si on n'a pas déjà un mot de passe pour ce site
    chrome.runtime.sendMessage(
        { action: "getPasswords", url: window.location.href },
        (response) => {
            // Si pas de réponse valide, proposer quand même d'enregistrer
            if (!response || !response.success) {
                // Continuer pour afficher le prompt
            } else if (response.passwords && response.passwords.length > 0) {
                // Il y a des mots de passe pour ce site, vérifier si c'est un doublon
                const exists = response.passwords.some((pwd) => {
                    const sameIdentifier =
                        (passwordData.username &&
                            pwd.username === passwordData.username) ||
                        (passwordData.email &&
                            pwd.email === passwordData.email);

                    if (passwordData.isRegistration) {
                        // Inscription : vérifier aussi le mot de passe pour détecter les doublons exacts
                        return (
                            sameIdentifier &&
                            pwd.password === passwordData.password
                        );
                    } else {
                        // Connexion : si on a déjà un mot de passe pour cet identifiant, ne rien proposer
                        return sameIdentifier;
                    }
                });

                if (exists) return;
            }
            // Sinon (aucun mot de passe pour ce site), continuer pour afficher le prompt

            // Vérifier à nouveau qu'un prompt n'a pas été créé entre temps
            if (document.querySelector(".memkeypass-save-prompt")) {
                return;
            }

            // Afficher l'invite
            const prompt = document.createElement("div");
            prompt.className = "memkeypass-save-prompt";
            prompt.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 3px solid #14b8a6;
        border-radius: 16px;
        box-shadow: 0 12px 32px rgba(20, 184, 166, 0.2);
        z-index: 10002;
        padding: 24px;
        max-width: 380px;
        animation: slideIn 0.3s ease;
      `;

            prompt.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 14px; margin-bottom: 18px;">
          <div style="background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="3" fill="white"/>
              <circle cx="7" cy="7" r="1.2" fill="#14b8a6"/>
              <rect x="6" y="7" width="2" height="12" fill="white"/>
              <rect x="4" y="17" width="2" height="2" fill="white"/>
              <rect x="4" y="14" width="2" height="2" fill="white"/>
              <rect x="8" y="15.5" width="2" height="2" fill="white"/>
            </svg>
          </div>
          <div style="flex: 1;">
            <div style="font-weight: 700; color: #0f172a; font-size: 18px; margin-bottom: 4px;">Enregistrer ce mot de passe</div>
            <div style="font-size: 14px; color: #64748b;">${escapeHtml(
                passwordData.domain
            )}</div>
          </div>
        </div>
        <div style="margin-bottom: 18px;">
          <input type="text" id="memkeypass-name" placeholder="Nom (ex: Facebook, Gmail...)" 
                 value="${escapeHtml(passwordData.domain)}" 
                 style="width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: all 0.2s; font-family: inherit;">
        </div>
        <div style="display: flex; gap: 10px;">
          <button id="memkeypass-save" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);">
            Enregistrer
          </button>
          <button id="memkeypass-cancel" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">
            Annuler
          </button>
        </div>
      `;

            document.body.appendChild(prompt);

            // Ajouter les effets hover
            const saveBtn = document.getElementById("memkeypass-save");
            const cancelBtn = document.getElementById("memkeypass-cancel");
            const nameInput = document.getElementById("memkeypass-name");

            saveBtn.addEventListener("mouseover", () => {
                saveBtn.style.background =
                    "linear-gradient(135deg, #0d9488 0%, #0e7490 100%)";
                saveBtn.style.transform = "translateY(-1px)";
                saveBtn.style.boxShadow = "0 4px 12px rgba(20, 184, 166, 0.4)";
            });
            saveBtn.addEventListener("mouseout", () => {
                saveBtn.style.background =
                    "linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
                saveBtn.style.transform = "translateY(0)";
                saveBtn.style.boxShadow = "0 2px 8px rgba(20, 184, 166, 0.3)";
            });

            cancelBtn.addEventListener("mouseover", () => {
                cancelBtn.style.background = "#e2e8f0";
            });
            cancelBtn.addEventListener("mouseout", () => {
                cancelBtn.style.background = "#f1f5f9";
            });

            nameInput.addEventListener("focus", () => {
                nameInput.style.borderColor = "#14b8a6";
                nameInput.style.boxShadow = "0 0 0 3px rgba(20, 184, 166, 0.1)";
            });
            nameInput.addEventListener("blur", () => {
                nameInput.style.borderColor = "#e2e8f0";
                nameInput.style.boxShadow = "none";
            });

            // Gérer les actions
            saveBtn.addEventListener("click", () => {
                const name = nameInput.value.trim();
                if (!name) {
                    alert("Veuillez entrer un nom");
                    return;
                }

                // Désactiver le bouton pendant le traitement
                saveBtn.disabled = true;
                saveBtn.textContent = "Enregistrement...";

                chrome.runtime.sendMessage(
                    {
                        action: "savePassword",
                        data: {
                            ...passwordData,
                            name,
                        },
                    },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error(
                                "Erreur runtime:",
                                chrome.runtime.lastError
                            );
                            alert("Erreur de communication avec l'extension");
                            saveBtn.disabled = false;
                            saveBtn.textContent = "Enregistrer";
                            return;
                        }

                        if (response && response.success) {
                            // Animation de succès
                            saveBtn.textContent = "✓ Enregistré !";
                            saveBtn.style.background = "#10b981";
                            setTimeout(() => {
                                prompt.remove();
                            }, 800);
                        } else {
                            alert(
                                "Erreur : " +
                                    (response?.error || "Erreur inconnue")
                            );
                            saveBtn.disabled = false;
                            saveBtn.textContent = "Enregistrer";
                        }
                    }
                );
            });

            cancelBtn.addEventListener("click", () => {
                prompt.remove();
            });

            // Auto-fermeture après 10 secondes
            setTimeout(() => {
                if (document.body.contains(prompt)) {
                    prompt.remove();
                }
            }, 10000);
        }
    );
}

// Fonction utilitaire pour échapper le HTML
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Écouter les messages du background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fillForm") {
        const forms = detectLoginForms();
        if (forms.length > 0) {
            const fields = findFormFields(forms[0]);
            if (fields.password) {
                fillFormWithPassword(fields.password, request.data);
                sendResponse({ success: true });
                return true;
            } else {
                sendResponse({
                    success: false,
                    error: "Aucun champ de mot de passe trouvé",
                });
            }
        } else {
            sendResponse({
                success: false,
                error: "Aucun formulaire de connexion trouvé",
            });
        }
    } else if (request.action === "updateButtonSettings") {
        // Mettre à jour les paramètres
        if (request.enabled !== undefined) {
            buttonSettings.enabled = request.enabled;
        }
        if (request.position !== undefined) {
            buttonSettings.position = request.position;
        }
        // Rafraîchir tous les boutons
        refreshButtons();
        sendResponse({ success: true });
    } else if (request.action === "getLastFormData") {
        // Récupérer les données du dernier formulaire soumis
        chrome.storage.local.get(["lastFormData"], (result) => {
            sendResponse({ success: true, data: result.lastFormData || null });
        });
        return true;
    }
    return true;
});

// Fonction pour rafraîchir tous les boutons
function refreshButtons() {
    // Supprimer tous les boutons existants
    document
        .querySelectorAll(".memkeypass-autofill-btn")
        .forEach((btn) => btn.remove());

    // Réinitialiser les markers
    document.querySelectorAll('input[type="password"]').forEach((field) => {
        delete field.dataset.memkeypassButton;
    });

    // Réinitialiser complètement
    init();
}

// Initialiser quand la page est prête
function init() {
    // Charger les paramètres du bouton
    chrome.storage.local.get(["buttonEnabled"], (result) => {
        buttonSettings.enabled =
            result.buttonEnabled !== undefined ? result.buttonEnabled : true;

        // Vérifier l'authentification
        chrome.runtime.sendMessage({ action: "checkAuth" }, (authResponse) => {
            if (!authResponse || !authResponse.isAuthenticated) {
                // Pas connecté, ne pas afficher les boutons
                return;
            }

            // Vérifier s'il y a des mots de passe pour ce site
            chrome.runtime.sendMessage(
                { action: "getPasswords", url: window.location.href },
                (passwordsResponse) => {
                    const hasPasswords =
                        passwordsResponse &&
                        passwordsResponse.success &&
                        passwordsResponse.passwords &&
                        passwordsResponse.passwords.length > 0;

                    const forms = detectLoginForms();

                    forms.forEach((form) => {
                        const fields = findFormFields(form);

                        if (fields.password) {
                            addMemKeyPassButton(fields.password, hasPasswords);
                            setupFormSubmitListener(form);
                        }
                    });
                }
            );
        });
    });
}

// Observer les changements du DOM pour les SPAs
const observer = new MutationObserver((mutations) => {
    let shouldInit = false;

    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (
                node.nodeType === 1 &&
                (node.tagName === "FORM" || node.querySelector("form"))
            ) {
                shouldInit = true;
            }
        });
    });

    if (shouldInit) {
        setTimeout(init, 500);
    }
});

// Démarrer l'observation
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

// Initialiser immédiatement
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// Ajouter les styles CSS
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  .memkeypass-autofill-btn:hover {
    background: linear-gradient(135deg, #0d9488 0%, #0e7490 100%) !important;
    box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4) !important;
  }
  
  .memkeypass-autofill-btn:active {
    box-shadow: 0 2px 6px rgba(20, 184, 166, 0.3) !important;
  }

  .memkeypass-selector::-webkit-scrollbar {
    width: 8px;
  }

  .memkeypass-selector::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 8px;
  }

  .memkeypass-selector::-webkit-scrollbar-thumb {
    background: #14b8a6;
    border-radius: 8px;
  }

  .memkeypass-selector::-webkit-scrollbar-thumb:hover {
    background: #0d9488;
  }
`;
document.head.appendChild(style);
