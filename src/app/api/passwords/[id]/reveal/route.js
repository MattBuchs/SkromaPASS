import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import { verifyReauthToken } from "@/lib/auth-tokens";
import { decrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";

// GET /api/passwords/[id]/reveal
// Déchiffre et retourne le mot de passe en clair pour un item précis.
// Nécessite : session valide + cookie reauth-token (PIN / biométrie validé récemment).
export async function GET(request, { params }) {
	try {
		const locale = getLocale(request);

		// Rate limiting strict (per-IP) pour limiter le bruteforce
		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "tooManyRequests") },
				{ status: 429 },
			);
		}

		// 1. Vérifier la session
		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		// 2. Vérifier le cookie reauth-token (PIN/biométrie)
		const reauthCookie = request.cookies.get("reauth-token");
		if (!reauthCookie) {
			logSecurityEvent("REVEAL_DENIED_NO_REAUTH", { userId });
			return NextResponse.json(
				{ success: false, error: apiT(locale, "reauthRequired") },
				{ status: 403 },
			);
		}

		const reauthPayload = verifyReauthToken(reauthCookie.value);
		if (!reauthPayload || reauthPayload.userId !== userId) {
			logSecurityEvent("REVEAL_DENIED_INVALID_REAUTH", { userId });
			return NextResponse.json(
				{ success: false, error: apiT(locale, "reauthRequired") },
				{ status: 403 },
			);
		}

		// 3. Récupérer le mot de passe (appartenant à l'utilisateur)
		const { id } = await params;
		const record = await prisma.password.findFirst({
			where: { id, userId },
		});

		if (!record) {
			return NextResponse.json(
				{ success: false, error: "Password not found" },
				{ status: 404 },
			);
		}

		// 4. Déchiffrer
		let plaintext;
		try {
			plaintext = decrypt(record.password);
		} catch {
			return NextResponse.json(
				{ success: false, error: "Decryption failed" },
				{ status: 500 },
			);
		}

		logSecurityEvent("PASSWORD_REVEALED", { userId, passwordId: id });

		return NextResponse.json({ success: true, password: plaintext });
	} catch (error) {
		console.error("Error revealing password:", error);
		return NextResponse.json(
			{ success: false, error: "Internal server error" },
			{ status: 500 },
		);
	}
}
