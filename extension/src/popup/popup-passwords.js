// =====================================================================
// popup-passwords.js — Liste des mots de passe, sections "enregistrer"
// =====================================================================

// Charger les mots de passe du site en cours
async function loadPasswordsForCurrentSite() {
	if (!currentTab || !currentTab.url) {
		showEmptyState("Aucun site web actif");
		return;
	}

	if (
		currentTab.url.startsWith("chrome://") ||
		currentTab.url.startsWith("moz-extension://") ||
		currentTab.url.startsWith("about:") ||
		currentTab.url.startsWith("edge://") ||
		currentTab.url.startsWith("chrome-extension://")
	) {
		showEmptyState(
			"Cette extension ne fonctionne pas sur les pages internes du navigateur",
		);
		return;
	}

	const container = document.getElementById("passwords-list");
	container.replaceChildren();
	const loadingDiv = document.createElement("div");
	loadingDiv.className = "loading";
	const spinner = document.createElement("div");
	spinner.className = "spinner";
	const loadingText = document.createElement("p");
	loadingText.textContent = "Chargement...";
	loadingDiv.appendChild(spinner);
	loadingDiv.appendChild(loadingText);
	container.appendChild(loadingDiv);

	browserAPI.runtime.sendMessage(
		{ action: "getPasswords", url: currentTab.url },
		(response) => {
			if (response.success) {
				displayPasswords(response.passwords);
			} else {
				showEmptyState("Erreur : " + response.error);
			}
		},
	);
}

// Afficher la liste des mots de passe
function displayPasswords(passwords) {
	const list = document.getElementById("passwords-list");

	if (!passwords || passwords.length === 0) {
		showEmptyState("Aucun mot de passe enregistré pour ce site");
		return;
	}

	list.innerHTML = "";
	passwords.forEach((pwd) => {
		const item = document.createElement("div");
		item.className = "password-item";

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
					setTimeout(() => {
						copyUserBtn.textContent = "👤";
					}, 1500);
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
					setTimeout(() => {
						copyPwdBtn.textContent = "🔑";
					}, 1500);
				});
			}
		});

		actions.appendChild(copyUserBtn);
		actions.appendChild(copyPwdBtn);
		item.appendChild(info);
		item.appendChild(actions);
		list.appendChild(item);
	});
}

// Afficher un état vide
function showEmptyState(message) {
	const container = document.getElementById("passwords-list");
	container.replaceChildren();
	const div = document.createElement("div");
	div.className = "empty-state";
	const icon = document.createElement("div");
	icon.className = "icon";
	// Contenu SVG statique (pas de données utilisateur)
	icon.innerHTML =
		'<svg width="48" height="48" style="opacity:0.4"><use href="#ico-lock"/></svg>';
	const p = document.createElement("p");
	p.textContent = message;
	div.appendChild(icon);
	div.appendChild(p);
	container.appendChild(div);
}

// Auto-remplir depuis le popup
async function autofillPassword(password) {
	try {
		await browserAPI.tabs.sendMessage(currentTab.id, {
			action: "fillForm",
			data: password,
		});
		showSuccess("Mot de passe rempli avec succès !");
		setTimeout(() => window.close(), 1000);
	} catch (error) {
		showError("Impossible de remplir le formulaire. Veuillez réessayer.");
	}
}

// Vérifier s'il y a un dernier formulaire à proposer d'enregistrer
function checkLastFormData() {
	browserAPI.storage.local.get(["lastFormData"], (result) => {
		const section = document.getElementById("save-last-password-section");
		const data = result.lastFormData;
		if (!data) {
			if (section) section.style.display = "none";
			return;
		}
		const isRecent = Date.now() - data.timestamp < 5 * 60 * 1000;
		const isSameSite =
			currentTab?.url && new URL(currentTab.url).hostname === data.domain;
		if (isRecent && isSameSite) {
			showLastFormDataSection(data);
		} else if (section) {
			section.style.display = "none";
		}
	});
}

// Afficher la section "Enregistrer le dernier mot de passe"
function showLastFormDataSection(data) {
	const section = document.getElementById("save-last-password-section");
	document.getElementById("last-form-domain").textContent = data.domain;
	document.getElementById("last-form-username").textContent =
		data.email || data.username || "Non spécifié";

	const nameInput = document.getElementById("last-form-name");
	nameInput.value = data.siteName || data.domain;

	section.style.display = "";

	// Cloner les boutons pour effacer les anciens listeners
	const saveBtn = document.getElementById("save-last-password-btn");
	const dismissBtn = document.getElementById("dismiss-last-password-btn");
	const newSaveBtn = saveBtn.cloneNode(true);
	const newDismissBtn = dismissBtn.cloneNode(true);
	saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
	dismissBtn.parentNode.replaceChild(newDismissBtn, dismissBtn);

	newSaveBtn.addEventListener("click", async () => {
		const name = nameInput.value.trim();
		if (!name) {
			showError("Veuillez entrer un nom");
			return;
		}

		newSaveBtn.disabled = true;
		newSaveBtn.textContent = "Enregistrement...";

		browserAPI.runtime.sendMessage(
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
				if (browserAPI.runtime.lastError) {
					showError("Erreur de communication");
					newSaveBtn.disabled = false;
					newSaveBtn.textContent = "Enregistrer";
					return;
				}
				if (response && response.success) {
					showSuccess("Mot de passe enregistré !");
					section.style.display = "none";
					browserAPI.storage.local.remove(["lastFormData"]);
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

	newDismissBtn.addEventListener("click", () => {
		section.style.display = "none";
		browserAPI.storage.local.remove(["lastFormData"]);
	});
}
