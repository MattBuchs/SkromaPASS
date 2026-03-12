// =====================================================================
// content.js  Coordinateur principal : messages, init, SPA observer
// Dépend de : content-utils.js, content-forms.js, content-autofill.js,
//             content-save.js, content-styles.js
// =====================================================================

// Ecouter les messages de la page web (connexion via le site memkeypass.fr)
window.addEventListener("message", (event) => {
	if (
		event.origin !== "https://memkeypass.fr" &&
		event.origin !== "http://localhost:3000"
	) {
		return;
	}

	if (event.data?.type === "MEMKEYPASS_LOGIN_TOKEN" && event.data.token) {
		chrome.runtime.sendMessage(
			{
				action: "loginViaToken",
				token: event.data.token,
				user: event.data.user,
			},
			(response) => {
				if (response && response.success) {
					chrome.storage.local.remove(["pendingSiteLogin"]);
				}
			},
		);
	}
});

// Ecouter les messages du background script et du popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "fillForm") {
		const formEntries = detectLoginForms();
		if (formEntries.length > 0) {
			const fields = findFormFields(formEntries[0].form);
			if (fields.password) {
				document
					.querySelectorAll(".memkeypass-autofill-btn")
					.forEach((btn) => {
						if (btn._mkpCleanup) btn._mkpCleanup();
						btn.remove();
					});
				fillFormWithPassword(fields.password, request.data);
				sendResponse({ success: true });
				return true;
			}
		}
		sendResponse({ success: false, error: "Aucun formulaire trouve" });
	} else if (request.action === "showSelectorKeyboard") {
		const formEntries = detectLoginForms();
		if (formEntries.length > 0) {
			const fields = findFormFields(formEntries[0].form);
			if (fields.password && request.passwords?.length > 0) {
				showPasswordSelector(fields.password, request.passwords);
				sendResponse({ success: true });
				return true;
			}
		}
		sendResponse({ success: false });
	} else if (request.action === "fillSignupPassword") {
		const formEntries = detectLoginForms();
		const regForm =
			formEntries.find((e) => e.isRegistration) || formEntries[0];
		if (regForm) {
			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				"value",
			).set;
			regForm.form
				.querySelectorAll('input[type="password"]')
				.forEach((field) => {
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
		let needsRefresh = false;
		if (request.enabled !== undefined) {
			buttonSettings.enabled = request.enabled;
			needsRefresh = true;
		}
		if (request.signupButtonEnabled !== undefined) {
			buttonSettings.signupButtonEnabled = request.signupButtonEnabled;
			needsRefresh = true;
		}
		if (request.position !== undefined) {
			buttonSettings.position = request.position;
			needsRefresh = true;
		}
		if (request.autoSubmitEnabled !== undefined) {
			autoSubmitEnabled = request.autoSubmitEnabled;
			// autoSubmitEnabled n'affecte pas l'affichage des boutons, pas de refresh nécessaire
		}
		if (needsRefresh) refreshButtons();
		sendResponse({ success: true });
	} else if (request.action === "getLastFormData") {
		chrome.storage.local.get(["lastFormData"], (result) => {
			sendResponse({ success: true, data: result.lastFormData || null });
		});
		return true;
	}
	return true;
});

// Supprimer tous les boutons et les ré-ajouter avec les paramètres courants
// (sans relire le storage pour éviter une race-condition avec le popup)
function refreshButtons() {
	document.querySelectorAll(".memkeypass-autofill-btn").forEach((btn) => {
		if (btn._mkpCleanup) btn._mkpCleanup();
		btn.remove();
	});
	document.querySelectorAll('input[type="password"]').forEach((field) => {
		delete field.dataset.memkeypassButton;
		delete field.dataset.memkeypassRegButton;
	});

	// Ré-ajouter le bouton générateur (inscription) avec les settings déjà à jour
	detectLoginForms().forEach(({ form }) => {
		const fields = findFormFields(form);
		if (fields.password) {
			addRegistrationButton(form, fields.password);
			setupFormSubmitListener(form);
		}
	});

	// Ré-ajouter le bouton remplissage (connexion) si l'utilisateur est authentifié
	chrome.runtime.sendMessage({ action: "checkAuth" }, (authResponse) => {
		if (!authResponse || !authResponse.isAuthenticated) return;
		chrome.runtime.sendMessage(
			{ action: "getPasswords", url: window.location.href },
			(passwordsResponse) => {
				const hasPasswords =
					passwordsResponse?.success &&
					passwordsResponse.passwords?.length > 0;
				detectLoginForms().forEach(({ form, isRegistration }) => {
					const fields = findFormFields(form);
					if (fields.password && !isRegistration) {
						addMemKeyPassButton(fields.password, hasPasswords);
						setupFormSubmitListener(form);
					}
				});
			},
		);
	});
}

