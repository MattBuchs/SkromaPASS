// Content Script pour détecter et remplir les formulaires de connexion

// Variables globales pour les paramètres
let buttonSettings = {
	enabled: true,
	position: "auto",
};
let autoSubmitEnabled = true;

// Écouter les messages de la page web (pour la connexion via le site)
window.addEventListener("message", (event) => {
	console.log(
		"[MemKeyPass Content] Message reçu:",
		event.origin,
		event.data?.type,
	);

	// Vérifier l'origine pour la sécurité (uniquement depuis memkeypass.fr)
	if (
		event.origin !== "https://memkeypass.fr" &&
		event.origin !== "http://localhost:3000"
	) {
		console.log("[MemKeyPass Content] Origine rejetée:", event.origin);
		return;
	}

	if (
		event.data &&
		event.data.type === "MEMKEYPASS_LOGIN_TOKEN" &&
		event.data.token
	) {
		console.log("[MemKeyPass Content] Token reçu, envoi au background...");

		// Envoyer le token à l'extension background
		chrome.runtime.sendMessage(
			{
				action: "loginViaToken",
				token: event.data.token,
				user: event.data.user,
			},
			(response) => {
				console.log(
					"[MemKeyPass Content] Réponse du background:",
					response,
				);

				if (response && response.success) {
					console.log(
						"[MemKeyPass Content] Extension connectée avec succès!",
					);
					// Nettoyer le flag de connexion en attente
					chrome.storage.local.remove(["pendingSiteLogin"]);
				} else {
					console.error(
						"[MemKeyPass Content] Échec de connexion:",
						response,
					);
				}
			},
		);
	}
});

// Fonction pour extraire un nom de site propre depuis un hostname
function extractSiteName(hostname) {
	// Supprimer www. au début
	let name = hostname.replace(/^www\./i, "");

	// Extraire le nom principal (avant le TLD)
	// Ex: github.com -> github, google.co.uk -> google
	const parts = name.split(".");

	// Si c'est un domaine avec un TLD connu de 2 parties (co.uk, com.au, etc.)
	if (parts.length > 2 && parts[parts.length - 2].length <= 3) {
		return parts[parts.length - 3];
	}

	// Sinon, prendre la première partie
	return parts[0];
}

// Fonction pour capitaliser la première lettre
function capitalizeSiteName(name) {
	return name.charAt(0).toUpperCase() + name.slice(1);
}

