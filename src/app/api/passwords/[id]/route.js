import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/passwords/[id] - Récupérer un mot de passe spécifique
export async function GET(request, { params }) {
    try {
        const { id } = params;
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

        // Log de sécurité
        await prisma.securityLog.create({
            data: {
                userId,
                action: "PASSWORD_VIEWED",
                entityType: "PASSWORD",
                entityId: password.id,
                status: "SUCCESS",
            },
        });

        return NextResponse.json({
            success: true,
            data: password,
        });
    } catch (error) {
        console.error("Error fetching password:", error);
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
        const { id } = params;
        // TODO: Remplacer par l'ID utilisateur authentifié
        const userId = "temp-user-id";

        const body = await request.json();

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

        // TODO: Si le mot de passe est modifié, le chiffrer
        const updatedPassword = await prisma.password.update({
            where: {
                id,
            },
            data: {
                ...body,
                updatedAt: new Date(),
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
                action: "PASSWORD_UPDATED",
                entityType: "PASSWORD",
                entityId: id,
                status: "SUCCESS",
            },
        });

        return NextResponse.json({
            success: true,
            data: updatedPassword,
        });
    } catch (error) {
        console.error("Error updating password:", error);
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
        const { id } = params;
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

        // Log de sécurité
        await prisma.securityLog.create({
            data: {
                userId,
                action: "PASSWORD_DELETED",
                entityType: "PASSWORD",
                entityId: id,
                status: "SUCCESS",
            },
        });

        return NextResponse.json({
            success: true,
            message: "Password deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting password:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete password",
            },
            { status: 500 }
        );
    }
}
