import { apiT, getLocale } from "@/lib/api-i18n";
import { verifyTurnstile } from "@/lib/turnstile";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schéma de validation Zod
const contactSchema = z.object({
	name: z.string().optional(),
	email: z
		.string()
		.email("L'adresse email n'est pas valide")
		.trim()
		.toLowerCase(),
	subject: z
		.string()
		.min(3, "Le sujet doit contenir au moins 3 caractères")
		.max(200, "Le sujet ne peut pas dépasser 200 caractères")
		.trim(),
	message: z
		.string()
		.min(10, "Le message doit contenir au moins 10 caractères")
		.max(2000, "Le message ne peut pas dépasser 2000 caractères")
		.trim(),
});

export async function POST(request) {
	try {
		const locale = getLocale(request);
		const body = await request.json();

		// Vérification Cloudflare Turnstile
		const turnstileOk = await verifyTurnstile(body.cfTurnstileToken);
		if (!turnstileOk) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "antiBotFailedContact"),
				},
				{ status: 400 },
			);
		}

		const { sendContactEmail } = await import("@/lib/email");

		try {
			await sendContactEmail(validatedData);
		} catch (emailError) {
			console.error("Erreur lors de l'envoi de l'email:", emailError);
			// En développement, on continue même si l'email échoue
			if (process.env.NODE_ENV !== "development") {
				return NextResponse.json(
					{
						success: false,
						error: apiT(locale, "contactEmailError"),
					},
					{ status: 500 },
				);
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: apiT(locale, "contactSuccess"),
			},
			{ status: 200 },
		);
	} catch (error) {
		// Erreur de validation Zod
		if (error instanceof z.ZodError) {
			const formattedErrors = error.issues.map((err) => ({
				field: err.path[0],
				message: err.message,
			}));

			return NextResponse.json(
				{
					success: false,
					error: apiT(getLocale(request), "contactValidationError"),
					errors: formattedErrors,
				},
				{ status: 400 },
			);
		}

		// Autres erreurs
		console.error("Erreur lors de l'envoi du message:", error);
		return NextResponse.json(
			{
				success: false,
				error: apiT(getLocale(request), "contactGeneralError"),
			},
			{ status: 500 },
		);
	}
}
