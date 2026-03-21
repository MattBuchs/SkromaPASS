import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

// Le token brut (64 hex) est dans l'URL → on stocke SHA-256(token) en DB
// Ainsi une fuite DB ne permet pas d'accéder aux liens
function hashToken(rawToken) {
	return createHash("sha256").update(rawToken).digest("hex");
}

const SECURE_HEADERS = {
	"Cache-Control": "no-store, no-cache, must-revalidate",
	Pragma: "no-cache",
	"Referrer-Policy": "no-referrer",
	"X-Robots-Tag": "noindex, nofollow, noarchive",
};

function applySecureHeaders(init = {}) {
	return { ...init, headers: { ...(init.headers ?? {}), ...SECURE_HEADERS } };
}

function validateRawToken(token) {
	return token && /^[a-f0-9]{64}$/.test(token);
}

// GET /api/share/[token] - Métadonnées uniquement (pas de contenu, pas de vue consommée)
// Protection contre les bots de preview qui font des GET automatiques
export async function GET(request, { params }) {
	try {
		const locale = getLocale(request);
		const rateLimitResult = rateLimit(request, {
			endpoint: "api",
			maxRequests: 20,
		});
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "tooManyRequestsShort") },
				applySecureHeaders({ status: 429 }),
			);
		}

		const { token: rawToken } = await params;

		if (!validateRawToken(rawToken)) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "linkInvalid") },
				applySecureHeaders({ status: 400 }),
			);
		}

		const tokenHash = hashToken(rawToken);

		const shared = await prisma.sharedPassword.findUnique({
			where: { token: tokenHash },
			select: {
				name: true,
				expiresAt: true,
				maxViews: true,
				viewCount: true,
			},
		});

		if (!shared) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkNotFoundOrExpired"),
				},
				applySecureHeaders({ status: 404 }),
			);
		}

		if (new Date() > shared.expiresAt) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkExpired"),
					expired: true,
				},
				applySecureHeaders({ status: 410 }),
			);
		}

		if (shared.viewCount >= shared.maxViews) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkExhausted"),
					exhausted: true,
				},
				applySecureHeaders({ status: 410 }),
			);
		}

		// Retourner uniquement les métadonnées — aucun contenu sensible, aucune vue consommée
		return NextResponse.json(
			{
				success: true,
				data: {
					name: shared.name,
					expiresAt: shared.expiresAt,
					viewsRemaining: shared.maxViews - shared.viewCount,
				},
			},
			applySecureHeaders(),
		);
	} catch (error) {
		console.error("Error checking shared link metadata:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			applySecureHeaders({ status: 500 }),
		);
	}
}

// POST /api/share/[token] - Révéler le contenu et consommer une vue
// Action explicite requise → les bots de preview (GET uniquement) ne consomment jamais de vues
export async function POST(request, { params }) {
	try {
		const locale = getLocale(request);
		const rateLimitResult = rateLimit(request, {
			endpoint: "api",
			maxRequests: 20,
		});
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "tooManyRequestsShort") },
				applySecureHeaders({ status: 429 }),
			);
		}

		const { token: rawToken } = await params;

		if (!validateRawToken(rawToken)) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "linkInvalid") },
				applySecureHeaders({ status: 400 }),
			);
		}

		const tokenHash = hashToken(rawToken);

		const shared = await prisma.sharedPassword.findUnique({
			where: { token: tokenHash },
		});

		if (!shared) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkNotFoundOrExpired"),
				},
				applySecureHeaders({ status: 404 }),
			);
		}

		if (new Date() > shared.expiresAt) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkExpired"),
					expired: true,
				},
				applySecureHeaders({ status: 410 }),
			);
		}

		if (shared.viewCount >= shared.maxViews) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "linkExhausted"),
					exhausted: true,
				},
				applySecureHeaders({ status: 410 }),
			);
		}

		// Valider le format du blob (protection contre les liens créés avant la migration zero-knowledge)
		let encryptedBlob;
		try {
			encryptedBlob = JSON.parse(shared.encryptedContent);
			if (!encryptedBlob?.iv || !encryptedBlob?.data)
				throw new Error("invalid");
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "incompatibleLinkFormat"),
				},
				applySecureHeaders({ status: 422 }),
			);
		}

		// Incrémenter le compteur de vues (après action explicite seulement)
		const newViewCount = shared.viewCount + 1;
		const isLastView = newViewCount >= shared.maxViews;

		if (isLastView) {
			// Supprimer le lien de la DB quand toutes les vues sont épuisées
			await prisma.sharedPassword.delete({ where: { token: tokenHash } });
		} else {
			await prisma.sharedPassword.update({
				where: { token: tokenHash },
				data: {
					viewCount: newViewCount,
					viewedAt: shared.viewedAt ?? new Date(),
				},
			});
		}

		logSecurityEvent("SHARED_PASSWORD_REVEALED", {
			token: rawToken.slice(0, 8) + "...",
			viewCount: newViewCount,
			maxViews: shared.maxViews,
			deleted: isLastView,
		});

		// Retourner le blob chiffré — le serveur ne peut pas le lire (clé dans le fragment URL)
		return NextResponse.json(
			{
				success: true,
				data: {
					name: shared.name,
					encryptedBlob,
					expiresAt: shared.expiresAt,
					viewsRemaining: shared.maxViews - newViewCount,
				},
			},
			applySecureHeaders(),
		);
	} catch (error) {
		console.error("Error revealing shared password:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			applySecureHeaders({ status: 500 }),
		);
	}
}

// DELETE /api/share/[token] - Révoquer un lien de partage (authentifié)
export async function DELETE(request, { params }) {
	try {
		const locale = getLocale(request);
		const rateLimitResult = rateLimit(request, {
			endpoint: "api",
			maxRequests: 20,
		});
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "tooManyRequestsShort") },
				{ status: 429 },
			);
		}

		const { auth } = await import("@/auth");
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		// DELETE reçoit le hash stocké en DB (depuis la liste de liens de l'utilisateur)
		const { token: tokenHash } = await params;

		if (!tokenHash || !/^[a-f0-9]{64}$/.test(tokenHash)) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "linkInvalid") },
				{ status: 400 },
			);
		}

		const existing = await prisma.sharedPassword.findFirst({
			where: { token: tokenHash, userId: session.user.id },
		});

		if (!existing) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "linkNotFound") },
				{ status: 404 },
			);
		}

		await prisma.sharedPassword.delete({ where: { token: tokenHash } });

		logSecurityEvent("SHARED_LINK_REVOKED", { userId: session.user.id });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting share link:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