// Détecter les formulaires de connexion sur la page
function detectLoginForms() {
	const forms = document.querySelectorAll("form");
	const loginForms = [];

	// Mots-clés d'inscription dans le texte visible de la page / url
	const REG_KEYWORDS =
		/register|signup|sign.?up|creat|inscri|join|s'inscrire|créer|nouveau compte|new account/i;

	forms.forEach((form) => {
		const inputs = form.querySelectorAll("input");
		let hasPassword = false;
		let hasEmail = false;
		let hasUsername = false;
		let passwordCount = 0;
		let hasNameField = false; // prénom / nom → signe fort d'inscription
		let hasNewPasswordAutocomplete = false; // autocomplete="new-password"
		let hasConfirmField = false; // champ confirm / repeat

		inputs.forEach((input) => {
			const type = input.type.toLowerCase();
			const name = input.name.toLowerCase();
			const id = input.id.toLowerCase();
			const placeholder = input.placeholder?.toLowerCase() || "";
			const autocomplete = (input.autocomplete || "").toLowerCase();
			const label = (() => {
				if (input.id) {
					const lbl = document.querySelector(
						`label[for="${CSS.escape(input.id)}"]`,
					);
					return lbl ? lbl.textContent.toLowerCase() : "";
				}
				return "";
			})();

			if (type === "password") {
				hasPassword = true;
				passwordCount++;
				if (autocomplete === "new-password")
					hasNewPasswordAutocomplete = true;
				if (
					name.includes("confirm") ||
					name.includes("repeat") ||
					name.includes("verif") ||
					id.includes("confirm") ||
					id.includes("repeat") ||
					id.includes("verif") ||
					placeholder.includes("confirm") ||
					placeholder.includes("répét") ||
					placeholder.includes("verify") ||
					label.includes("confirm") ||
					label.includes("répét")
				) {
					hasConfirmField = true;
				}
			} else if (
				type === "email" ||
				name.includes("email") ||
				id.includes("email") ||
				placeholder.includes("email") ||
				autocomplete === "email"
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

			// Champ prénom / nom → indique clairement une inscription
			if (
				autocomplete === "given-name" ||
				autocomplete === "family-name" ||
				autocomplete === "name" ||
				name.includes("first") ||
				name.includes("last") ||
				name.includes("prenom") ||
				name.includes("prénom") ||
				name.includes("fname") ||
				name.includes("lname") ||
				id.includes("first") ||
				id.includes("last") ||
				id.includes("prenom") ||
				id.includes("prénom") ||
				placeholder.includes("prénom") ||
				placeholder.includes("prenom") ||
				placeholder.includes("first name") ||
				placeholder.includes("last name") ||
				label.includes("prénom") ||
				label.includes("prenom") ||
				label.includes("nom") ||
				label.includes("first name")
			) {
				hasNameField = true;
			}
		});

		if (!hasPassword) return;

		// Signal fort : bouton submit avec mots-clés d'inscription
		const submitBtns = form.querySelectorAll(
			'button[type="submit"], button:not([type]), input[type="submit"]',
		);
		let isRegistrationByButton = false;
		submitBtns.forEach((btn) => {
			const txt = (btn.textContent || btn.value || "").toLowerCase();
			if (REG_KEYWORDS.test(txt)) isRegistrationByButton = true;
		});

		// Signal fort : action/id/class du formulaire
		const formAttr = [
			form.action || "",
			form.id || "",
			form.className || "",
			form.getAttribute("name") || "",
		]
			.join(" ")
			.toLowerCase();
		const isRegistrationByForm = REG_KEYWORDS.test(formAttr);

		// Combiner tous les signaux
		const isRegistration =
			passwordCount >= 2 ||
			hasConfirmField ||
			hasNewPasswordAutocomplete ||
			hasNameField ||
			isRegistrationByButton ||
			isRegistrationByForm;

		if (hasPassword && (hasEmail || hasUsername)) {
			loginForms.push({ form, isRegistration });
		} else if (passwordCount >= 2 || (hasPassword && isRegistration)) {
			loginForms.push({ form, isRegistration: true });
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
			Math.min(newLeft, parentRect.width - buttonWidth),
		);
		newTop = Math.max(
			-buttonHeight / 8,
			Math.min(newTop, parentRect.height + buttonHeight / 8),
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
								response.passwords,
							);
						} else {
							alert("Aucun mot de passe enregistré pour ce site");
						}
					},
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
			pwd.name,
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
			{ once: true },
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
			"value",
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

		// Soumission automatique conditionnelle
		if (autoSubmitEnabled) {
			setTimeout(() => {
				const submitButton = form.querySelector(
					'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])',
				);

				if (submitButton && !submitButton.disabled) {
					submitButton.click();
				} else {
					try {
						form.submit();
					} catch (e) {
						form.dispatchEvent(
							new Event("submit", {
								bubbles: true,
								cancelable: true,
							}),
						);
					}
				}
			}, 500);
		}
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
				'input[type="password"]',
			);
			const isRegistration = passwordFields.length >= 2;

			const siteName = capitalizeSiteName(
				extractSiteName(window.location.hostname),
			);

			const passwordData = {
				url: window.location.href,
				domain: window.location.hostname,
				siteName: siteName,
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
		'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])',
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

			// Avant d'afficher, vérifier les préférences (site ignoré / snooze)
			chrome.storage.local.get(
				["noPromptDomains", "snoozeMap"],
				(prefs) => {
					const noPrompt = Array.isArray(prefs.noPromptDomains)
						? prefs.noPromptDomains.includes(passwordData.domain)
						: false;
					const snoozeUntil =
						prefs.snoozeMap?.[passwordData.domain] || 0;
					const snoozed = Date.now() < snoozeUntil;
					if (noPrompt || snoozed) return;

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
				passwordData.domain,
			)}</div>
          </div>
        </div>
        <div style="margin-bottom: 18px;">
          <input type="text" id="memkeypass-name" placeholder="Nom (ex: Facebook, Gmail...)" 
                 value="${escapeHtml(
						passwordData.siteName || passwordData.domain,
					)}" 
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
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button id="memkeypass-snooze" style="flex:1; padding:10px; background:#fff7ed; color:#9a3412; border:2px solid #fdba74; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">Rappeler plus tard</button>
          <button id="memkeypass-never" style="flex:1; padding:10px; background:#fef2f2; color:#991b1b; border:2px solid #fecaca; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">Ne plus proposer pour ce site</button>
        </div>
      `;

					document.body.appendChild(prompt);

					// Ajouter les effets hover
					const saveBtn = document.getElementById("memkeypass-save");
					const cancelBtn =
						document.getElementById("memkeypass-cancel");
					const nameInput =
						document.getElementById("memkeypass-name");

					saveBtn.addEventListener("mouseover", () => {
						saveBtn.style.background =
							"linear-gradient(135deg, #0d9488 0%, #0e7490 100%)";
						saveBtn.style.transform = "translateY(-1px)";
						saveBtn.style.boxShadow =
							"0 4px 12px rgba(20, 184, 166, 0.4)";
					});
					saveBtn.addEventListener("mouseout", () => {
						saveBtn.style.background =
							"linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
						saveBtn.style.transform = "translateY(0)";
						saveBtn.style.boxShadow =
							"0 2px 8px rgba(20, 184, 166, 0.3)";
					});

					cancelBtn.addEventListener("mouseover", () => {
						cancelBtn.style.background = "#e2e8f0";
					});
					cancelBtn.addEventListener("mouseout", () => {
						cancelBtn.style.background = "#f1f5f9";
					});

					nameInput.addEventListener("focus", () => {
						nameInput.style.borderColor = "#14b8a6";
						nameInput.style.boxShadow =
							"0 0 0 3px rgba(20, 184, 166, 0.1)";
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
										chrome.runtime.lastError,
									);
									alert(
										"Erreur de communication avec l'extension",
									);
									saveBtn.disabled = false;
									saveBtn.textContent = "Enregistrer";
									return;
								}

								if (response && response.success) {
									// Animation de succès
									saveBtn.textContent = "✓ Enregistré !";
									saveBtn.style.background = "#10b981";
									chrome.storage.local.remove([
										"lastFormData",
									]);
									setTimeout(() => {
										prompt.remove();
									}, 800);
								} else {
									alert(
										"Erreur : " +
											(response?.error ||
												"Erreur inconnue"),
									);
									saveBtn.disabled = false;
									saveBtn.textContent = "Enregistrer";
								}
							},
						);
					});

					cancelBtn.addEventListener("click", () => {
						prompt.remove();
						chrome.storage.local.remove(["lastFormData"]);
					});

					// Snooze (rappeler plus tard)
					const snoozeBtn =
						document.getElementById("memkeypass-snooze");
					snoozeBtn.addEventListener("click", () => {
						chrome.storage.local.get(["snoozeMap"], (res) => {
							const map = res.snoozeMap || {};
							map[passwordData.domain] =
								Date.now() + 30 * 60 * 1000; // 30 minutes
							chrome.storage.local.set({ snoozeMap: map }, () => {
								chrome.storage.local.remove(["lastFormData"]);
								prompt.remove();
							});
						});
					});

					// Ne jamais proposer pour ce site
					const neverBtn =
						document.getElementById("memkeypass-never");
					neverBtn.addEventListener("click", () => {
						chrome.storage.local.get(["noPromptDomains"], (res) => {
							const list = Array.isArray(res.noPromptDomains)
								? res.noPromptDomains
								: [];
							if (!list.includes(passwordData.domain)) {
								list.push(passwordData.domain);
							}
							chrome.storage.local.set(
								{ noPromptDomains: list },
								() => {
									chrome.storage.local.remove([
										"lastFormData",
									]);
									prompt.remove();
								},
							);
						});
					});
				},
			);
		},
	);
}

// =====================================================================
// Formulaires d'INSCRIPTION : bouton générateur de mot de passe
// =====================================================================

// Ajouter un bouton générateur pour les formulaires d'inscription
function addRegistrationButton(form, passwordField) {
	if (passwordField.dataset.memkeypassRegButton) return;
	passwordField.dataset.memkeypassRegButton = "true";

	const button = document.createElement("button");
	button.type = "button";
	button.className = "memkeypass-autofill-btn";
	button.title = "Générer un mot de passe avec MemKeyPass";

	button.style.cssText = `
    background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
    border: none;
    border-radius: 6px;
    cursor: grab;
    width: 28px;
    height: 28px;
    position: fixed;
    z-index: 2147483647;
    box-shadow: 0 2px 8px rgba(20, 184, 166, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: background 0.2s ease;
  `;

	button.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="15.5" cy="8.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="8.5" cy="15.5" r="1.5" fill="white" stroke="none"/>
      <circle cx="12" cy="12" r="1.5" fill="white" stroke="none"/>
    </svg>
  `;

	// Position initiale (calculée après appendChild)
	const MAX_DRAG_RADIUS = 100; // rayon max de déplacement en pixels
	let isDragging = false;
	let dragStartTime = 0;
	let startMouseX = 0;
	let startMouseY = 0;
	let startBtnX = 0;
	let startBtnY = 0;
	let hasMoved = false;
	let userMoved = false; // l'utilisateur a manuellement déplacé le bouton
	let originX = null; // position d'ancrage initiale (près du champ)
	let originY = null;

	function positionButton() {
		if (!passwordField.isConnected) {
			cleanup();
			button.remove();
			return;
		}
		// Ne repositionner sur le champ que si l'utilisateur n'a pas déplacé le bouton
		if (!userMoved) {
			const rect = passwordField.getBoundingClientRect();
			const newLeft = rect.right - 34;
			const newTop = rect.top + (rect.height - 28) / 2;
			button.style.left = newLeft + "px";
			button.style.top = newTop + "px";
			originX = newLeft;
			originY = newTop;
		}
	}

	positionButton();
	document.body.appendChild(button);

	// Ajouter du padding à droite pour ne pas masquer le texte
	passwordField.style.paddingRight = "36px";

	const onScroll = () => positionButton();
	const onResize = () => positionButton();
	window.addEventListener("scroll", onScroll, {
		passive: true,
		capture: true,
	});
	window.addEventListener("resize", onResize, { passive: true });

	function cleanup() {
		window.removeEventListener("scroll", onScroll, true);
		window.removeEventListener("resize", onResize);
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
		if (passwordField.isConnected) {
			passwordField.style.paddingRight = "";
		}
	}
	button._mkpCleanup = cleanup;

	button.addEventListener("mousedown", (e) => {
		isDragging = true;
		hasMoved = false;
		dragStartTime = Date.now();
		startMouseX = e.clientX;
		startMouseY = e.clientY;
		const btnRect = button.getBoundingClientRect();
		startBtnX = btnRect.left;
		startBtnY = btnRect.top;
		button.style.cursor = "grabbing";
		button.style.transition = "none";
		e.preventDefault();
		e.stopPropagation();
	});

	function onMouseMove(e) {
		if (!isDragging) return;
		const dx = e.clientX - startMouseX;
		const dy = e.clientY - startMouseY;
		if (Math.abs(dx) + Math.abs(dy) > 5) hasMoved = true;

		let newLeft = startBtnX + dx;
		let newTop = startBtnY + dy;

		// Limiter le déplacement dans un rayon autour de la position d'origine
		if (originX !== null) {
			const ox = newLeft - originX;
			const oy = newTop - originY;
			const dist = Math.sqrt(ox * ox + oy * oy);
			if (dist > MAX_DRAG_RADIUS) {
				newLeft = originX + (ox / dist) * MAX_DRAG_RADIUS;
				newTop = originY + (oy / dist) * MAX_DRAG_RADIUS;
			}
		}

		// Garder dans la fenêtre
		newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 28));
		newTop = Math.max(0, Math.min(newTop, window.innerHeight - 28));

		button.style.left = newLeft + "px";
		button.style.top = newTop + "px";
		userMoved = true;
	}

	function onMouseUp(e) {
		if (!isDragging) return;
		isDragging = false;
		button.style.cursor = "grab";
		button.style.transition = "background 0.2s ease";

		if (!hasMoved || Date.now() - dragStartTime < 200) {
			// Clic : ouvrir le popup générateur
			chrome.runtime.sendMessage({ action: "openGeneratorForSignup" });
		}
	}

	document.addEventListener("mousemove", onMouseMove);
	document.addEventListener("mouseup", onMouseUp);
}

