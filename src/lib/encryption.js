import crypto from "crypto";

/**
 * Service de chiffrement AES-256-GCM pour sécuriser les mots de passe
 *
 * AES-256-GCM offre:
 * - Chiffrement avec clé de 256 bits
 * - Mode GCM (Galois/Counter Mode) pour authentification intégrée
 * - Protection contre la manipulation des données
 */

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16; // Pour AES, l'IV est toujours de 16 bytes
const SALT_LENGTH = 64; // Sel pour dérivation de clé
const TAG_LENGTH = 16; // Tag d'authentification GCM
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000; // Nombre d'itérations PBKDF2

/**
 * Obtenir la clé de chiffrement depuis les variables d'environnement
 */
function getEncryptionKey() {
    const key = process.env.ENCRYPTION_KEY;

    if (!key) {
        throw new Error(
            "ENCRYPTION_KEY n'est pas définie dans les variables d'environnement"
        );
    }

    // Vérifier que la clé fait bien 64 caractères hex (32 bytes)
    if (key.length !== 64) {
        throw new Error(
            "ENCRYPTION_KEY doit faire 64 caractères hexadécimaux (32 bytes)"
        );
    }

    return Buffer.from(key, "hex");
}

/**
 * Dériver une clé à partir de la clé maître et d'un sel
 * Utilise PBKDF2 pour renforcer la sécurité
 */
function deriveKey(masterKey, salt) {
    return crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, KEY_LENGTH, "sha512");
}

/**
 * Chiffrer une donnée sensible
 *
 * @param {string} plaintext - Texte en clair à chiffrer
 * @returns {string} - Chaîne encodée en base64 contenant: salt:iv:authTag:encrypted
 */
export function encrypt(plaintext) {
    try {
        if (!plaintext) {
            throw new Error("Le texte à chiffrer ne peut pas être vide");
        }

        const masterKey = getEncryptionKey();

        // Générer un sel aléatoire pour cette opération
        const salt = crypto.randomBytes(SALT_LENGTH);

        // Dériver la clé à partir de la clé maître et du sel
        const key = deriveKey(masterKey, salt);

        // Générer un IV (Initialization Vector) unique
        const iv = crypto.randomBytes(IV_LENGTH);

        // Créer le cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        // Chiffrer les données
        let encrypted = cipher.update(plaintext, "utf8", "hex");
        encrypted += cipher.final("hex");

        // Obtenir le tag d'authentification
        const authTag = cipher.getAuthTag();

        // Combiner salt:iv:authTag:encrypted et encoder en base64
        const combined = Buffer.concat([
            salt,
            iv,
            authTag,
            Buffer.from(encrypted, "hex"),
        ]);

        return combined.toString("base64");
    } catch (error) {
        console.error("Erreur lors du chiffrement:", error.message);
        throw new Error("Échec du chiffrement des données");
    }
}

/**
 * Déchiffrer une donnée
 *
 * @param {string} encryptedData - Données chiffrées en base64
 * @returns {string} - Texte en clair
 */
export function decrypt(encryptedData) {
    try {
        if (!encryptedData) {
            throw new Error(
                "Les données à déchiffrer ne peuvent pas être vides"
            );
        }

        const masterKey = getEncryptionKey();

        // Décoder depuis base64
        const combined = Buffer.from(encryptedData, "base64");

        // Extraire les composants
        const salt = combined.subarray(0, SALT_LENGTH);
        const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const authTag = combined.subarray(
            SALT_LENGTH + IV_LENGTH,
            SALT_LENGTH + IV_LENGTH + TAG_LENGTH
        );
        const encrypted = combined.subarray(
            SALT_LENGTH + IV_LENGTH + TAG_LENGTH
        );

        // Dériver la clé
        const key = deriveKey(masterKey, salt);

        // Créer le decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        // Déchiffrer
        let decrypted = decipher.update(
            encrypted.toString("hex"),
            "hex",
            "utf8"
        );
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        console.error("Erreur lors du déchiffrement:", error.message);
        throw new Error("Échec du déchiffrement des données");
    }
}

/**
 * Hacher un mot de passe utilisateur (pour l'authentification)
 * Utilise bcrypt avec un salt automatique
 *
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} - Hash du mot de passe
 */
export async function hashPassword(password) {
    const bcrypt = (await import("bcryptjs")).default;
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

/**
 * Vérifier un mot de passe contre son hash
 *
 * @param {string} password - Mot de passe en clair
 * @param {string} hash - Hash à vérifier
 * @returns {Promise<boolean>} - true si le mot de passe correspond
 */
export async function verifyPassword(password, hash) {
    const bcrypt = (await import("bcryptjs")).default;
    return bcrypt.compare(password, hash);
}

/**
 * Générer un token JWT sécurisé
 *
 * @param {object} payload - Données à encoder dans le token
 * @param {string} expiresIn - Durée de validité (ex: "7d", "24h")
 * @returns {string} - Token JWT
 */
export function generateToken(payload, expiresIn = "7d") {
    const jwt = require("jsonwebtoken");
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET n'est pas définie");
    }

    return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Vérifier et décoder un token JWT
 *
 * @param {string} token - Token à vérifier
 * @returns {object} - Payload décodé
 */
export function verifyToken(token) {
    const jwt = require("jsonwebtoken");
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET n'est pas définie");
    }

    try {
        return jwt.verify(token, secret);
    } catch (error) {
        throw new Error("Token invalide ou expiré");
    }
}

/**
 * Générer une clé de chiffrement sécurisée
 * Utile pour générer ENCRYPTION_KEY
 *
 * @returns {string} - Clé en hexadécimal (64 caractères)
 */
export function generateEncryptionKey() {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Calculer la force d'un mot de passe
 *
 * @param {string} password - Mot de passe à évaluer
 * @returns {number} - Score de 0 à 100
 */
export function calculatePasswordStrength(password) {
    let strength = 0;

    if (!password) return 0;

    // Longueur
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 15;
    if (password.length >= 16) strength += 10;

    // Complexité
    if (/[a-z]/.test(password)) strength += 10;
    if (/[A-Z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    // Diversité
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= 8) strength += 10;

    return Math.min(strength, 100);
}

/**
 * Générer un mot de passe sécurisé
 *
 * @param {number} length - Longueur du mot de passe
 * @param {object} options - Options de génération
 * @returns {string} - Mot de passe généré
 */
export function generateSecurePassword(
    length = 16,
    options = {
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
    }
) {
    let charset = "";

    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (options.numbers) charset += "0123456789";
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (charset.length === 0) {
        throw new Error("Au moins une option de caractère doit être activée");
    }

    let password = "";
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }

    return password;
}

/**
 * Nettoyer les données sensibles en mémoire
 * (Best practice, même si JS ne garantit pas la suppression immédiate)
 */
export function secureWipe(buffer) {
    if (Buffer.isBuffer(buffer)) {
        buffer.fill(0);
    }
}

export default {
    encrypt,
    decrypt,
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateEncryptionKey,
    calculatePasswordStrength,
    generateSecurePassword,
};
