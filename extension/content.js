// =====================================================================
// content.js  Coordinateur principal : messages, init, SPA observer
// Dépend de : content-utils.js, content-forms.js, content-autofill.js,
//             content-save.js, content-styles.js
// =====================================================================

// Ecouter les messages de la page web (connexion via le site SkromaPASS.fr)
window.addEventListener("message", (event) => {
	if (
		event.origin !== "https://SkromaPASS.fr" &&
		event.origin !== "http://localhost:3000"
	) {
		return;
	}

	if (event.data?.type === "SkromaPASS_LOGIN_TOKEN" && event.data.token) {
		browserAPI.runtime.sendMessage(
			{
				action: "loginViaToken",
				token: event.data.token,
				user: event.data.user,
			},
			(response) => {
				if (response && response.success) {
					browserAPI.storage.local.remove(["pendingSiteLogin"]);
				}
			},
		);
	}
});

// Ecouter les messages du background script et du popup
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "fillForm") {
		const formEntries = detectLoginForms();
		if (formEntries.length > 0) {
			const fields = findFormFields(formEntries[0].form);
			if (fields.password) {
				document
					.querySelectorAll(".SkromaPASS-autofill-btn")
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
		browserAPI.storage.local.get(["lastFormData"], (result) => {
			sendResponse({ success: true, data: result.lastFormData || null });
		});
		return true;
	}
	return true;
});

// Supprimer tous les boutons et les ré-ajouter avec les paramètres courants
// (sans relire le storage pour éviter une race-condition avec le popup)
function refreshButtons() {
	document.querySelectorAll(".SkromaPASS-autofill-btn").forEach((btn) => {
		if (btn._mkpCleanup) btn._mkpCleanup();
		btn.remove();
	});
	document.querySelectorAll('input[type="password"]').forEach((field) => {
		delete field.dataset.SkromaPASSButton;
		delete field.dataset.SkromaPASSRegButton;
	});

	// Ré-ajouter le bouton générateur (inscription) uniquement sur les formulaires d'inscription
	detectLoginForms().forEach(({ form, isRegistration }) => {
		const fields = findFormFields(form);
		if (fields.password && isRegistration) {
			addRegistrationButton(form, fields.password);
			setupFormSubmitListener(form);
		}
	});

	// Ré-ajouter le bouton remplissage (connexion) si l'utilisateur est authentifié
	browserAPI.runtime.sendMessage({ action: "checkAuth" }, (authResponse) => {
		if (!authResponse || !authResponse.isAuthenticated) return;
		browserAPI.runtime.sendMessage(
			{ action: "getPasswords", url: window.location.href },
			(passwordsResponse) => {
				const hasPasswords =
					passwordsResponse?.success &&
					passwordsResponse.passwords?.length > 0;
				detectLoginForms().forEach(({ form, isRegistration }) => {
					const fields = findFormFields(form);
					if (fields.password && !isRegistration) {
						addSkromaPASSButton(fields.password, hasPasswords);
						setupFormSubmitListener(form);
					}
				});
			},
		);
	});
}

// Initialisation principale
function init() {
	browserAPI.storage.local.get(
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

			// Afficher le bouton signup uniquement sur les formulaires d'inscription
			detectLoginForms().forEach(({ form, isRegistration }) => {
				const fields = findFormFields(form);
				if (fields.password && isRegistration) {
					addRegistrationButton(form, fields.password);
					setupFormSubmitListener(form);
				}
			});

			browserAPI.runtime.sendMessage(
				{ action: "checkAuth" },
				(authResponse) => {
					if (!authResponse || !authResponse.isAuthenticated) {
						const host = window.location.hostname;
						const isSkromaPASS =
							/(^|\.)SkromaPASS\.fr$/.test(host) ||
							(host === "localhost" &&
								window.location.port === "3000");
						if (isSkromaPASS) trySiteSessionLogin();
						return;
					}

					browserAPI.runtime.sendMessage(
						{ action: "getPasswords", url: window.location.href },
						(passwordsResponse) => {
							const hasPasswords =
								passwordsResponse?.success &&
								passwordsResponse.passwords?.length > 0;

							detectLoginForms().forEach(
								({ form, isRegistration }) => {
									const fields = findFormFields(form);
									if (fields.password && !isRegistration) {
										addSkromaPASSButton(
											fields.password,
											hasPasswords,
										);
										setupFormSubmitListener(form);
									}
								},
							);

							browserAPI.storage.local.get(
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
											".SkromaPASS-save-prompt",
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

// Tenter de se connecter via la session active du site SkromaPASS.fr
async function trySiteSessionLogin() {
	try {
		const origin = window.location.origin;
		const res = await fetch(`${origin}/api/auth/extension/session-token`, {
			credentials: "include",
		});
		if (res.ok) {
			const data = await res.json();
			if (data?.success && data.token) {
				browserAPI.runtime.sendMessage(
					{
						action: "loginViaToken",
						token: data.token,
						user: data.user,
					},
					() => {
						browserAPI.storage.local.remove(["pendingSiteLogin"]);
					},
				);
			}
		}
	} catch (e) {
		// Silencieux : connexion via token optionnelle
	}
}

// Observer les mutations du DOM pour les SPAs (React, Vue, etc.)
let _spaRefreshTimer = null;
const observer = new MutationObserver((mutations) => {
	let shouldRefresh = false;
	mutations.forEach((mutation) => {
		mutation.addedNodes.forEach((node) => {
			if (
				node.nodeType === 1 &&
				(node.tagName === "FORM" || node.querySelector?.("form"))
			) {
				shouldRefresh = true;
			}
		});
	});
	if (shouldRefresh) {
		// Debounce : on attend la fin des mutations SPA avant de rafraîchir
		clearTimeout(_spaRefreshTimer);
		_spaRefreshTimer = setTimeout(refreshButtons, 500);
	}
});

observer.observe(document.body, { childList: true, subtree: true });

// Lancement initial
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

// Si on est sur SkromaPASS.fr avec un flag de connexion en attente
if (
	window.location.hostname === "SkromaPASS.fr" ||
	window.location.hostname === "localhost"
) {
	browserAPI.storage.local.get(["pendingSiteLogin"], (result) => {
		if (result.pendingSiteLogin) {
			setTimeout(trySiteSessionLogin, 1000);
		}
	});
}
