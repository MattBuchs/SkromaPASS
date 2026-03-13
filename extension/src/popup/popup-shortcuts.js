// =====================================================================
// popup-shortcuts.js — Configuration des raccourcis clavier
// =====================================================================

function setupShortcutCapture(inputId, commandName, saveBtnId) {
	const input = document.getElementById(inputId);
	const saveBtn = document.getElementById(saveBtnId);
	if (!input || !saveBtn) return;

	const SUGGESTED = {
		_execute_action: "Ctrl+I",
		"autofill-current-site": "Alt+Shift+F",
	};
	const storageKey = `shortcut_${commandName}`;

	let pendingShortcut = null;
	let capturing = false;

	// Charger la valeur actuelle (priorité : storage local → commandes Chrome)
	browserAPI.storage.local.get([storageKey], (res) => {
		if (res[storageKey]) {
			input.value = res[storageKey];
		} else if (browserAPI.commands && browserAPI.commands.getAll) {
			browserAPI.commands.getAll((commands) => {
				const cmd = commands.find((c) => c.name === commandName);
				input.value =
					cmd && cmd.shortcut
						? cmd.shortcut
						: SUGGESTED[commandName] || "Non défini";
			});
		}
	});

	input.addEventListener("click", () => {
		capturing = true;
		pendingShortcut = null;
		input.value = "Appuyez un raccourci…";
		input.classList.add("capturing");
	});

	input.addEventListener("blur", () => {
		if (capturing && !pendingShortcut) {
			capturing = false;
			input.classList.remove("capturing");
			browserAPI.storage.local.get([storageKey], (res) => {
				if (res[storageKey]) {
					input.value = res[storageKey];
				} else if (browserAPI.commands && browserAPI.commands.getAll) {
					browserAPI.commands.getAll((commands) => {
						const cmd = commands.find(
							(c) => c.name === commandName,
						);
						input.value =
							cmd && cmd.shortcut
								? cmd.shortcut
								: SUGGESTED[commandName] || "Non défini";
					});
				}
			});
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
		if (!pendingShortcut) return;

		const originalHtml = saveBtn.innerHTML;
		saveBtn.disabled = true;
		saveBtn.innerHTML = "⏳";

		browserAPI.commands.update(
			{ name: commandName, shortcut: pendingShortcut },
			() => {
				if (browserAPI.runtime.lastError) {
					saveBtn.innerHTML = originalHtml;
					saveBtn.disabled = false;
					showError(
						"Raccourci invalide\u00a0: " +
							browserAPI.runtime.lastError.message,
					);
					return;
				}
				browserAPI.storage.local.set(
					{ [storageKey]: pendingShortcut },
					() => {
						pendingShortcut = null;
						saveBtn.innerHTML =
							'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Sauvegardé !';
						saveBtn.style.background =
							"linear-gradient(135deg, #10b981, #059669)";
						setTimeout(() => {
							saveBtn.innerHTML = originalHtml;
							saveBtn.style.background = "";
							saveBtn.disabled = false;
						}, 2000);
					},
				);
			},
		);
	});
}

function loadShortcuts() {
	// Pour _execute_action :
	// - Chrome bloque `commands.update` → champ lecture seule + lien vers chrome://extensions/shortcuts
	// - Firefox autorise `commands.update` mais on reste cohérent → lien vers about:addons
	const openInput = document.getElementById("shortcut-open");
	const openSaveBtn = document.getElementById("shortcut-open-save");

	if (openInput && openSaveBtn) {
		const storageKey = "shortcut__execute_action";
		browserAPI.storage.local.get([storageKey], (stored) => {
			browserAPI.commands.getAll((commands) => {
				const cmd = commands.find((c) => c.name === "_execute_action");
				const current =
					stored[storageKey] || (cmd && cmd.shortcut) || "Ctrl+I";
				openInput.value = current;
				openInput.readOnly = true;
				openInput.style.cursor = "default";
				openInput.style.opacity = "0.75";
			});
		});

		const isFirefox = typeof browser !== "undefined";
		const shortcutsUrl = isFirefox
			? "about:addons"
			: "chrome://extensions/shortcuts";
		openSaveBtn.textContent = "Modifier ↗";
		openSaveBtn.style.whiteSpace = "nowrap";
		openSaveBtn.title = `Ouvrir ${shortcutsUrl}`;
		openSaveBtn.onclick = () => {
			browserAPI.tabs.create({ url: shortcutsUrl });
		};
	}

	// Raccourci d'autofill (modifiable par API sur Chrome et Firefox)
	setupShortcutCapture(
		"shortcut-fill",
		"autofill-current-site",
		"shortcut-fill-save",
	);
}
