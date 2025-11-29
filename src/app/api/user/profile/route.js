import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer les informations du profil
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
                createdAt: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PATCH - Mettre à jour les informations du profil
export async function PATCH(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { name, email } = await request.json();

        // Vérifier si l'email existe déjà (si changé)
        if (email && email !== session.user.email) {
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser && existingUser.id !== session.user.id) {
                return NextResponse.json(
                    { error: "Cet email est déjà utilisé" },
                    { status: 400 }
                );
            }
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
