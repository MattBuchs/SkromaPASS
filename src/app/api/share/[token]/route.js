import { decrypt } from "@/lib/encryption";
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
		const rateLimitResult = rateLimit(request, {
			endpoint: "api",
			maxRequests: 20,
		});
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: "Trop de requêtes" },
				applySecureHeaders({ status: 429 }),
			);
		}

		const { token: rawToken } = await params;

		if (!validateRawToken(rawToken)) {
			return NextResponse.json(
				{ success: false, error: "Lien invalide" },
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
				{ success: false, error: "Lien introuvable ou expiré" },
				applySecureHeaders({ status: 404 }),
			);
		}

		if (new Date() > shared.expiresAt) {
			return NextResponse.json(
				{ success: false, error: "Ce lien a expiré", expired: true },
				applySecureHeaders({ status: 410 }),
			);
		}

		if (shared.viewCount >= shared.maxViews) {
			return NextResponse.json(
				{
					success: false,
					error: "Ce lien a déjà été utilisé le nombre maximum de fois",
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
			{ success: false, error: "Erreur serveur" },
			applySecureHeaders({ status: 500 }),
		);
	}
}

// POST /api/share/[token] - Révéler le contenu et consommer une vue
// Action explicite requise → les bots de preview (GET uniquement) ne consomment jamais de vues
export async function POST(request, { params }) {
	try {
		const rateLimitResult = rateLimit(request, {
			endpoint: "api",
			maxRequests: 20,
		});
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: "Trop de requêtes" },
				applySecureHeaders({ status: 429 }),
			);
		}

		const { token: rawToken } = await params;

		if (!validateRawToken(rawToken)) {
			return NextResponse.json(
				{ success: false, error: "Lien invalide" },
				applySecureHeaders({ status: 400 }),
			);
		}

		const tokenHash = hashToken(rawToken);

		const shared = await prisma.sharedPassword.findUnique({
			where: { token: tokenHash },
		});

		if (!shared) {
			return NextResponse.json(
				{ success: false, error: "Lien introuvable ou expiré" },
				applySecureHeaders({ status: 404 }),
			);
		}

		if (new Date() > shared.expiresAt) {
			return NextResponse.json(
				{ success: false, error: "Ce lien a expiré", expired: true },
				applySecureHeaders({ status: 410 }),
			);
		}

		if (shared.viewCount >= shared.maxViews) {
			return NextResponse.json(
				{
					success: false,
					error: "Ce lien a déjà été utilisé le nombre maximum de fois",
					exhausted: true,
				},
				applySecureHeaders({ status: 410 }),
			);
		}

		let content;
		try {
			content = JSON.parse(decrypt(shared.encryptedContent));
		} catch {
			return NextResponse.json(
				{ success: false, error: "Erreur de déchiffrement" },
				applySecureHeaders({ status: 500 }),
			);
		}

		// Incrémenter le compteur de vues (maintenant seulement, après action explicite)
		await prisma.sharedPassword.update({
			where: { token: tokenHash },
			data: {
				viewCount: shared.viewCount + 1,
				viewedAt: shared.viewedAt ?? new Date(),
			},
		});

		logSecurityEvent("SHARED_PASSWORD_REVEALED", {
			token: rawToken.slice(0, 8) + "...",
			viewCount: shared.viewCount + 1,
			maxViews: shared.maxViews,
		});

		return NextResponse.json(
			{
				success: true,
				data: {
					name: shared.name,
					username: content.username,
					email: content.email,
					password: content.password,
					website: content.website,
					notes: content.notes,
					expiresAt: shared.expiresAt,
					viewsRemaining: shared.maxViews - (shared.viewCount + 1),
				},
			},
			applySecureHeaders(),
		);
	} catch (error) {
		console.error("Error revealing shared password:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur serveur" },
			applySecureHeaders({ status: 500 }),
		);
	}
}

// DELETE /api/share/[token] - Révoquer un lien de partage (authentifié)
export async function DELETE(request, { params }) {
	try {
		const { auth } = await import("@/auth");
		const session = await auth();
		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: "Non authentifié" },
				{ status: 401 },
			);
		}

		// DELETE reçoit le hash stocké en DB (depuis la liste de liens de l'utilisateur)
		const { token: tokenHash } = await params;

		if (!tokenHash || !/^[a-f0-9]{64}$/.test(tokenHash)) {
			return NextResponse.json(
				{ success: false, error: "Lien invalide" },
				{ status: 400 },
			);
		}

		const existing = await prisma.sharedPassword.findFirst({
			where: { token: tokenHash, userId: session.user.id },
		});

		if (!existing) {
			return NextResponse.json(
				{ success: false, error: "Lien introuvable" },
				{ status: 404 },
			);
		}

		await prisma.sharedPassword.delete({ where: { token: tokenHash } });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting share link:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur serveur" },
			{ status: 500 },
		);
	}
}
