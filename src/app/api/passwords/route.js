import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/passwords - Récupérer tous les mots de passe de l'utilisateur
export async function GET(request) {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("category");
        const folderId = searchParams.get("folder");
        const search = searchParams.get("search");
        const isFavorite = searchParams.get("favorite");

        // Construire les filtres
        const where = {
            userId,
            ...(categoryId && { categoryId }),
            ...(folderId && { folderId }),
            ...(isFavorite && { isFavorite: isFavorite === "true" }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { username: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                    { website: { contains: search, mode: "insensitive" } },
                ],
            }),
        };

        const passwords = await prisma.password.findMany({
            where,
            include: {
                category: true,
                folder: true,
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        return NextResponse.json({
            success: true,
            data: passwords,
        });
    } catch (error) {
        console.error("Error fetching passwords:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch passwords",
            },
            { status: 500 }
        );
    }
}

// POST /api/passwords - Créer un nouveau mot de passe
export async function POST(request) {
    try {
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const body = await request.json();
        const {
            name,
            username,
            email,
            password,
            website,
            notes,
            categoryId,
            folderId,
            strength,
        } = body;

        // Validation
        if (!name || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Name and password are required",
                },
                { status: 400 }
            );
        }

        // TODO: Chiffrer le mot de passe avant de le sauvegarder
        // Pour l'instant, on le sauvegarde tel quel (à chiffrer en production!)

        const newPassword = await prisma.password.create({
            data: {
                name,
                username,
                email,
                password, // TODO: Chiffrer
                website,
                notes,
                strength: strength || 0,
                userId,
                categoryId,
                folderId,
            },
            include: {
                category: true,
                folder: true,
            },
        });

        // Log de sécurité
        await prisma.securityLog.create({
            data: {
                userId,
                action: "PASSWORD_CREATED",
                entityType: "PASSWORD",
                entityId: newPassword.id,
                status: "SUCCESS",
            },
        });

        return NextResponse.json(
            {
                success: true,
                data: newPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating password:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create password",
            },
            { status: 500 }
        );
    }
}
