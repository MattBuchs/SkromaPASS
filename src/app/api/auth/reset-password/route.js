import {
	consumePasswordResetToken,
	verifyPasswordResetToken,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	token: z.string().min(64).max(64),
	email: z.string().email(),
	password: z
		.string()
		.min(8, "Le mot de passe doit contenir au moins 8 caractères")
		.regex(
			/[a-z]/,
			"Le mot de passe doit contenir au moins une lettre minuscule",
		)
		.regex(
			/[A-Z]/,
			"Le mot de passe doit contenir au moins une lettre majuscule",
		)
		.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
		.regex(
			/[^A-Za-z0-9]/,
			"Le mot de passe doit contenir au moins un caractère spécial",
		)
		.max(128, "Le mot de passe est trop long"),
});

export async function POST(request) {
	// Rate limiting strict : 10 tentatives par 15 minutes par IP
	const rateLimitResult = rateLimit(request, {
		endpoint: "reset-password",
		maxRequests: 10,
		windowMs: 15 * 60 * 1000,
	});

	if (!rateLimitResult.allowed) {
		return NextResponse.json(
			{ message: "Trop de tentatives. Réessayez dans 15 minutes." },
			{ status: 429 },
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ message: "Corps de requête invalide." },
			{ status: 400 },
		);
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		const firstError = parsed.error.errors[0]?.message;
		return NextResponse.json(
			{ message: firstError || "Données invalides." },
			{ status: 400 },
		);
	}

	const { token, email, password } = parsed.data;

	try {
		// Vérifier le token (usage unique + expiration)
		const isValid = await verifyPasswordResetToken(email, token);
		if (!isValid) {
			return NextResponse.json(
				{
					message:
						"Ce lien est invalide ou a expiré. Demandez un nouveau lien.",
				},
				{ status: 400 },
			);
		}

		// Trouver l'utilisateur
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, passwordHash: true },
		});

		if (!user) {
			return NextResponse.json(
				{ message: "Utilisateur introuvable." },
				{ status: 400 },
			);
		}

		// Vérifier que le nouveau mot de passe est différent de l'ancien
		const isSamePassword = await bcrypt.compare(
			password,
			user.passwordHash,
		);
		if (isSamePassword) {
			return NextResponse.json(
				{
					message:
						"Le nouveau mot de passe doit être différent de l'ancien.",
				},
				{ status: 400 },
			);
		}

		// Hacher le nouveau mot de passe (coût 12 pour la sécurité)
		const newPasswordHash = await bcrypt.hash(password, 12);

		// Mettre à jour le mot de passe et invalider toutes les sessions
		await prisma.$transaction([
			prisma.user.update({
				where: { id: user.id },
				data: { passwordHash: newPasswordHash },
			}),
			// Invalider toutes les sessions existantes pour forcer la re-connexion
			prisma.session.deleteMany({
				where: { userId: user.id },
			}),
		]);

		// Consommer le token seulement après succès (usage unique)
		await consumePasswordResetToken(email, token);

		return NextResponse.json(
			{ message: "Mot de passe réinitialisé avec succès." },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[reset-password] Erreur:", error);
		return NextResponse.json(
			{ message: "Une erreur est survenue. Réessayez plus tard." },
			{ status: 500 },
		);
	}
}