// Initialisation principale
function init() {
	chrome.storage.local.get(
		["buttonEnabled", "autoSubmitEnabled", "signupButtonEnabled"],
		(result) => {
			buttonSettings.enabled =
				result.buttonEnabled !== undefined
					? result.buttonEnabled
					: true;
			buttonSettings.signupButtonEnabled =
				result.signupButtonEnabled !== undefined
					? result.signupButtonEnabled
					: true;
			autoSubmitEnabled =
				result.autoSubmitEnabled !== undefined
					? result.autoSubmitEnabled
					: true;

			// Afficher le bouton signup sur tous les champs password sans attendre l'auth
			detectLoginForms().forEach(({ form, isRegistration }) => {
				const fields = findFormFields(form);
				if (fields.password) {
					addRegistrationButton(form, fields.password);
					setupFormSubmitListener(form);
				}
			});

			chrome.runtime.sendMessage(
				{ action: "checkAuth" },
				(authResponse) => {
					if (!authResponse || !authResponse.isAuthenticated) {
						const host = window.location.hostname;
						const isMemKeyPass =
							/(^|\.)memkeypass\.fr$/.test(host) ||
							(host === "localhost" &&
								window.location.port === "3000");
						if (isMemKeyPass) trySiteSessionLogin();
						return;
					}

					chrome.runtime.sendMessage(
						{ action: "getPasswords", url: window.location.href },
						(passwordsResponse) => {
							const hasPasswords =
								passwordsResponse?.success &&
								passwordsResponse.passwords?.length > 0;

							detectLoginForms().forEach(
								({ form, isRegistration }) => {
									const fields = findFormFields(form);
									if (fields.password && !isRegistration) {
										addMemKeyPassButton(
											fields.password,
											hasPasswords,
										);
										setupFormSubmitListener(form);
									}
								},
							);

							chrome.storage.local.get(
								["lastFormData", "noPromptDomains"],
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

// Tenter de se connecter via la session active du site memkeypass.fr
async function trySiteSessionLogin() {
	try {
		const origin = window.location.origin;
		const res = await fetch(`${origin}/api/auth/extension/session-token`, {
			credentials: "include",
		});
		if (res.ok) {
			const data = await res.json();
			if (data?.success && data.token) {
				chrome.runtime.sendMessage(
					{
						action: "loginViaToken",
						token: data.token,
						user: data.user,
					},
					() => {
						chrome.storage.local.remove(["pendingSiteLogin"]);
					},
				);
			}
		}
	} catch (e) {
		// Silencieux : connexion via token optionnelle
	}
}

// Observer les mutations du DOM pour les SPAs (React, Vue, etc.)
const observer = new MutationObserver((mutations) => {
	let shouldInit = false;
	mutations.forEach((mutation) => {
		mutation.addedNodes.forEach((node) => {
			if (
				node.nodeType === 1 &&
				(node.tagName === "FORM" || node.querySelector?.("form"))
			) {
				shouldInit = true;
			}
		});
	});
	if (shouldInit) setTimeout(init, 500);
});

observer.observe(document.body, { childList: true, subtree: true });

// Lancement initial
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

// Si on est sur memkeypass.fr avec un flag de connexion en attente
if (
	window.location.hostname === "memkeypass.fr" ||
	window.location.hostname === "localhost"
) {
	chrome.storage.local.get(["pendingSiteLogin"], (result) => {
		if (result.pendingSiteLogin) {
			setTimeout(trySiteSessionLogin, 1000);
		}
	});
}
