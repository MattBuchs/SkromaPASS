import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { pin } = await req.json();

        if (!pin) {
            return NextResponse.json(
                { error: "Code PIN requis" },
                { status: 400 }
            );
        }

        // Validation du format PIN (4-8 chiffres)
        if (!/^\d{4,8}$/.test(pin)) {
            return NextResponse.json(
                { error: "Code PIN invalide" },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur avec son PIN hashé
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                pinCode: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur a configuré un PIN
        if (!user.pinCode) {
            return NextResponse.json(
                {
                    error: "Code PIN non configuré. Configurez-le dans les paramètres.",
                },
                { status: 400 }
            );
        }

        // Vérifier le PIN
        const isValid = await bcrypt.compare(pin, user.pinCode);

        if (!isValid) {
            return NextResponse.json(
                { error: "Code PIN incorrect" },
                { status: 401 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Authentification réussie",
        });
    } catch (error) {
        console.error("Erreur lors de la vérification du PIN:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
