import { authenticator } from "otplib";
import QRCode from "qrcode";

/**
 * Génère un secret pour l'authentification à deux facteurs
 * @returns {string} Le secret généré
 */
export function generateTwoFactorSecret() {
    return authenticator.generateSecret();
}

/**
 * Génère une URL otpauth pour l'application d'authentification
 * @param {string} email - L'email de l'utilisateur
 * @param {string} secret - Le secret 2FA
 * @returns {string} L'URL otpauth
 */
export function generateOtpAuthUrl(email, secret) {
    const appName = "MemKeyPass";
    return authenticator.keyuri(email, appName, secret);
}

/**
 * Génère un QR code sous forme de data URL
 * @param {string} otpAuthUrl - L'URL otpauth
 * @returns {Promise<string>} Le data URL du QR code
 */
export async function generateQRCode(otpAuthUrl) {
    try {
        return await QRCode.toDataURL(otpAuthUrl);
    } catch (error) {
        console.error("Erreur lors de la génération du QR code:", error);
        throw new Error("Impossible de générer le QR code");
    }
}

/**
 * Vérifie un code TOTP
 * @param {string} token - Le code à 6 chiffres entré par l'utilisateur
 * @param {string} secret - Le secret stocké en base de données
 * @returns {boolean} True si le code est valide
 */
export function verifyTwoFactorToken(token, secret) {
    try {
        // Supprimer les espaces et vérifier que c'est bien 6 chiffres
        const cleanToken = token.replace(/\s/g, "");
        if (!/^\d{6}$/.test(cleanToken)) {
            return false;
        }

        // Vérifier le token avec une fenêtre de temps de ±1 (30 secondes avant/après)
        return authenticator.verify({
            token: cleanToken,
            secret,
            window: 1,
        });
    } catch (error) {
        console.error("Erreur lors de la vérification du token 2FA:", error);
        return false;
    }
}
