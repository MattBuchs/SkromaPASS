import { generateToken, verifyToken } from "./encryption";

/**
 * Générer un token 2FA temporaire (valide 10 minutes)
 * @param {string} email - L'email de l'utilisateur
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {string} Token JWT
 */
export function generate2FAToken(email, userId) {
    return generateToken(
        {
            email,
            userId,
            type: "2fa-pending",
        },
        "10m" // Expire dans 10 minutes
    );
}

/**
 * Vérifier un token 2FA
 * @param {string} token - Le token à vérifier
 * @returns {Object} Payload décodé ou null
 */
export function verify2FAToken(token) {
    try {
        const payload = verifyToken(token);
        if (payload.type !== "2fa-pending") {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Générer un token de réauthentification (valide 15 minutes)
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {string} Token JWT
 */
export function generateReauthToken(userId) {
    return generateToken(
        {
            userId,
            type: "reauth",
            timestamp: Date.now(),
        },
        "15m" // Expire dans 15 minutes
    );
}

/**
 * Vérifier un token de réauthentification
 * @param {string} token - Le token à vérifier
 * @returns {Object} Payload décodé ou null
 */
export function verifyReauthToken(token) {
    try {
        const payload = verifyToken(token);
        if (payload.type !== "reauth") {
            return null;
        }
        return payload;
    } catch (error) {
        return null;
    }
}
