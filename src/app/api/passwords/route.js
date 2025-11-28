import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { rateLimit, logSecurityEvent } from "@/lib/security";

// GET /api/passwords - Récupérer tous les mots de passe de l'utilisateur
export async function GET(request) {
    try {
        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requêtes, veuillez réessayer plus tard",
                },
                { status: 429 }
            );
        }

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

        // Déchiffrer les mots de passe
        const decryptedPasswords = passwords.map((pwd) => {
            try {
                return {
                    ...pwd,
                    password: decrypt(pwd.password),
                };
            } catch (error) {
                console.error(
                    `Erreur déchiffrement password ${pwd.id}:`,
                    error
                );
                // En cas d'erreur, masquer le mot de passe
                return {
                    ...pwd,
                    password: "***ERROR***",
                };
            }
        });

        // Log de sécurité
        logSecurityEvent("PASSWORDS_FETCHED", {
            userId,
            count: passwords.length,
        });

        return NextResponse.json({
            success: true,
            data: decryptedPasswords,
        });
    } catch (error) {
        console.error("Error fetching passwords:", error);
        logSecurityEvent("ERROR_FETCHING_PASSWORDS", { error: error.message });
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
        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requêtes, veuillez réessayer plus tard",
                },
                { status: 429 }
            );
        }

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

        // Chiffrer le mot de passe avec AES-256-GCM
        const encryptedPassword = encrypt(password);

        const newPassword = await prisma.password.create({
            data: {
                name,
                username,
                email,
                password: encryptedPassword,
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

        logSecurityEvent("PASSWORD_CREATED", {
            userId,
            passwordId: newPassword.id,
        });

        // Retourner le mot de passe déchiffré pour l'affichage
        return NextResponse.json(
            {
                success: true,
                data: {
                    ...newPassword,
                    password: password, // Retourner le mot de passe en clair
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating password:", error);
        logSecurityEvent("ERROR_CREATING_PASSWORD", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to create password",
            },
            { status: 500 }
        );
    }
}
