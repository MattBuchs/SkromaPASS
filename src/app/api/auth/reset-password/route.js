import { apiT, getLocale } from "@/lib/api-i18n";
import {
	consumePasswordResetToken,
	verifyPasswordResetToken,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

function getSchema(t) {
	return z.object({
		token: z.string().min(64).max(64),
		email: z.string().email(),
		password: z
			.string()
			.min(8, t("passwordMinLength"))
			.regex(/[a-z]/, t("passwordNeedsLowercase"))
			.regex(/[A-Z]/, t("passwordNeedsUppercase"))
			.regex(/[0-9]/, t("passwordNeedsNumber"))
			.regex(/[^A-Za-z0-9]/, t("passwordNeedsSpecial"))
			.max(128, t("passwordTooLong")),
	});
}

export async function POST(request) {
	const locale = getLocale(request);
	const tl = (key) => apiT(locale, key);
	// Rate limiting strict : 10 tentatives par 15 minutes par IP
	const rateLimitResult = rateLimit(request, {
		endpoint: "reset-password",
		maxRequests: 10,
		windowMs: 15 * 60 * 1000,
	});

	if (!rateLimitResult.allowed) {
		return NextResponse.json(
			{ message: tl("tooManyAttempts15") },
			{ status: 429 },
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ message: tl("invalidBody") },
			{ status: 400 },
		);
	}

	const schema = getSchema(tl);
	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		const firstError = parsed.error.errors[0]?.message;
		return NextResponse.json(
			{ message: firstError || tl("invalidData") },
			{ status: 400 },
		);
	}

	const { token, email, password } = parsed.data;

	try {
		// Vérifier le token (usage unique + expiration)
		const isValid = await verifyPasswordResetToken(email, token);
		if (!isValid) {
			return NextResponse.json(
				{ message: tl("invalidResetLink") },
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
				{ message: tl("userIntrouvable") },
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
				{ message: tl("samePasswordError") },
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
			{ message: tl("passwordResetSuccess") },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[reset-password] Erreur:", error);
		return NextResponse.json(
			{ message: tl("forgotPasswordError") },
			{ status: 500 },
		);
	}
}
