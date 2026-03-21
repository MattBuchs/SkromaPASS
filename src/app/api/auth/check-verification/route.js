import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		const { email } = await req.json();

		if (!email) {
			return NextResponse.json(
				{ error: apiT(locale, "emailRequired") },
				{ status: 400 },
			);
		}

		// Vérifier l'état de vérification de l'email
		const user = await prisma.user.findUnique({
			where: { email },
			select: {
				emailVerified: true,
			},
		});

		if (!user) {
			// Par sécurité, on ne révèle pas si l'utilisateur existe
			return NextResponse.json(
				{ emailNotVerified: false },
				{ status: 200 },
			);
		}

		return NextResponse.json({
			emailNotVerified: !user.emailVerified,
		});
	} catch (error) {
		console.error("Erreur lors de la vérification:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(req), "serverError") },
			{ status: 500 },
		);
	}
}
