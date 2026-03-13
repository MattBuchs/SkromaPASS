// =====================================================================
// popup-settings.js — Paramètres du bouton autofill
// =====================================================================

// Charger les paramètres du bouton depuis le storage
function loadButtonSettings() {
	browserAPI.storage.local.get(
		["buttonEnabled", "autoSubmitEnabled", "signupButtonEnabled"],
		(result) => {
			const buttonEnabled =
				result.buttonEnabled !== undefined
					? result.buttonEnabled
					: true;
			const autoSubmit =
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
			if (autoSubmitCheckbox) autoSubmitCheckbox.checked = autoSubmit;
		},
	);
}

// Gérer l'activation/désactivation du bouton autofill
function handleButtonEnabledChange(e) {
	const enabled = e.target.checked;
	browserAPI.storage.local.set({ buttonEnabled: enabled });
	browserAPI.tabs.query({}, (tabs) => {
		tabs.forEach((tab) => {
			browserAPI.tabs
				.sendMessage(tab.id, {
					action: "updateButtonSettings",
					enabled,
				})
				.catch(() => {});
		});
	});
}

// Bouton d'inscription : activer/désactiver
document
	.getElementById("signup-btn-enabled")
	?.addEventListener("change", (e) => {
		const enabled = e.target.checked;
		browserAPI.storage.local.set({ signupButtonEnabled: enabled });
		browserAPI.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				browserAPI.tabs
					.sendMessage(tab.id, {
						action: "updateButtonSettings",
						signupButtonEnabled: enabled,
					})
					.catch(() => {});
			});
		});
	});

// Auto-soumission des formulaires : activer/désactiver
document
	.getElementById("auto-submit-enabled")
	?.addEventListener("change", (e) => {
		const enabled = e.target.checked;
		browserAPI.storage.local.set({ autoSubmitEnabled: enabled });
		browserAPI.tabs.query({}, (tabs) => {
			tabs.forEach((tab) => {
				browserAPI.tabs
					.sendMessage(tab.id, {
						action: "updateButtonSettings",
						autoSubmitEnabled: enabled,
					})
					.catch(() => {});
			});
		});
	});
