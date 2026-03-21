import { apiT, getLocale } from "@/lib/api-i18n";
import { verifyEmailToken } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		const { email, token } = await req.json();

		if (!email || !token) {
			return NextResponse.json(
				{ error: apiT(locale, "emailAndTokenRequired") },
				{ status: 400 },
			);
		}

		// Vérifier le token
		const isValid = await verifyEmailToken(email, token);

		if (!isValid) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidOrExpiredToken") },
				{ status: 400 },
			);
		}

		// Mettre à jour l'utilisateur pour marquer l'email comme vérifié
		const user = await prisma.user.update({
			where: { email },
			data: {
				emailVerified: new Date(),
			},
			select: {
				id: true,
				email: true,
				name: true,
				emailVerified: true,
			},
		});

		return NextResponse.json({
			message: apiT(locale, "emailVerifiedSuccess"),
			user,
		});
	} catch (error) {
		console.error("Erreur lors de la vérification de l'email:", error);
		const locale = getLocale(req);

		// Si l'utilisateur n'existe pas
		if (error.code === "P2025") {
			return NextResponse.json(
				{ error: apiT(locale, "userNotFound") },
				{ status: 404 },
			);
		}

		return NextResponse.json(
			{ error: apiT(locale, "anErrorOccurred") },
			{ status: 500 },
		);
	}
}

// Route GET pour vérifier via URL (redirection depuis l'email)
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");
		const token = searchParams.get("token");

		if (!email || !token) {
			return NextResponse.redirect(
				new URL("/verify-email?error=missing_params", req.url),
			);
		}

		// Vérifier le token
		const isValid = await verifyEmailToken(email, token);

		if (!isValid) {
			return NextResponse.redirect(
				new URL("/verify-email?error=invalid_token", req.url),
			);
		}

		// Mettre à jour l'utilisateur
		await prisma.user.update({
			where: { email },
			data: {
				emailVerified: new Date(),
			},
		});

		return NextResponse.redirect(
			new URL("/verify-email?success=true", req.url),
		);
	} catch (error) {
		console.error("Erreur lors de la vérification de l'email:", error);
		return NextResponse.redirect(
			new URL("/verify-email?error=server_error", req.url),
		);
	}
}
