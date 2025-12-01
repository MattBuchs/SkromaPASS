import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET /api/categories - Récupérer toutes les catégories
export async function GET() {
    try {
        // Vérifier l'authentification
        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: { passwords: true },
                },
            },
            orderBy: {
                name: "asc",
            },
        });

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch categories",
            },
            { status: 500 }
        );
    }
}
