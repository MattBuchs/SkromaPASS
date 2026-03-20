import { apiT, getLocale } from "@/lib/api-i18n";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		const { email, locale: bodyLocale } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: apiT(locale, "emailRequired") },
				{ status: 400 },
			);
		}

		// Vérifier que l'utilisateur existe
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				id: true,
				email: true,
				emailVerified: true,
			},
		});

		if (!user) {
			// Par sécurité, on ne révèle pas si l'email existe ou non
			return NextResponse.json(
				{ message: apiT(locale, "resendEmailSuccess") },
				{ status: 200 },
			);
		}

		// Vérifier si l'email n'est pas déjà vérifié
		if (user.emailVerified) {
			return NextResponse.json(
				{ error: apiT(locale, "emailAlreadyVerified") },
				{ status: 400 },
			);
		}

		// Générer un nouveau token et envoyer l'email
		const token = await generateVerificationToken(email);
		const safeLocale = bodyLocale === "en" ? "en" : "fr";
		await sendVerificationEmail(email, token, safeLocale);
		return NextResponse.json({
			message: apiT(locale, "resendEmailSent"),
		});
	} catch (error) {
		console.error(
			"Erreur lors du renvoi de l'email de vérification:",
			error,
		);
		const locale = getLocale(req);
		return NextResponse.json(
			{ error: apiT(locale, "resendEmailError") },
			{ status: 500 },
		);
	}
}
