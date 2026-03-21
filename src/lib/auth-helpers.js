import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";

/**
 * Middleware pour vérifier l'authentification dans les API routes
 * @param {Request|null} request - Optional Next.js request for locale detection
 * @returns {Object} { session, userId, error }
 */
export async function requireAuth(request = null) {
	const session = await auth();

	if (!session || !session.user) {
		const locale = request ? getLocale(request) : "fr";
		return {
			session: null,
			userId: null,
			error: { message: apiT(locale, "unauthenticated"), status: 401 },
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
		const { session, userId, error } = await requireAuth(req);

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