// Générer un mot de passe fort (cryptographiquement sûr)
function generateStrongPassword(
	length,
	useUppercase,
	useDigits,
	useSymbols,
	excludeAmbiguous,
) {
	let lowercase = excludeAmbiguous
		? "abcdefghjkmnpqrstuvwxyz"
		: "abcdefghijklmnopqrstuvwxyz";
	const uppercase = excludeAmbiguous
		? "ABCDEFGHJKLMNPQRSTUVWXYZ"
		: "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const digits = excludeAmbiguous ? "23456789" : "0123456789";
	const symbols = "!@#$%^&*()-_=+";

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

function calcPasswordStrength(password) {
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
	return levels.find((l) => score <= l.max);
}

// Afficher le générateur en overlay sur la page
function showInPagePasswordGenerator(form) {
	const existingGen = document.getElementById("memkeypass-reg-generator");
	if (existingGen) {
		existingGen.remove();
		return;
	}

	let currentPassword = generateStrongPassword(16, true, true, false, false);

	const overlay = document.createElement("div");
	overlay.id = "memkeypass-reg-generator";
	overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border: 3px solid #8b5cf6;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(139, 92, 246, 0.25);
    z-index: 10002;
    padding: 20px;
    width: 340px;
    animation: slideIn 0.3s ease;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 14px;
  `;

	overlay.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
      <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.5L12 17l-6.2 4.4 2.4-7.5L2 9.4h7.6z"/></svg></div>
      <div style="flex:1;">
        <div style="font-weight:700; color:#0f172a; font-size:15px;">Générateur de mot de passe</div>
        <div style="font-size:12px; color:#64748b;">Formulaire d'inscription détecté</div>
      </div>
      <button id="mkp-gen-close" style="background:none; border:none; cursor:pointer; font-size:18px; color:#94a3b8; padding:2px 6px; line-height:1;">✕</button>
    </div>

    <div style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="mkp-gen-pwd" readonly value="${escapeHtml(currentPassword)}"
             style="flex:1; padding:10px; border:2px solid #8b5cf6; border-radius:8px;
                    font-family:monospace; font-size:13px; font-weight:600;
                    background:#faf5ff; color:#5b21b6; min-width:0; outline:none; letter-spacing:0.3px;" />
      <button id="mkp-gen-regen" style="background:#f3e8ff; border:none; border-radius:8px; cursor:pointer; padding:10px 12px; color:#7c3aed; flex-shrink:0; display:flex; align-items:center; justify-content:center;" title="Regénérer"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></button>
    </div>

    <div style="height:6px; background:#e0e0e0; border-radius:3px; overflow:hidden; margin-bottom:6px;">
      <div id="mkp-gen-bar" style="height:100%; border-radius:3px; transition:all 0.3s;"></div>
    </div>
    <div id="mkp-gen-label" style="font-size:12px; margin-bottom:12px; text-align:center; font-weight:500;"></div>

    <div style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
        <span style="font-size:13px; font-weight:500; color:#333;">Longueur</span>
        <span id="mkp-gen-len-display" style="font-size:13px; font-weight:700; color:#8b5cf6;">16</span>
      </div>
      <input type="range" id="mkp-gen-len" min="8" max="64" value="16" style="width:100%; accent-color:#8b5cf6;" />
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:14px; font-size:13px;">
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;">
        <input type="checkbox" id="mkp-gen-upper" checked style="accent-color:#8b5cf6; cursor:pointer;" /> Majuscules
      </label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;">
        <input type="checkbox" id="mkp-gen-digits" checked style="accent-color:#8b5cf6; cursor:pointer;" /> Chiffres
      </label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;">
        <input type="checkbox" id="mkp-gen-symbols" style="accent-color:#8b5cf6; cursor:pointer;" /> Symboles
      </label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;">
        <input type="checkbox" id="mkp-gen-readable" style="accent-color:#8b5cf6; cursor:pointer;" /> Lisible
      </label>
    </div>

    <div style="display:flex; gap:10px;">
      <button id="mkp-gen-use" style="flex:2; padding:12px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px; transition:all 0.2s;">
        ✓ Utiliser ce mot de passe
      </button>
      <button id="mkp-gen-copy" style="flex:1; padding:12px; background:#f3e8ff; color:#7c3aed; border:2px solid #ddd6fe; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px; display:flex; align-items:center; justify-content:center; gap:6px;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copier</button>
    </div>
  `;

	document.body.appendChild(overlay);

	const pwdInput = overlay.querySelector("#mkp-gen-pwd");
	const lenSlider = overlay.querySelector("#mkp-gen-len");
	const lenDisplay = overlay.querySelector("#mkp-gen-len-display");

	function refreshPwd() {
		const len = parseInt(lenSlider.value, 10);
		const up = overlay.querySelector("#mkp-gen-upper").checked;
		const dg = overlay.querySelector("#mkp-gen-digits").checked;
		const sy = overlay.querySelector("#mkp-gen-symbols").checked;
		const rd = overlay.querySelector("#mkp-gen-readable").checked;
		currentPassword = generateStrongPassword(len, up, dg, sy, rd);
		pwdInput.value = currentPassword;
		lenDisplay.textContent = len;
		const s = calcPasswordStrength(currentPassword);
		overlay.querySelector("#mkp-gen-bar").style.cssText =
			`height:100%; border-radius:3px; transition:all 0.3s; width:${s.pct}%; background:${s.color};`;
		const lbl = overlay.querySelector("#mkp-gen-label");
		lbl.textContent = `Force : ${s.label}`;
		lbl.style.color = s.color;
	}

	// Initialiser la barre de force
	refreshPwd();

	overlay
		.querySelector("#mkp-gen-regen")
		.addEventListener("click", refreshPwd);
	lenSlider.addEventListener("input", refreshPwd);
	[
		"#mkp-gen-upper",
		"#mkp-gen-digits",
		"#mkp-gen-symbols",
		"#mkp-gen-readable",
	].forEach((id) => {
		overlay.querySelector(id).addEventListener("change", refreshPwd);
	});

	overlay.querySelector("#mkp-gen-copy").addEventListener("click", () => {
		navigator.clipboard.writeText(currentPassword).then(() => {
			const btn = overlay.querySelector("#mkp-gen-copy");
			btn.innerHTML = "&#10003; Copié !";
			setTimeout(
				() =>
					(btn.innerHTML =
						'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copier'),
				1500,
			);
		});
	});

	overlay.querySelector("#mkp-gen-use").addEventListener("click", () => {
		// Remplir tous les champs password du formulaire
		const pwdFields = form.querySelectorAll('input[type="password"]');
		pwdFields.forEach((field) => {
			field.focus();
			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			).set;
			setter.call(field, currentPassword);
			field.dispatchEvent(new Event("input", { bubbles: true }));
			field.dispatchEvent(new Event("change", { bubbles: true }));
		});
		overlay.remove();
	});

	overlay
		.querySelector("#mkp-gen-close")
		.addEventListener("click", () => overlay.remove());

	// Fermer en cliquant en dehors
	setTimeout(() => {
		document.addEventListener(
			"click",
			(e) => {
				if (!overlay.contains(e.target)) overlay.remove();
			},
			{ once: true },
		);
	}, 100);
}

