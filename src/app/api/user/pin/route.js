import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// GET - Vérifier si l'utilisateur a un PIN configuré
export async function GET(req) {
	try {
		const locale = getLocale(req);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { pinCode: true },
		});

		return NextResponse.json({
			hasPin: !!user?.pinCode,
		});
	} catch (error) {
		console.error("Erreur vérification PIN:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(req), "pinVerifyError") },
			{ status: 500 },
		);
	}
}

// POST - Créer ou modifier le PIN
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

		const { pin, currentPassword } = await req.json();

		// Validation du PIN (4 à 8 chiffres)
		if (!pin || !/^\d{4,8}$/.test(pin)) {
			return NextResponse.json(
				{ error: apiT(locale, "pinInvalidFormat") },
				{ status: 400 },
			);
		}

		// Vérifier le mot de passe principal pour sécurité
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { passwordHash: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: apiT(locale, "userNotFound") },
				{ status: 404 },
			);
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: apiT(locale, "incorrectPassword") },
				{ status: 401 },
			);
		}

		// Hasher et sauvegarder le PIN
		const hashedPin = await bcrypt.hash(pin, 12);

		await prisma.user.update({
			where: { id: session.user.id },
			data: { pinCode: hashedPin },
		});

		return NextResponse.json({
			success: true,
			message: apiT(locale, "pinSetSuccess"),
		});
	} catch (error) {
		console.error("Erreur configuration PIN:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(req), "serverError") },
			{ status: 500 },
		);
	}
}

// DELETE - Supprimer le PIN
export async function DELETE(req) {
	try {
		const locale = getLocale(req);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const { currentPassword } = await req.json();

		// Vérifier le mot de passe principal
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { passwordHash: true },
		});

		if (!user) {
			return NextResponse.json(
				{ error: apiT(locale, "userNotFound") },
				{ status: 404 },
			);
		}

		const isPasswordValid = await bcrypt.compare(
			currentPassword,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			return NextResponse.json(
				{ error: apiT(locale, "incorrectPassword") },
				{ status: 401 },
			);
		}

		// Supprimer le PIN
		await prisma.user.update({
			where: { id: session.user.id },
			data: { pinCode: null },
		});

		return NextResponse.json({
			success: true,
			message: apiT(locale, "pinDeleted"),
		});
	} catch (error) {
		console.error("Erreur suppression PIN:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(req), "serverError") },
			{ status: 500 },
		);
	}
}
