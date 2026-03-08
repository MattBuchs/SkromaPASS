import { requireAuth } from "@/lib/auth-helpers";
import { decrypt, encrypt } from "@/lib/encryption";
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
	expiresInHours: z.number().min(1).max(168).default(24), // max 7 days
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

		const { passwordId, expiresInHours, maxViews } = validation.data;

		// Verify ownership
		const password = await prisma.password.findFirst({
			where: { id: passwordId, userId },
		});

		if (!password) {
			return NextResponse.json(
				{ success: false, error: "Mot de passe introuvable" },
				{ status: 404 },
			);
		}

		// Decrypt the password then re-encrypt as standalone content
		let decryptedPassword;
		try {
			decryptedPassword = decrypt(password.password);
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: "Impossible de déchiffrer ce mot de passe",
				},
				{ status: 422 },
			);
		}

		const content = JSON.stringify({
			name: password.name,
			username: password.username,
			email: password.email,
			password: decryptedPassword,
			website: password.website,
			notes: password.notes,
		});
		const encryptedContent = encrypt(content);

		const rawToken = randomBytes(32).toString("hex"); // token brut → URL uniquement, jamais stocké
		const tokenHash = hashToken(rawToken); // hash SHA-256 → stocké en DB
		const expiresAt = new Date(
			Date.now() + expiresInHours * 60 * 60 * 1000,
		);

		const shared = await prisma.sharedPassword.create({
			data: {
				userId,
				name: password.name,
				encryptedContent,
				token: tokenHash, // jamais stocker le token brut
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
				token: rawToken, // retourner le token brut au client (jamais stocké)
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
