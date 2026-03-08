import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

// Stocker le hash SHA-256 du token — jamais le token brut en DB
function hashToken(rawToken) {
	return createHash("sha256").update(rawToken).digest("hex");
}

const createShareSchema = z.object({
	passwordId: z.string().min(1, "ID de mot de passe requis"),
	name: z.string().min(1).max(100, "Nom trop long"),
	// Blob chiffré côté client avec AES-256-GCM — le serveur ne peut pas le lire
	// Max : AES-GCM overhead ~16 bytes, JSON ~1 KB de contenu → 4 KB en base64 est très large
	encryptedBlob: z.object({
		iv: z.string().min(16).max(24), // base64 de 12 bytes = 16 chars
		data: z.string().min(1).max(8192), // ~6 KB max en base64 (très généreux pour un mot de passe)
	}),
	expiresInHours: z.number().min(1).max(168).default(24), // max 7 jours
	maxViews: z.number().min(1).max(10).default(1),
});

// POST /api/share - Créer un lien de partage sécurisé
export async function POST(request) {
	try {
		const { userId, error } = await requireAuth();
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: "Trop de requêtes" },
				{ status: 429 },
			);
		}

		const body = await request.json();
		const validation = createShareSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: fromZodError(validation.error).message,
				},
				{ status: 400 },
			);
		}

		const { passwordId, name, encryptedBlob, expiresInHours, maxViews } =
			validation.data;

		// Vérifier la propriété du mot de passe (sans le déchiffrer — zero-knowledge)
		const password = await prisma.password.findFirst({
			where: { id: passwordId, userId },
			select: { id: true },
		});

		if (!password) {
			return NextResponse.json(
				{ success: false, error: "Mot de passe introuvable" },
				{ status: 404 },
			);
		}

		// Stocker le blob chiffré côté client tel quel — le serveur ne possède pas la clé
		// La clé de déchiffrement est dans le fragment # de l'URL (jamais transmise au serveur)
		const encryptedContent = JSON.stringify(encryptedBlob);

		const rawToken = randomBytes(32).toString("hex"); // token brut → URL uniquement, jamais stocké
		const tokenHash = hashToken(rawToken); // hash SHA-256 → stocké en DB
		const expiresAt = new Date(
			Date.now() + expiresInHours * 60 * 60 * 1000,
		);

		const shared = await prisma.sharedPassword.create({
			data: {
				userId,
				name,
				encryptedContent,
				token: tokenHash,
				expiresAt,
				maxViews,
			},
		});

		logSecurityEvent("PASSWORD_SHARED", {
			userId,
			passwordId,
			shareId: shared.id,
		});

		return NextResponse.json({
			success: true,
			data: {
				token: rawToken,
				expiresAt: shared.expiresAt,
				maxViews: shared.maxViews,
			},
		});
	} catch (error) {
		console.error("Error creating share link:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur serveur" },
			{ status: 500 },
		);
	}
}
