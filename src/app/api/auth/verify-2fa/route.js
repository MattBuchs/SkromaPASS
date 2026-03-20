import { apiT, getLocale } from "@/lib/api-i18n";
import { verify2FAToken } from "@/lib/auth-tokens";
import prisma from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		// Rate limiting strict pour tentatives 2FA
		const { rateLimit } = await import("@/lib/security");
		const rateLimitResult = rateLimit(req, { endpoint: "auth" });

		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ error: apiT(locale, "tooManyAttempts") },
				{ status: 429 },
			);
		}

		const body = await req.json();
		const { token, authToken } = body;

		if (process.env.NODE_ENV === "development") {
			console.log("DEBUG SERVER - Received body:", {
				hasToken: !!token,
				hasAuthToken: !!authToken,
				authTokenLength: authToken?.length,
			});
		}

		if (!token) {
			return NextResponse.json(
				{ error: apiT(locale, "codeRequired") },
				{ status: 400 },
			);
		}

		if (!authToken) {
			console.error("ERROR SERVER - No authToken received");
			return NextResponse.json(
				{ error: apiT(locale, "invalidOrExpiredToken") },
				{ status: 401 },
			);
		}

		// Vérifier le token JWT
		const payload = verify2FAToken(authToken);
		if (!payload) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidOrExpiredToken") },
				{ status: 401 },
			);
		}

		// Récupérer l'utilisateur
		const user = await prisma.user.findUnique({
			where: { email: payload.email },
			select: {
				id: true,
				email: true,
				twoFactorSecret: true,
				twoFactorEnabled: true,
			},
		});

		if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidData") },
				{ status: 400 },
			);
		}

		// Vérifier le code TOTP
		const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

		if (!isValid) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidCode") },
				{ status: 400 },
			);
		}

		// Code valide - Créer un token de session validé
		// Ce token sera utilisé pour authentifier l'utilisateur via NextAuth
		const { create2FAVerifiedToken } = await import("@/lib/auth-tokens");
		const verifiedToken = create2FAVerifiedToken(user.email, user.id);

		return NextResponse.json({
			success: true,
			verifiedToken,
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
