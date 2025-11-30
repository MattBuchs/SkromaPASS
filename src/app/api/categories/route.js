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

// POST /api/categories - Créer une nouvelle catégorie
export async function POST(request) {
    try {
        // Vérifier l'authentification
        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

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
