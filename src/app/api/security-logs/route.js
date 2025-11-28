import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/security-logs - Récupérer les logs de sécurité
export async function GET(request) {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const action = searchParams.get("action");

        const where = {
            userId,
            ...(action && { action }),
        };

        const logs = await prisma.securityLog.findMany({
            where,
            orderBy: {
                createdAt: "desc",
            },
            take: limit,
        });

        return NextResponse.json({
            success: true,
            data: logs,
        });
    } catch (error) {
        console.error("Error fetching security logs:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch security logs",
            },
            { status: 500 }
        );
    }
}
