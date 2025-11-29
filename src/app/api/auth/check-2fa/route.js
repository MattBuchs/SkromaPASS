import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email requis" },
                { status: 400 }
            );
        }

        // Vérifier si l'utilisateur a la 2FA activée
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                twoFactorEnabled: true,
            },
        });

        if (!user) {
            // Par sécurité, ne pas révéler si l'utilisateur existe
            return NextResponse.json({
                twoFactorEnabled: false,
            });
        }

        return NextResponse.json({
            twoFactorEnabled: user.twoFactorEnabled || false,
        });
    } catch (error) {
        console.error("Erreur lors de la vérification 2FA:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
