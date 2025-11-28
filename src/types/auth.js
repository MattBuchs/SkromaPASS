/**
 * Types NextAuth pour auto-complétion
 * Ce fichier aide VS Code à comprendre les types NextAuth
 */

/**
 * @typedef {Object} User
 * @property {string} id - ID unique de l'utilisateur
 * @property {string} email - Email de l'utilisateur
 * @property {string} [name] - Nom de l'utilisateur
 * @property {string} [image] - URL de l'image de profil
 */

/**
 * @typedef {Object} Session
 * @property {User} user - Informations de l'utilisateur
 * @property {string} expires - Date d'expiration de la session
 */

/**
 * @typedef {Object} JWT
 * @property {string} id - ID de l'utilisateur
 * @property {string} email - Email de l'utilisateur
 * @property {string} [name] - Nom de l'utilisateur
 */

/**
 * @typedef {Object} AuthResult
 * @property {Session | null} session - Session de l'utilisateur
 * @property {string | null} userId - ID de l'utilisateur
 * @property {AuthError | null} error - Erreur éventuelle
 */

/**
 * @typedef {Object} AuthError
 * @property {string} message - Message d'erreur
 * @property {number} status - Code de statut HTTP
 */

export {};
