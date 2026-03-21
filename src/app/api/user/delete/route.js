import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import { AuditActions, getRequestMetadata, logAudit } from "@/lib/audit-log";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// DELETE - Supprimer le compte utilisateur
export async function DELETE(request) {
	try {
		const locale = getLocale(request);
		const session = await auth();

		if (!session?.user?.id) {
			return NextResponse.json(
				{ error: apiT(locale, "unauthenticated") },
				{ status: 401 },
			);
		}

		const { password } = await request.json();

		if (!password) {
			return NextResponse.json(
				{ error: apiT(locale, "deletePasswordRequired") },
				{ status: 400 },
			);
		}

		// Récupérer l'utilisateur avec son mot de passe
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
		});

		if (!user || !user.passwordHash) {
			return NextResponse.json(
				{ error: apiT(locale, "invalidCredentials") },
				{ status: 401 },
			);
		}

		// Vérifier le mot de passe
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

		// Logger avant suppression
		const { ip, userAgent } = getRequestMetadata(request);
		await logAudit({
			action: AuditActions.USER_DELETED,
			userId: session.user.id,
			resource: "USER",
			resourceId: session.user.id,
			ip,
			userAgent,
			success: true,
		});

		// Supprimer l'utilisateur (cascade supprimera les données liées)
		await prisma.user.delete({
			where: { id: session.user.id },
		});

		return NextResponse.json({
			message: apiT(getLocale(request), "accountDeleted"),
		});
	} catch (error) {
		console.error("Erreur lors de la suppression du compte:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
