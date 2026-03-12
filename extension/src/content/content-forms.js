// =====================================================================
// content-forms.js — Détection des formulaires de connexion/inscription
// =====================================================================

// Mots-clés d'inscription communs
const REG_KEYWORDS =
	/register|signup|sign.?up|creat|inscri|join|s'inscrire|créer|nouveau compte|new account/i;

// Détecter les formulaires de connexion et d'inscription sur la page
function detectLoginForms() {
	const forms = document.querySelectorAll("form");
	const loginForms = [];

	forms.forEach((form) => {
		const inputs = form.querySelectorAll("input");
		let hasPassword = false;
		let hasEmail = false;
		let hasUsername = false;
		let passwordCount = 0;
		let hasNameField = false;
		let hasNewPasswordAutocomplete = false;
		let hasConfirmField = false;

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

		const submitBtns = form.querySelectorAll(
			'button[type="submit"], button:not([type]), input[type="submit"]',
		);
		let isRegistrationByButton = false;
		submitBtns.forEach((btn) => {
			const txt = (btn.textContent || btn.value || "").toLowerCase();
			if (REG_KEYWORDS.test(txt)) isRegistrationByButton = true;
		});

		const formAttr = [
			form.action || "",
			form.id || "",
			form.className || "",
			form.getAttribute("name") || "",
		]
			.join(" ")
			.toLowerCase();
		const isRegistrationByForm = REG_KEYWORDS.test(formAttr);

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

// Trouver les champs spécifiques (email, username, password) dans un formulaire
function findFormFields(form) {
	const inputs = form.querySelectorAll("input");
	const fields = { email: null, username: null, password: null };

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
