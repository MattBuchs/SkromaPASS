// =====================================================================
// popup-generator.js — Générateur de mot de passe
// =====================================================================

function generatePassword() {
	const length = parseInt(document.getElementById("gen-length").value, 10);
	const useUppercase = document.getElementById("gen-uppercase").checked;
	const useDigits = document.getElementById("gen-digits").checked;
	const useSymbols = document.getElementById("gen-symbols").checked;
	const excludeAmbiguous = document.getElementById("gen-readable").checked;

	const lowercase = excludeAmbiguous
		? "abcdefghjkmnpqrstuvwxyz"
		: "abcdefghijklmnopqrstuvwxyz";
	const uppercase = excludeAmbiguous
		? "ABCDEFGHJKLMNPQRSTUVWXYZ"
		: "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	const digits = excludeAmbiguous ? "23456789" : "0123456789";
	const symbols = "!@#$%^&*()-_=+[]{}";

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

function updateGeneratorUI() {
	const password = generatePassword();
	document.getElementById("gen-password").value = password;
	document.getElementById("gen-length-display").textContent =
		document.getElementById("gen-length").value;
	updateStrengthBar(password);
}

function updateStrengthBar(password) {
	const bar = document.getElementById("gen-strength-bar");
	const label = document.getElementById("gen-strength-label");

	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (password.length >= 16) score++;
	if (/[A-Z]/.test(password)) score++;
	if (/[0-9]/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	const levels = [
		{ max: 2, label: "Weak", color: "#ef4444", pct: 25 },
		{ max: 3, label: "Fair", color: "#f59e0b", pct: 50 },
		{ max: 4, label: "Good", color: "#84cc16", pct: 75 },
		{ max: 99, label: "Excellent", color: "#10b981", pct: 100 },
	];
	const strength = levels.find((l) => score <= l.max);

	bar.style.width = strength.pct + "%";
	bar.style.background = strength.color;
	label.textContent = `Strength: ${strength.label}`;
	label.style.color = strength.color;
}
