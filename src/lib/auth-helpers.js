import { auth } from "@/auth";

/**
 * Middleware pour vérifier l'authentification dans les API routes
 * @returns {Object} { session, userId, error }
 */
export async function requireAuth() {
    const session = await auth();

    if (!session || !session.user) {
        return {
            session: null,
            userId: null,
            error: { message: "Non authentifié", status: 401 },
        };
    }

    return {
        session,
        userId: session.user.id,
        error: null,
    };
}

/**
 * Wrapper pour les API routes qui nécessitent l'authentification
 */
export function withAuth(handler) {
    return async (req, ...args) => {
        const { session, userId, error } = await requireAuth();

        if (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: error.status,
                headers: { "Content-Type": "application/json" },
            });
        }

        // Ajoute userId et session à la requête
        req.userId = userId;
        req.session = session;

        return handler(req, ...args);
    };
}
