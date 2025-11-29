import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// DELETE - Supprimer le compte utilisateur
export async function DELETE(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { password } = await request.json();

        if (!password) {
            return NextResponse.json(
                {
                    error: "Le mot de passe est requis pour supprimer le compte",
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

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Mot de passe incorrect" },
                { status: 400 }
            );
        }

        // Supprimer l'utilisateur (cascade supprimera les données liées)
        await prisma.user.delete({
            where: { id: session.user.id },
        });

        return NextResponse.json({
            message: "Compte supprimé avec succès",
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
