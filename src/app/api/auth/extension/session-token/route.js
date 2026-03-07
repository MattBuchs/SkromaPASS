import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// GET /api/auth/extension/session-token - Génère un token extension depuis la session web
export async function GET(request) {
	try {
		// Rate limiting
		const rateLimitResult = rateLimit(request);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: "Trop de requêtes" },
				{ status: 429 },
			);
		}

		const session = await auth();

		if (!session || !session.user?.email) {
			return NextResponse.json(
				{ success: false, error: "Non authentifié" },
				{ status: 401 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, email: true, name: true, emailVerified: true },
		});

		if (!user) {
			return NextResponse.json(
				{ success: false, error: "Utilisateur introuvable" },
				{ status: 404 },
			);
		}

		if (!user.emailVerified) {
			return NextResponse.json(
				{
					success: false,
					error: "Veuillez vérifier votre email avant d'utiliser l'extension",
				},
				{ status: 403 },
			);
		}

		const token = jwt.sign(
			{ userId: user.id, email: user.email, type: "extension" },
			JWT_SECRET,
			{ expiresIn: "15d" },
		);

		return NextResponse.json({
			success: true,
			token,
			user: { id: user.id, email: user.email, name: user.name },
		});
	} catch (error) {
		console.error("[API session-token] Erreur:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur serveur" },
			{ status: 500 },
		);
	}
}