// =====================================================================
// Fonction utilitaire pour échapper le HTML
// =====================================================================
function escapeHtml(text) {
	const div = document.createElement("div");
	div.textContent = text;
	return div.innerHTML;
}

// Écouter les messages du background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "fillForm") {
		const formEntries = detectLoginForms();
		if (formEntries.length > 0) {
			const fields = findFormFields(formEntries[0].form);
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
	} else if (request.action === "showSelectorKeyboard") {
		// Réponse au raccourci Alt+Shift+F : afficher le sélecteur directement
		const formEntries = detectLoginForms();
		if (formEntries.length > 0) {
			const fields = findFormFields(formEntries[0].form);
			if (
				fields.password &&
				request.passwords &&
				request.passwords.length > 0
			) {
				showPasswordSelector(fields.password, request.passwords);
				sendResponse({ success: true });
				return true;
			}
		}
		sendResponse({ success: false });
	} else if (request.action === "fillSignupPassword") {
		// Remplir les champs password du formulaire d'inscription depuis le popup
		const formEntries = detectLoginForms();
		const regForm =
			formEntries.find((e) => e.isRegistration) || formEntries[0];
		if (regForm) {
			const pwdFields = regForm.form.querySelectorAll(
				'input[type="password"]',
			);
			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			).set;
			pwdFields.forEach((field) => {
				field.focus();
				setter.call(field, request.password);
				field.dispatchEvent(new Event("input", { bubbles: true }));
				field.dispatchEvent(new Event("change", { bubbles: true }));
			});
			sendResponse({ success: true });
		} else {
			sendResponse({ success: false });
		}
		return true;
	} else if (request.action === "updateButtonSettings") {
		// Mettre à jour les paramètres
		if (request.enabled !== undefined) {
			buttonSettings.enabled = request.enabled;
		}
		if (request.position !== undefined) {
			buttonSettings.position = request.position;
		}
		if (request.autoSubmitEnabled !== undefined) {
			autoSubmitEnabled = request.autoSubmitEnabled;
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
	// Supprimer tous les boutons existants (et nettoyer les listeners des boutons fixes)
	document.querySelectorAll(".memkeypass-autofill-btn").forEach((btn) => {
		if (btn._mkpCleanup) btn._mkpCleanup();
		btn.remove();
	});

	// Réinitialiser les markers
	document.querySelectorAll('input[type="password"]').forEach((field) => {
		delete field.dataset.memkeypassButton;
		delete field.dataset.memkeypassRegButton;
	});

	// Réinitialiser complètement
	init();
}

// Initialiser quand la page est prête
function init() {
	// Charger les paramètres du bouton
	chrome.storage.local.get(
		["buttonEnabled", "autoSubmitEnabled"],
		(result) => {
			buttonSettings.enabled =
				result.buttonEnabled !== undefined
					? result.buttonEnabled
					: true;
			autoSubmitEnabled =
				result.autoSubmitEnabled !== undefined
					? result.autoSubmitEnabled
					: true;

			// Vérifier l'authentification
			chrome.runtime.sendMessage(
				{ action: "checkAuth" },
				(authResponse) => {
					if (!authResponse || !authResponse.isAuthenticated) {
						// Essayer la connexion via la session du site si on est sur memkeypass
						const host = window.location.hostname;
						const isMemKeyPass =
							/(^|\.)memkeypass\.fr$/.test(host) ||
							(host === "localhost" &&
								window.location.port === "3000");

						if (isMemKeyPass) {
							trySiteSessionLogin();
						}
						// Pas connecté, ne pas afficher les boutons ailleurs
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

							const formEntries = detectLoginForms();

							formEntries.forEach(({ form, isRegistration }) => {
								const fields = findFormFields(form);

								if (fields.password) {
									if (isRegistration) {
										addRegistrationButton(
											form,
											fields.password,
										);
									} else {
										addMemKeyPassButton(
											fields.password,
											hasPasswords,
										);
									}
									setupFormSubmitListener(form);
								}
							});

							chrome.storage.local.get(
								["lastFormData"],
								(result) => {
									const data = result.lastFormData;
									if (
										data &&
										Date.now() - data.timestamp <
											5 * 60 * 1000 &&
										data.domain ===
											window.location.hostname &&
										!(
											Array.isArray(
												result.noPromptDomains,
											) &&
											result.noPromptDomains.includes(
												data.domain,
											)
										) &&
										!document.querySelector(
											".memkeypass-save-prompt",
										)
									) {
										showSavePasswordPrompt(data);
									}
								},
							);
						},
					);
				},
			);
		},
	);
}

