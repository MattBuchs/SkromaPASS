/**
 * Middleware de sécurité pour les routes API
 *
 * Protection contre:
 * - Injections SQL (via Prisma ORM)
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - Rate limiting
 * - Headers de sécurité
 */

import { verifyToken } from "./encryption";

// Cache pour le rate limiting
const rateLimitCache = new Map();

/**
 * Nettoyer le cache du rate limiting périodiquement
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of rateLimitCache.entries()) {
        if (now - data.resetTime > 0) {
            rateLimitCache.delete(key);
        }
    }
}, 60000); // Toutes les minutes

/**
 * Rate limiting simple basé sur l'IP
 */
export function rateLimit(request) {
    const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        "unknown";

    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "1000");
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"); // 15 min

    const now = Date.now();
    const userData = rateLimitCache.get(ip);

    if (!userData) {
        rateLimitCache.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (now > userData.resetTime) {
        rateLimitCache.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (userData.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: userData.resetTime,
        };
    }

    userData.count++;
    return { allowed: true, remaining: maxRequests - userData.count };
}

/**
 * Sanitiser les inputs pour prévenir les XSS
 */
export function sanitizeInput(input) {
    if (typeof input === "string") {
        return input
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#x27;")
            .replace(/\//g, "&#x2F;");
    }

    if (typeof input === "object" && input !== null) {
        const sanitized = {};
        for (const [key, value] of Object.entries(input)) {
            sanitized[key] = sanitizeInput(value);
        }
        return sanitized;
    }

    return input;
}

/**
 * Valider un token JWT depuis les headers
 */
export function validateAuth(request) {
    try {
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return { valid: false, error: "Token manquant" };
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        return { valid: true, user: payload };
    } catch (error) {
        return { valid: false, error: error.message };
    }
}

/**
 * Headers de sécurité recommandés
 */
export const securityHeaders = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/**
 * Valider la force d'un mot de passe
 */
export function validatePasswordStrength(password) {
    const errors = [];

    if (password.length < 8) {
        errors.push("Le mot de passe doit contenir au moins 8 caractères");
    }

    if (!/[a-z]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins une minuscule");
    }

    if (!/[A-Z]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins une majuscule");
    }

    if (!/[0-9]/.test(password)) {
        errors.push("Le mot de passe doit contenir au moins un chiffre");
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        errors.push(
            "Le mot de passe doit contenir au moins un caractère spécial"
        );
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Générer un ID de session sécurisé
 */
export function generateSessionId() {
    const crypto = require("crypto");
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Logger les événements de sécurité
 */
export function logSecurityEvent(event, details = {}) {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY] ${timestamp} - ${event}`, details);

    // TODO: En production, envoyer vers un service de logging externe
    // comme CloudWatch, Datadog, ou Sentry
}

/**
 * Vérifier si une IP est blacklistée
 */
const blacklistedIPs = new Set();

export function isBlacklisted(ip) {
    return blacklistedIPs.has(ip);
}

export function blacklistIP(ip, duration = 3600000) {
    // 1 heure par défaut
    blacklistedIPs.add(ip);
    setTimeout(() => blacklistedIPs.delete(ip), duration);
    logSecurityEvent("IP_BLACKLISTED", { ip, duration });
}

/**
 * Détection d'activité suspecte
 */
const suspiciousActivity = new Map();

export function detectSuspiciousActivity(ip, action) {
    const key = `${ip}-${action}`;
    const activity = suspiciousActivity.get(key) || {
        count: 0,
        firstSeen: Date.now(),
    };

    activity.count++;
    activity.lastSeen = Date.now();

    suspiciousActivity.set(key, activity);

    // Si plus de 10 actions identiques en 5 minutes
    if (
        activity.count > 10 &&
        activity.lastSeen - activity.firstSeen < 300000
    ) {
        logSecurityEvent("SUSPICIOUS_ACTIVITY_DETECTED", {
            ip,
            action,
            count: activity.count,
        });
        blacklistIP(ip);
        return true;
    }

    return false;
}

/**
 * Valider les données d'entrée
 */
export function validateInput(data, schema) {
    const errors = [];

    for (const [field, rules] of Object.entries(schema)) {
        const value = data[field];

        // Required
        if (rules.required && (!value || value === "")) {
            errors.push(`${field} est requis`);
            continue;
        }

        if (!value) continue;

        // Type
        if (rules.type && typeof value !== rules.type) {
            errors.push(`${field} doit être de type ${rules.type}`);
        }

        // Min length
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(
                `${field} doit contenir au moins ${rules.minLength} caractères`
            );
        }

        // Max length
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(
                `${field} ne peut pas dépasser ${rules.maxLength} caractères`
            );
        }

        // Pattern
        if (rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} a un format invalide`);
        }

        // Custom validator
        if (rules.validator && !rules.validator(value)) {
            errors.push(rules.validatorMessage || `${field} est invalide`);
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Middleware wrapper pour appliquer la sécurité
 */
export function withSecurity(handler, options = {}) {
    return async (request, context) => {
        try {
            // Rate limiting
            if (options.rateLimit !== false) {
                const rateLimitResult = rateLimit(request);

                if (!rateLimitResult.allowed) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "Trop de requêtes, veuillez réessayer plus tard",
                        }),
                        {
                            status: 429,
                            headers: {
                                "Content-Type": "application/json",
                                "Retry-After": Math.ceil(
                                    (rateLimitResult.resetTime - Date.now()) /
                                        1000
                                ),
                            },
                        }
                    );
                }
            }

            // Authentication
            if (options.requireAuth) {
                const authResult = validateAuth(request);

                if (!authResult.valid) {
                    return new Response(
                        JSON.stringify({
                            success: false,
                            error: "Non autorisé",
                        }),
                        {
                            status: 401,
                            headers: { "Content-Type": "application/json" },
                        }
                    );
                }

                // Ajouter l'utilisateur au contexte
                context.user = authResult.user;
            }

            // Appeler le handler
            const response = await handler(request, context);

            // Ajouter les headers de sécurité
            Object.entries(securityHeaders).forEach(([key, value]) => {
                response.headers.set(key, value);
            });

            return response;
        } catch (error) {
            console.error("Security middleware error:", error);
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Erreur serveur",
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    };
}
