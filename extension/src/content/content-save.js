// =====================================================================
// content-save.js — Écoute des soumissions + invite d'enregistrement
// =====================================================================

let lastSubmissionTimestamp = 0;
let isProcessingSubmission = false;

// Attacher les écouteurs de soumission à un formulaire
function setupFormSubmitListener(form) {
	if (form.dataset.memkeypassListener) return;
	form.dataset.memkeypassListener = "true";

	const storeFormDataForLater = () => {
		const now = Date.now();
		if (isProcessingSubmission || now - lastSubmissionTimestamp < 500)
			return;

		isProcessingSubmission = true;
		lastSubmissionTimestamp = now;

		const fields = findFormFields(form);

		if (fields.password && fields.password.value) {
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
				siteName,
				username: fields.username?.value || "",
				email: fields.email?.value || "",
				password: fields.password.value,
				isRegistration,
				timestamp: Date.now(),
			};

			chrome.storage.local.set({ lastFormData: passwordData });

			setTimeout(() => {
				showSavePasswordPrompt(passwordData);
				isProcessingSubmission = false;
			}, 1500);
		} else {
			isProcessingSubmission = false;
		}
	};

	form.addEventListener("submit", () => storeFormDataForLater());

	form.querySelectorAll(
		'button[type="submit"], input[type="submit"], button:not([type="button"]):not([type="reset"])',
	).forEach((btn) => {
		btn.addEventListener("click", () => {
			if (!btn.disabled && btn.type !== "reset") {
				setTimeout(storeFormDataForLater, 100);
			}
		});
	});

	form.querySelectorAll("input").forEach((input) => {
		input.addEventListener("keydown", (e) => {
			if (e.key === "Enter") setTimeout(storeFormDataForLater, 100);
		});
	});
}

// Afficher l'invite pour enregistrer un mot de passe
function showSavePasswordPrompt(passwordData) {
	if (document.querySelector(".memkeypass-save-prompt")) return;

	chrome.runtime.sendMessage(
		{ action: "getPasswords", url: window.location.href },
		(response) => {
			if (
				response &&
				response.success &&
				response.passwords &&
				response.passwords.length > 0
			) {
				const exists = response.passwords.some((pwd) => {
					const sameId =
						(passwordData.username &&
							pwd.username === passwordData.username) ||
						(passwordData.email &&
							pwd.email === passwordData.email);
					return passwordData.isRegistration
						? sameId && pwd.password === passwordData.password
						: sameId;
				});
				if (exists) return;
			}

			chrome.storage.local.get(
				["noPromptDomains", "snoozeMap"],
				(prefs) => {
					const noPrompt = Array.isArray(prefs.noPromptDomains)
						? prefs.noPromptDomains.includes(passwordData.domain)
						: false;
					const snoozed =
						Date.now() <
						(prefs.snoozeMap?.[passwordData.domain] || 0);
					if (noPrompt || snoozed) return;
					if (document.querySelector(".memkeypass-save-prompt"))
						return;

					_renderSavePrompt(passwordData);
				},
			);
		},
	);
}

function _renderSavePrompt(passwordData) {
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="7" cy="7" r="3" fill="white"/><circle cx="7" cy="7" r="1.2" fill="#14b8a6"/><rect x="6" y="7" width="2" height="12" fill="white"/><rect x="4" y="17" width="2" height="2" fill="white"/><rect x="4" y="14" width="2" height="2" fill="white"/><rect x="8" y="15.5" width="2" height="2" fill="white"/></svg>
      </div>
      <div style="flex: 1;">
        <div style="font-weight: 700; color: #0f172a; font-size: 18px; margin-bottom: 4px;">Enregistrer ce mot de passe</div>
        <div style="font-size: 14px; color: #64748b;">${escapeHtml(passwordData.domain)}</div>
      </div>
    </div>
    <div style="margin-bottom: 18px;">
      <input type="text" id="memkeypass-name" placeholder="Nom (ex: Facebook, Gmail...)"
             value="${escapeHtml(passwordData.siteName || passwordData.domain)}"
             style="width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px; box-sizing: border-box; transition: all 0.2s; font-family: inherit;">
    </div>
    <div style="display: flex; gap: 10px;">
      <button id="memkeypass-save" style="flex: 1; padding: 12px; background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);">Enregistrer</button>
      <button id="memkeypass-cancel" style="flex: 1; padding: 12px; background: #f1f5f9; color: #475569; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.2s;">Annuler</button>
    </div>
    <div style="display:flex; gap:10px; margin-top:10px;">
      <button id="memkeypass-snooze" style="flex:1; padding:10px; background:#fff7ed; color:#9a3412; border:2px solid #fdba74; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">Rappeler plus tard</button>
      <button id="memkeypass-never" style="flex:1; padding:10px; background:#fef2f2; color:#991b1b; border:2px solid #fecaca; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">Ne plus proposer</button>
    </div>
  `;

	document.body.appendChild(prompt);

	const saveBtn = document.getElementById("memkeypass-save");
	const cancelBtn = document.getElementById("memkeypass-cancel");
	const nameInput = document.getElementById("memkeypass-name");

	saveBtn.addEventListener("mouseover", () => {
		saveBtn.style.background =
			"linear-gradient(135deg, #0d9488 0%, #0e7490 100%)";
		saveBtn.style.transform = "translateY(-1px)";
	});
	saveBtn.addEventListener("mouseout", () => {
		saveBtn.style.background =
			"linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
		saveBtn.style.transform = "translateY(0)";
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

	saveBtn.addEventListener("click", () => {
		const name = nameInput.value.trim();
		if (!name) {
			alert("Veuillez entrer un nom");
			return;
		}
		saveBtn.disabled = true;
		saveBtn.textContent = "Enregistrement...";

		chrome.runtime.sendMessage(
			{ action: "savePassword", data: { ...passwordData, name } },
			(response) => {
				if (chrome.runtime.lastError) {
					saveBtn.disabled = false;
					saveBtn.textContent = "Enregistrer";
					return;
				}
				if (response && response.success) {
					saveBtn.textContent = "✓ Enregistré !";
					saveBtn.style.background = "#10b981";
					chrome.storage.local.remove(["lastFormData"]);
					setTimeout(() => prompt.remove(), 800);
				} else {
					alert("Erreur : " + (response?.error || "Erreur inconnue"));
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

	document
		.getElementById("memkeypass-snooze")
		.addEventListener("click", () => {
			chrome.storage.local.get(["snoozeMap"], (res) => {
				const map = res.snoozeMap || {};
				map[passwordData.domain] = Date.now() + 30 * 60 * 1000;
				chrome.storage.local.set({ snoozeMap: map }, () => {
					chrome.storage.local.remove(["lastFormData"]);
					prompt.remove();
				});
			});
		});

	document
		.getElementById("memkeypass-never")
		.addEventListener("click", () => {
			chrome.storage.local.get(["noPromptDomains"], (res) => {
				const list = Array.isArray(res.noPromptDomains)
					? res.noPromptDomains
					: [];
				if (!list.includes(passwordData.domain))
					list.push(passwordData.domain);
				chrome.storage.local.set({ noPromptDomains: list }, () => {
					chrome.storage.local.remove(["lastFormData"]);
					prompt.remove();
				});
			});
		});
}
