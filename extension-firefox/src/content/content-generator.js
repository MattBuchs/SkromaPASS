// =====================================================================
// content-generator.js — Bouton inscription + générateur de mot de passe
// =====================================================================

// Ajouter le bouton générateur (dés, inscription) à côté d'un champ
function addRegistrationButton(form, passwordField) {
	if (!buttonSettings.signupButtonEnabled) return;
	if (passwordField.dataset.memkeypassRegButton) return;
	passwordField.dataset.memkeypassRegButton = "true";

	const { button, positionNearField, setupDrag } = _createDraggableButton(
		28,
		28,
	);
	button.className = "memkeypass-autofill-btn";
	button.title = "Générer un mot de passe avec MemKeyPass";
	button.style.background =
		"linear-gradient(135deg, #14b8a6 0%, #0891b2 100%)";
	button.style.boxShadow = "0 2px 8px rgba(20, 184, 166, 0.4)";
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

	const onScroll = () => {
		if (!positionNearField(passwordField)) cleanup();
	};
	const onResize = () => {
		if (!positionNearField(passwordField)) cleanup();
	};

	window.addEventListener("scroll", onScroll, {
		passive: true,
		capture: true,
	});
	window.addEventListener("resize", onResize, { passive: true });

	const { onMouseMove, onMouseUp } = setupDrag(() => {
		chrome.runtime.sendMessage({ action: "openGeneratorForSignup" });
	});

	function cleanup() {
		window.removeEventListener("scroll", onScroll, true);
		window.removeEventListener("resize", onResize);
		document.removeEventListener("mousemove", onMouseMove);
		document.removeEventListener("mouseup", onMouseUp);
	}
	button._mkpCleanup = cleanup;

	positionNearField(passwordField);
	document.body.appendChild(button);
}

// ---- Générateur en overlay (déclenché depuis le popup) ----

// Générer un mot de passe fort (cryptographiquement sûr)
function generateStrongPassword(
	length,
	useUppercase,
	useDigits,
	useSymbols,
	excludeAmbiguous,
) {
	const lowercase = excludeAmbiguous
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

	const shuffleBytes = new Uint32Array(password.length);
	crypto.getRandomValues(shuffleBytes);
	return password
		.split("")
		.map((c, i) => ({ c, r: shuffleBytes[i] }))
		.sort((a, b) => a.r - b.r)
		.map((x) => x.c)
		.join("");
}

// Calculer la force d'un mot de passe
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

// Afficher le générateur en overlay sur la page (déclenché depuis le bouton dés)
function showInPagePasswordGenerator(form) {
	const existing = document.getElementById("memkeypass-reg-generator");
	if (existing) {
		existing.remove();
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
      <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9); width:38px; height:38px; border-radius:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.5L12 17l-6.2 4.4 2.4-7.5L2 9.4h7.6z"/></svg>
      </div>
      <div style="flex:1;">
        <div style="font-weight:700; color:#0f172a; font-size:15px;">Générateur de mot de passe</div>
        <div style="font-size:12px; color:#64748b;">Formulaire d'inscription détecté</div>
      </div>
      <button id="mkp-gen-close" style="background:none; border:none; cursor:pointer; font-size:18px; color:#94a3b8; padding:2px 6px; line-height:1;">✕</button>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:10px;">
      <input type="text" id="mkp-gen-pwd" readonly value="${escapeHtml(currentPassword)}"
             style="flex:1; padding:10px; border:2px solid #8b5cf6; border-radius:8px; font-family:monospace; font-size:13px; font-weight:600; background:#faf5ff; color:#5b21b6; min-width:0; outline:none;" />
      <button id="mkp-gen-regen" title="Regénérer" style="background:#f3e8ff; border:none; border-radius:8px; cursor:pointer; padding:10px 12px; color:#7c3aed; flex-shrink:0;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      </button>
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
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;"><input type="checkbox" id="mkp-gen-upper" checked style="accent-color:#8b5cf6;" /> Majuscules</label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;"><input type="checkbox" id="mkp-gen-digits" checked style="accent-color:#8b5cf6;" /> Chiffres</label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;"><input type="checkbox" id="mkp-gen-symbols" style="accent-color:#8b5cf6;" /> Symboles</label>
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; padding:6px; border:1px solid #ddd6fe; border-radius:6px; background:#faf5ff;"><input type="checkbox" id="mkp-gen-readable" style="accent-color:#8b5cf6;" /> Lisible</label>
    </div>
    <div style="display:flex; gap:10px;">
      <button id="mkp-gen-use" style="flex:2; padding:12px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:white; border:none; border-radius:8px; cursor:pointer; font-weight:600; font-size:14px;">✓ Utiliser ce mot de passe</button>
      <button id="mkp-gen-copy" style="flex:1; padding:12px; background:#f3e8ff; color:#7c3aed; border:2px solid #ddd6fe; border-radius:8px; cursor:pointer; font-weight:600; font-size:13px;">Copier</button>
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
		const bar = overlay.querySelector("#mkp-gen-bar");
		bar.style.width = s.pct + "%";
		bar.style.background = s.color;
		const lbl = overlay.querySelector("#mkp-gen-label");
		lbl.textContent = `Force : ${s.label}`;
		lbl.style.color = s.color;
	}

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
			const orig = btn.textContent;
			btn.textContent = "✓ Copié !";
			setTimeout(() => {
				btn.textContent = orig;
			}, 1500);
		});
	});

	overlay.querySelector("#mkp-gen-use").addEventListener("click", () => {
		const setter = Object.getOwnPropertyDescriptor(
			window.HTMLInputElement.prototype,
			"value",
		).set;
		form.querySelectorAll('input[type="password"]').forEach((field) => {
			field.focus();
			setter.call(field, currentPassword);
			field.dispatchEvent(new Event("input", { bubbles: true }));
			field.dispatchEvent(new Event("change", { bubbles: true }));
		});
		overlay.remove();
	});

	overlay
		.querySelector("#mkp-gen-close")
		.addEventListener("click", () => overlay.remove());

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
