/**
 * Chiffrement AES-256-GCM côté client pour le partage zero-knowledge.
 *
 * Architecture :
 *   - Une clé aléatoire est générée dans le navigateur de l'expéditeur
 *   - Le contenu est chiffré avec cette clé AVANT d'être envoyé au serveur
 *   - La clé est intégrée dans le fragment URL (#key) — jamais transmis en HTTP
 *   - Le serveur stocke uniquement le blob chiffré et ne peut pas le lire
 *   - Le navigateur du destinataire extrait la clé depuis le fragment et déchiffre
 *
 * Inspiré de Bitwarden Send / Proton Pass.
 */

/**
 * Génère une clé AES-256-GCM aléatoire (extractable pour pouvoir l'exporter).
 * @returns {Promise<CryptoKey>}
 */
export async function generateShareKey() {
	return crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true, // extractable → on doit la mettre dans l'URL fragment
		["encrypt", "decrypt"],
	);
}

/**
 * Exporte la clé en chaîne base64url (safe pour un fragment URL, pas de padding).
 * @param {CryptoKey} key
 * @returns {Promise<string>} 43 caractères base64url
 */
export async function exportShareKey(key) {
	const raw = await crypto.subtle.exportKey("raw", key);
	const b64 = btoa(String.fromCharCode(...new Uint8Array(raw)));
	// base64url : '+' → '-', '/' → '_', supprimer '='
	return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Importe une clé depuis une chaîne base64url (extraite du fragment URL).
 * @param {string} b64url
 * @returns {Promise<CryptoKey>} non-extractable (usage: decrypt seulement)
 */
export async function importShareKey(b64url) {
	const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
	const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
	return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
		"decrypt",
	]);
}

/**
 * Chiffre un objet avec la clé fournie.
 * @param {CryptoKey} key
 * @param {object} content  Données à chiffrer (sera JSON.stringify)
 * @returns {Promise<{iv: string, data: string}>}  iv et data encodés en base64
 */
export async function encryptForShare(key, content) {
	const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV (recommandé AES-GCM)
	const encoded = new TextEncoder().encode(JSON.stringify(content));
	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoded,
	);
	return {
		iv: btoa(String.fromCharCode(...iv)),
		data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
	};
}

/**
 * Déchiffre un blob {iv, data} avec la clé fournie.
 * @param {CryptoKey} key
 * @param {{iv: string, data: string}} blob
 * @returns {Promise<object>}  Contenu déchiffré et parsé
 * @throws si la clé est mauvaise ou les données corrompues
 */
export async function decryptFromShare(key, blob) {
	const iv = Uint8Array.from(atob(blob.iv), (c) => c.charCodeAt(0));
	const data = Uint8Array.from(atob(blob.data), (c) => c.charCodeAt(0));
	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv },
		key,
		data,
	);
	return JSON.parse(new TextDecoder().decode(decrypted));
}

/**
 * Valide le format d'une clé base64url (43 chars = 32 bytes).
 * Permet de rejeter côté client avant de consommer une vue sur le serveur.
 * @param {string} fragment  Contenu du window.location.hash (sans le #)
 * @returns {boolean}
 */
export function isValidKeyFragment(fragment) {
	return (
		typeof fragment === "string" &&
		fragment.length === 43 &&
		/^[A-Za-z0-9_-]+$/.test(fragment)
	);
}
