import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET - Récupérer les informations du profil
export async function GET(request) {
	try {
		const locale = getLocale(request);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: {
				id: true,
				email: true,
				name: true,
				createdAt: true,
				emailVerified: true,
				_count: {
					select: { passwords: true },
				},
			},
		});

		if (!user) {
			return NextResponse.json(
				{ error: apiT(locale, "userNotFound") },
				{ status: 404 },
			);
		}

		return NextResponse.json(user);
	} catch (error) {
		console.error("Erreur lors de la récupération du profil:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}

// PATCH - Mettre à jour les informations du profil
export async function PATCH(request) {
	try {
		const locale = getLocale(request);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const { name, email } = await request.json();

		// Vérifier si l'email existe déjà (si changé)
		if (email && email !== session.user.email) {
			const existingUser = await prisma.user.findUnique({
				where: { email },
			});

			if (existingUser && existingUser.id !== session.user.id) {
				return NextResponse.json(
					{ error: apiT(locale, "emailAlreadyUsed") },
					{ status: 400 },
				);
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: session.user.id },
			data: {
				...(name !== undefined && { name }),
				...(email !== undefined && { email }),
			},
			select: {
				id: true,
				email: true,
				name: true,
			},
		});

		return NextResponse.json(updatedUser);
	} catch (error) {
		console.error("Erreur lors de la mise à jour du profil:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