// Tenter d'obtenir un token extension depuis la session du site
async function trySiteSessionLogin() {
	try {
		console.log("[MemKeyPass Content] trySiteSessionLogin() appelée");

		const origin = window.location.origin;
		console.log(
			"[MemKeyPass Content] Appel API:",
			`${origin}/api/auth/extension/session-token`,
		);

		const res = await fetch(`${origin}/api/auth/extension/session-token`, {
			credentials: "include",
		});

		console.log("[MemKeyPass Content] Réponse API:", res.status);

		if (res.ok) {
			const data = await res.json();
			console.log("[MemKeyPass Content] Données reçues:", data);

			if (data && data.success && data.token) {
				console.log(
					"[MemKeyPass Content] Envoi au background via loginViaToken...",
				);

				chrome.runtime.sendMessage(
					{
						action: "loginViaToken",
						token: data.token,
						user: data.user,
					},
					(response) => {
						console.log(
							"[MemKeyPass Content] Réponse background:",
							response,
						);
						// Nettoyer le flag éventuel
						chrome.storage.local.remove(
							["pendingSiteLogin"],
							() => {
								console.log(
									"[MemKeyPass Content] Flag pendingSiteLogin nettoyé",
								);
							},
						);
					},
				);
			} else {
				console.error(
					"[MemKeyPass Content] Token invalide ou manquant dans la réponse",
				);
			}
		} else {
			console.error(
				"[MemKeyPass Content] Erreur API:",
				res.status,
				res.statusText,
			);
		}
	} catch (e) {
		console.error(
			"[MemKeyPass Content] Exception dans trySiteSessionLogin:",
			e,
		);
	}
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

// Si on est sur memkeypass.fr et qu'il y a un flag de connexion en attente, essayer de se connecter
if (
	window.location.hostname === "memkeypass.fr" ||
	window.location.hostname === "localhost"
) {
	console.log(
		"[MemKeyPass Content] Sur memkeypass.fr, vérification du flag pendingSiteLogin...",
	);

	chrome.storage.local.get(["pendingSiteLogin"], (result) => {
		console.log(
			"[MemKeyPass Content] Flag pendingSiteLogin:",
			result.pendingSiteLogin,
		);

		if (result.pendingSiteLogin) {
			console.log(
				"[MemKeyPass Content] Tentative de connexion dans 1 seconde...",
			);
			// Attendre un peu que la page soit complètement chargée
			setTimeout(trySiteSessionLogin, 1000);
		}
	});
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
