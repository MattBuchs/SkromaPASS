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

        // Vérifier l'état de vérification de l'email
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                emailVerified: true,
            },
        });

        if (!user) {
            // Par sécurité, on ne révèle pas si l'utilisateur existe
            return NextResponse.json(
                { emailNotVerified: false },
                { status: 200 }
            );
        }

        return NextResponse.json({
            emailNotVerified: !user.emailVerified,
        });
    } catch (error) {
        console.error("Erreur lors de la vérification:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
