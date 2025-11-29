import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// PUT - Changer le mot de passe
export async function PUT(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Les mots de passe sont requis" },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                {
                    error: "Le nouveau mot de passe doit contenir au moins 8 caractères",
                },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur avec son mot de passe
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        // Vérifier le mot de passe actuel
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Mot de passe actuel incorrect" },
                { status: 400 }
            );
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword },
        });

        return NextResponse.json({
            message: "Mot de passe mis à jour avec succès",
        });
    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
