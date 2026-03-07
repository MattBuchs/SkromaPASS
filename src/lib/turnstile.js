/**
 * Vérifie un token Cloudflare Turnstile côté serveur
 * @param {string} token - Le token reçu du widget client
 * @returns {Promise<boolean>}
 */
export async function verifyTurnstile(token) {
	if (!token) return false;

	// En développement sans clé configurée, on laisse passer
	if (!process.env.TURNSTILE_SECRET_KEY) {
		if (process.env.NODE_ENV === "development") {
			console.warn(
				"⚠️ TURNSTILE_SECRET_KEY non configuré — vérification ignorée en dev",
			);
			return true;
		}
		return false;
	}

	try {
		const res = await fetch(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				body: new URLSearchParams({
					secret: process.env.TURNSTILE_SECRET_KEY,
					response: token,
				}).toString(),
			},
		);

		if (!res.ok) {
			console.error(
				"[turnstile] HTTP error:",
				res.status,
				res.statusText,
			);
			return false;
		}

		const data = await res.json();
		if (!data.success) {
			console.error(
				"[turnstile] Vérification échouée:",
				JSON.stringify(data["error-codes"]),
			);
		}
		return data.success === true;
	} catch (err) {
		console.error("[turnstile] Erreur lors de la vérification:", err);
		return false;
	}
}
