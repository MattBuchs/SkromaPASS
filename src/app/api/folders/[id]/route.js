import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, logSecurityEvent } from "@/lib/security";
import { requireAuth } from "@/lib/auth-helpers";

// DELETE /api/folders/[id] - Supprimer un dossier
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
        // Vérifier l'authentification
        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        // Vérifier que le dossier appartient à l'utilisateur
        const existingFolder = await prisma.folder.findFirst({
            where: {
                id,
                userId,
            },
        });

        if (!existingFolder) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Folder not found",
                },
                { status: 404 }
            );
        }

        // Supprimer le dossier (les mots de passe associés auront folderId = null)
        await prisma.folder.delete({
            where: {
                id,
            },
        });

        logSecurityEvent("FOLDER_DELETED", {
            userId,
            folderId: id,
        });

        return NextResponse.json({
            success: true,
            message: "Folder deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting folder:", error);
        logSecurityEvent("ERROR_DELETING_FOLDER", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Failed to delete folder",
            },
            { status: 500 }
        );
    }
}
