import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { signIn } from "@/auth";

export async function POST(req) {
    try {
        const { email, token } = await req.json();

        if (!email || !token) {
            return NextResponse.json(
                { error: "Email et code requis" },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
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

        // Vérifier le code
        const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

        if (!isValid) {
            return NextResponse.json(
                { error: "Code invalide. Veuillez réessayer." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Code vérifié avec succès",
        });
    } catch (error) {
        console.error("Erreur lors de la vérification 2FA:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
