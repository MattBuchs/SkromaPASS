import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
        return NextResponse.json(
            { error: "Une erreur est survenue" },
            { status: 500 }
        );
    }
}
