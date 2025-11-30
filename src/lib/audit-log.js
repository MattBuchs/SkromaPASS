/**
 * Actions d'audit disponibles
 */
export const AuditActions = {
    // Authentification
    LOGIN_SUCCESS: "LOGIN_SUCCESS",
    LOGIN_FAILED: "LOGIN_FAILED",
    LOGOUT: "LOGOUT",
    REGISTER: "REGISTER",
    EMAIL_VERIFIED: "EMAIL_VERIFIED",

    // 2FA
    TWO_FA_ENABLED: "TWO_FA_ENABLED",
    TWO_FA_DISABLED: "TWO_FA_DISABLED",
    TWO_FA_VERIFIED: "TWO_FA_VERIFIED",
    TWO_FA_FAILED: "TWO_FA_FAILED",

    // Mots de passe
    PASSWORD_CREATED: "PASSWORD_CREATED",
    PASSWORD_VIEWED: "PASSWORD_VIEWED",
    PASSWORD_UPDATED: "PASSWORD_UPDATED",
    PASSWORD_DELETED: "PASSWORD_DELETED",
    PASSWORDS_FETCHED: "PASSWORDS_FETCHED",

    // Compte utilisateur
    USER_PASSWORD_CHANGED: "USER_PASSWORD_CHANGED",
    USER_PROFILE_UPDATED: "USER_PROFILE_UPDATED",
    USER_DELETED: "USER_DELETED",

    // PIN
    PIN_CREATED: "PIN_CREATED",
    PIN_VERIFIED: "PIN_VERIFIED",
    PIN_FAILED: "PIN_FAILED",
    PIN_DELETED: "PIN_DELETED",

    // Dossiers
    FOLDER_CREATED: "FOLDER_CREATED",
    FOLDER_DELETED: "FOLDER_DELETED",

    // Sécurité
    RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
    SUSPICIOUS_ACTIVITY: "SUSPICIOUS_ACTIVITY",
    UNAUTHORIZED_ACCESS: "UNAUTHORIZED_ACCESS",
};

/**
 * Enregistrer un événement d'audit (logging sécurisé uniquement)
 * Logs uniquement dans la console avec données non-sensibles
 * Pour une solution complète, utiliser un service externe (CloudWatch, Datadog, etc.)
 *
 * @param {Object} params - Paramètres de l'événement
 * @param {string} params.action - Action effectuée (utiliser AuditActions)
 * @param {string} [params.userId] - ID de l'utilisateur
 * @param {string} [params.resource] - Type de ressource
 * @param {string} [params.resourceId] - ID de la ressource
 * @param {string} [params.ip] - Adresse IP
 * @param {string} [params.userAgent] - User agent
 * @param {boolean} [params.success=true] - Succès ou échec
 * @param {Object} [params.details] - Détails additionnels
 * @returns {Promise<void>}
 */
export async function logAudit({
    action,
    userId = null,
    resource = null,
    resourceId = null,
    ip = null,
    userAgent = null,
    success = true,
    details = null,
}) {
    try {
        const timestamp = new Date().toISOString();

        // Préparer les données de log (sans informations sensibles)
        const logData = {
            timestamp,
            action,
            userId: userId || "anonymous",
            resource,
            resourceId,
            success,
            ip: ip ? ip.substring(0, 10) + "..." : null, // Tronquer l'IP pour privacy
        };

        // En développement, logger tout
        if (process.env.NODE_ENV === "development") {
            console.log(`[AUDIT] ${action}`, logData, details);
        }
        // En production, logger uniquement les événements critiques
        else {
            const criticalActions = [
                "LOGIN_FAILED",
                "TWO_FA_FAILED",
                "USER_DELETED",
                "RATE_LIMIT_EXCEEDED",
                "SUSPICIOUS_ACTIVITY",
                "UNAUTHORIZED_ACCESS",
            ];

            if (!success || criticalActions.includes(action)) {
                console.error(`[SECURITY_AUDIT] ${action}`, logData);
            }
        }

        // TODO: Intégrer avec un service de logging externe en production
        // Exemples: CloudWatch, Datadog, Sentry, LogRocket
        // await sendToExternalLoggingService(logData);
    } catch (error) {
        // Ne pas faire échouer l'opération principale si le logging échoue
        console.error("Erreur lors de l'enregistrement de l'audit:", error);
    }
}

/**
 * Extraire l'IP et le user agent d'une requête
 * @param {Request} request - Requête NextJS
 * @returns {Object} { ip, userAgent }
 */
export function getRequestMetadata(request) {
    const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0] ||
        request.headers.get("x-real-ip") ||
        "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    return { ip, userAgent };
}
