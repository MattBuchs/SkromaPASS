import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/categories - Récupérer toutes les catégories
export async function GET() {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const categories = await prisma.category.findMany({
            where: {
                OR: [{ userId }, { isDefault: true }],
            },
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

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request) {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const body = await request.json();
        const { name, color, icon } = body;

        if (!name) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name is required",
                },
                { status: 400 }
            );
        }

        // Générer un slug unique
        const slug = name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        const category = await prisma.category.create({
            data: {
                name,
                slug: `${slug}-${Date.now()}`,
                color: color || "#3b82f6",
                icon,
                userId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: category,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create category",
            },
            { status: 500 }
        );
    }
}
