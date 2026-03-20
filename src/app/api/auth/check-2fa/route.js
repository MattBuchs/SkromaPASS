import { apiT, getLocale } from "@/lib/api-i18n";
import { generate2FAToken } from "@/lib/auth-tokens";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		// Rate limiting strict pour authentification
		const { rateLimit } = await import("@/lib/security");
		const rateLimitResult = rateLimit(req, { endpoint: "auth" });

		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ error: apiT(locale, "tooManyAttempts") },
				{ status: 429 },
			);
		}

		const body = await req.json();
		const { email, password } = body;

		if (!email) {
			return NextResponse.json(
				{ error: apiT(locale, "emailRequired") },
				{ status: 400 },
			);
		}

		// Récupérer l'utilisateur avec son mot de passe
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				passwordHash: true,
				twoFactorEnabled: true,
				emailVerified: true,
			},
		});

		if (!user) {
			// Par sécurité, ne pas révéler si l'utilisateur existe
			return NextResponse.json({
				twoFactorEnabled: false,
			});
		}

		// Si un mot de passe est fourni ET que la 2FA est activée, valider les credentials
		if (password && user.twoFactorEnabled) {
			const isPasswordValid = await bcrypt.compare(
				password,
				user.passwordHash,
			);

			if (!isPasswordValid) {
				return NextResponse.json(
					{ error: apiT(locale, "invalidCredentials") },
					{ status: 401 },
				);
			}

			// Vérifier que l'email est vérifié
			if (!user.emailVerified) {
				return NextResponse.json(
					{ error: "EMAIL_NOT_VERIFIED" },
					{ status: 403 },
				);
			}

			// Générer un token 2FA sécurisé
			const token = generate2FAToken(user.email, user.id);

			return NextResponse.json({
				twoFactorEnabled: true,
				requiresCode: true,
				token,
			});
		}

		// Sinon, retourner juste le statut 2FA
		return NextResponse.json({
			twoFactorEnabled: user.twoFactorEnabled || false,
		});
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("Erreur lors de la vérification 2FA:", error);
		}
		return NextResponse.json(
			{ error: apiT(getLocale(req), "serverError") },
			{ status: 500 },
		);
	}
}
