import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateReauthToken } from "@/lib/auth-tokens";

/**
 * POST /api/auth/reauth-token
 * Génère un token de réauthentification valide 15 minutes
 */
export async function POST() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        // Générer un token de réauthentification
        const token = generateReauthToken(session.user.id);

        // Retourner le token dans un HttpOnly cookie
        const response = NextResponse.json({
            success: true,
            expiresIn: 15 * 60, // 15 minutes en secondes
        });

        response.cookies.set("reauth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60, // 15 minutes
            path: "/",
        });

        return response;
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Erreur génération token reauth:", error);
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

/**
 * GET /api/auth/reauth-token
 * Vérifie si le token de réauthentification est valide
 */
export async function GET(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { valid: false, error: "Non authentifié" },
                { status: 401 }
            );
        }

        // Vérifier le cookie de réauthentification
        const token = request.cookies.get("reauth-token");

        if (!token) {
            return NextResponse.json({
                valid: false,
                reason: "no-token",
            });
        }

        // Importer la fonction de vérification
        const { verifyReauthToken } = await import("@/lib/auth-tokens");
        const payload = verifyReauthToken(token.value);

        if (!payload || payload.userId !== session.user.id) {
            return NextResponse.json({
                valid: false,
                reason: "invalid-token",
            });
        }

        return NextResponse.json({
            valid: true,
            expiresAt: payload.exp * 1000, // Convertir en millisecondes
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Erreur vérification token reauth:", error);
        }
        return NextResponse.json({
            valid: false,
            reason: "error",
        });
    }
}

/**
 * DELETE /api/auth/reauth-token
 * Supprime le token de réauthentification
 */
export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete("reauth-token");
    return response;
}
