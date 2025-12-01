import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generate2FAToken } from "@/lib/auth-tokens";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        // Rate limiting strict pour authentification
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
        const { email, password } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email requis" },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur avec son mot de passe
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
                twoFactorEnabled: true,
                emailVerified: true,
            },
        });

        if (!user) {
            // Par sécurité, ne pas révéler si l'utilisateur existe
            return NextResponse.json({
                twoFactorEnabled: false,
            });
        }

        // Si un mot de passe est fourni ET que la 2FA est activée, valider les credentials
        if (password && user.twoFactorEnabled) {
            const isPasswordValid = await bcrypt.compare(
                password,
                user.passwordHash
            );

            if (!isPasswordValid) {
                return NextResponse.json(
                    { error: "Identifiants invalides" },
                    { status: 401 }
                );
            }

            // Vérifier que l'email est vérifié
            if (!user.emailVerified) {
                return NextResponse.json(
                    { error: "EMAIL_NOT_VERIFIED" },
                    { status: 403 }
                );
            }

            // Générer un token 2FA sécurisé
            const token = generate2FAToken(user.email, user.id);

            // Retourner le token dans la réponse (sécurisé car validé côté serveur)
            const response = {
                twoFactorEnabled: true,
                requiresCode: true,
                token: token, // Token JWT à renvoyer lors de la vérification
            };

            return NextResponse.json(response);
        }

        // Sinon, retourner juste le statut 2FA
        return NextResponse.json({
            twoFactorEnabled: user.twoFactorEnabled || false,
        });
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error("Erreur lors de la vérification 2FA:", error);
        }
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
