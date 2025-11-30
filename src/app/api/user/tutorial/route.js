import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET - Récupérer l'état du tutoriel
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { hasSeenTutorial: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur non trouvé" },
                { status: 404 }
            );
        }

        return NextResponse.json({ hasSeenTutorial: user.hasSeenTutorial });
    } catch (error) {
        console.error(
            "Erreur lors de la récupération du statut du tutoriel:",
            error
        );
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// PUT - Mettre à jour l'état du tutoriel
export async function PUT(req) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { hasSeenTutorial } = body;

        if (typeof hasSeenTutorial !== "boolean") {
            return NextResponse.json(
                { error: "hasSeenTutorial doit être un booléen" },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: { hasSeenTutorial },
            select: { hasSeenTutorial: true },
        });

        return NextResponse.json({ hasSeenTutorial: user.hasSeenTutorial });
    } catch (error) {
        console.error(
            "Erreur lors de la mise à jour du statut du tutoriel:",
            error
        );
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
