import { apiT, getLocale } from "@/lib/api-i18n";
import {
	generatePasswordResetToken,
	sendPasswordResetEmail,
} from "@/lib/email";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import { verifyTurnstile } from "@/lib/turnstile";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
	email: z.string().email(),
});

export async function POST(request) {
	const locale = getLocale(request);
	// Rate limiting strict : 5 requêtes par 15 minutes par IP
	const rateLimitResult = rateLimit(request, {
		endpoint: "forgot-password",
		maxRequests: 5,
		windowMs: 15 * 60 * 1000,
	});

	if (!rateLimitResult.allowed) {
		return NextResponse.json(
			{ message: apiT(locale, "tooManyAttempts15") },
			{ status: 429 },
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ message: apiT(locale, "invalidBody") },
			{ status: 400 },
		);
	}

	const parsed = schema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ message: apiT(locale, "invalidEmailMsg") },
			{ status: 400 },
		);
	}

	// Vérification Cloudflare Turnstile
	const turnstileOk = await verifyTurnstile(body.cfTurnstileToken);
	if (!turnstileOk) {
		return NextResponse.json(
			{ message: apiT(locale, "antiBotFailed") },
			{ status: 400 },
		);
	}

	const { email } = parsed.data;

	try {
		// Toujours retourner un succès pour ne pas divulguer l'existence d'un compte
		const user = await prisma.user.findUnique({
			where: { email },
			select: { id: true, email: true, emailVerified: true },
		});

		if (user && user.emailVerified) {
			const token = await generatePasswordResetToken(email);
			const emailLocale = body.locale === "en" ? "en" : "fr";
			await sendPasswordResetEmail(email, token, emailLocale);
		}

		// Délai constant pour éviter le timing attack
		return NextResponse.json(
			{ message: apiT(locale, "forgotPasswordSuccess") },
			{ status: 200 },
		);
	} catch (error) {
		console.error("[forgot-password] Erreur:", error);
		return NextResponse.json(
			{ message: apiT(locale, "forgotPasswordError") },
			{ status: 500 },
		);
	}
}
