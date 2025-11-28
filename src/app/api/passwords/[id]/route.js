import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/encryption";
import { rateLimit, logSecurityEvent } from "@/lib/security";
import { passwordSchema } from "@/lib/validations";
import { fromZodError } from "zod-validation-error";

// GET /api/passwords/[id] - Récupérer un mot de passe spécifique
export async function GET(request, { params }) {
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

        const { id } = await params;
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const password = await prisma.password.findFirst({
            where: {
                id,
                userId,
            },
            include: {
                category: true,
                folder: true,
            },
        });

        if (!password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password not found",
                },
                { status: 404 }
            );
        }

        // Déchiffrer le mot de passe
        let decryptedPassword;
        try {
            decryptedPassword = decrypt(password.password);
        } catch (error) {
            console.error(
                `Erreur déchiffrement password ${password.id}:`,
                error
            );
            decryptedPassword = "***ERROR***";
        }

        logSecurityEvent("PASSWORD_VIEWED", {
            userId,
            passwordId: password.id,
        });

        return NextResponse.json({
            success: true,
            data: {
                ...password,
                password: decryptedPassword,
            },
        });
    } catch (error) {
        console.error("Error fetching password:", error);
        logSecurityEvent("ERROR_FETCHING_PASSWORD", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch password",
            },
            { status: 500 }
        );
    }
}

// PATCH /api/passwords/[id] - Mettre à jour un mot de passe
export async function PATCH(request, { params }) {
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

        const { id } = await params;
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const body = await request.json();

        // Validation avec Zod
        const validation = passwordSchema.safeParse(body);
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

        // Vérifier que le mot de passe appartient à l'utilisateur
        const existingPassword = await prisma.password.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password not found",
                },
                { status: 404 }
            );
        }

        // Chiffrer le mot de passe s'il est modifié
        const updateData = { ...validation.data };
        if (body.password) {
            updateData.password = encrypt(body.password);
        }

        const updatedPassword = await prisma.password.update({
            where: {
                id,
            },
            data: {
                ...updateData,
                updatedAt: new Date(),
            },
            include: {
                category: true,
                folder: true,
            },
        });

        logSecurityEvent("PASSWORD_UPDATED", {
            userId,
            passwordId: id,
        });

        // Déchiffrer le mot de passe pour le retour
        let decryptedPassword = updatedPassword.password;
        if (body.password) {
            decryptedPassword = body.password;
        } else {
            try {
                decryptedPassword = decrypt(updatedPassword.password);
            } catch (error) {
                console.error(`Erreur déchiffrement password ${id}:`, error);
                decryptedPassword = "***ERROR***";
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...updatedPassword,
                password: decryptedPassword,
            },
        });
    } catch (error) {
        console.error("Error updating password:", error);
        logSecurityEvent("ERROR_UPDATING_PASSWORD", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to update password",
            },
            { status: 500 }
        );
    }
}

// DELETE /api/passwords/[id] - Supprimer un mot de passe
export async function DELETE(request, { params }) {
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

        const { id } = await params;
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        // Vérifier que le mot de passe appartient à l'utilisateur
        const existingPassword = await prisma.password.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingPassword) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Password not found",
                },
                { status: 404 }
            );
        }

        await prisma.password.delete({
            where: {
                id,
            },
        });

        logSecurityEvent("PASSWORD_DELETED", {
            userId,
            passwordId: id,
        });

        return NextResponse.json({
            success: true,
            message: "Password deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting password:", error);
        logSecurityEvent("ERROR_DELETING_PASSWORD", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete password",
            },
            { status: 500 }
        );
    }
}
