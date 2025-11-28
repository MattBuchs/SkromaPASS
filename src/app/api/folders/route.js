import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { folderSchema } from "@/lib/validations";
import { fromZodError } from "zod-validation-error";

// GET /api/folders - Récupérer tous les dossiers
export async function GET() {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const folders = await prisma.folder.findMany({
            where: {
                userId,
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
            data: folders,
        });
    } catch (error) {
        console.error("Error fetching folders:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch folders",
            },
            { status: 500 }
        );
    }
}

// POST /api/folders - Créer un nouveau dossier
export async function POST(request) {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const body = await request.json();

        // Validation avec Zod
        const validation = folderSchema.safeParse(body);
        if (!validation.success) {
            const validationError = fromZodError(validation.error);
            return NextResponse.json(
                {
                    success: false,
                    error: validationError.message,
                },
                { status: 400 }
            );
        }

        const { name, description, color, icon } = validation.data;

        // Vérifier si le dossier existe déjà
        const existingFolder = await prisma.folder.findFirst({
            where: {
                userId,
                name,
            },
        });

        if (existingFolder) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Un dossier avec ce nom existe déjà",
                },
                { status: 400 }
            );
        }

        const folder = await prisma.folder.create({
            data: {
                name,
                description,
                color: color || "#6366f1",
                icon,
                userId,
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: folder,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating folder:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create folder",
            },
            { status: 500 }
        );
    }
}
