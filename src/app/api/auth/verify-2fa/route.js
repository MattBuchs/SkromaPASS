import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { verify2FAToken } from "@/lib/auth-tokens";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        // Rate limiting strict pour tentatives 2FA
        const { rateLimit } = await import("@/lib/security");
        const rateLimitResult = rateLimit(req, { endpoint: "auth" });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: "Trop de tentatives. Réessayez dans quelques minutes.",
                },
                { status: 429 }
            );
        }

        const body = await req.json();
        const { token, authToken } = body;

        console.log("DEBUG SERVER - Received body:", {
            hasToken: !!token,
            hasAuthToken: !!authToken,
            authTokenLength: authToken?.length,
        });

        if (!token) {
            return NextResponse.json({ error: "Code requis" }, { status: 400 });
        }

        if (!authToken) {
            console.error("ERROR SERVER - No authToken received");
            return NextResponse.json(
                { error: "Session 2FA expirée. Veuillez vous reconnecter." },
                { status: 401 }
            );
        }

        // Vérifier le token JWT
        const payload = verify2FAToken(authToken);
        if (!payload) {
            return NextResponse.json(
                { error: "Token 2FA invalide ou expiré" },
                { status: 401 }
            );
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email: payload.email },
            select: {
                id: true,
                email: true,
                twoFactorSecret: true,
                twoFactorEnabled: true,
            },
        });

        if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
            return NextResponse.json(
                { error: "Configuration 2FA invalide" },
                { status: 400 }
            );
        }

        // Vérifier le code TOTP
        const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

        if (!isValid) {
            return NextResponse.json(
                { error: "Code invalide. Veuillez réessayer." },
                { status: 400 }
            );
        }

        // Code valide
        return NextResponse.json({
            success: true,
            message: "Code vérifié avec succès",
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Erreur lors de la vérification 2FA:", error);
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
