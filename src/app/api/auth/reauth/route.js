import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
	try {
		const locale = getLocale(req);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const { pin } = await req.json();

		if (!pin) {
			return NextResponse.json(
				{ error: apiT(locale, "codeRequired") },
				{ status: 400 },
			);
		}

		// Validation du format PIN (4-8 chiffres)
		if (!/^\d{4,8}$/.test(pin)) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidData") },
				{ status: 400 },
			);
		}

		// Récupérer l'utilisateur avec son PIN hashé
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				pinCode: true,
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: apiT(locale, "userNotFound") },
				{ status: 404 },
			);
		}

		// Vérifier si l'utilisateur a configuré un PIN
		if (!user.pinCode) {
			return NextResponse.json(
				{ error: apiT(locale, "pinNotConfigured") },
				{ status: 400 },
			);
		}

		// Vérifier le PIN
		const isValid = await bcrypt.compare(pin, user.pinCode);

		if (!isValid) {
			return NextResponse.json(
				{ error: apiT(locale, "pinIncorrect") },
				{ status: 401 },
			);
		}

		return NextResponse.json({
			success: true,
			message: apiT(locale, "reauthSuccess"),
		});
	} catch (error) {
		console.error("Erreur lors de la vérification du PIN:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(req), "serverError") },
			{ status: 500 },
		);
	}
}
