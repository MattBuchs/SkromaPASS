import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { z } from "zod";
import { logAudit, AuditActions, getRequestMetadata } from "@/lib/audit-log";

// PUT - Changer le mot de passe
export async function PUT(request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Les mots de passe sont requis" },
                { status: 400 }
            );
        }

        // Valider la complexité du nouveau mot de passe
        const passwordValidation =
            registerSchema.shape.password.safeParse(newPassword);
        if (!passwordValidation.success) {
            return NextResponse.json(
                { error: passwordValidation.error.errors[0].message },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur avec son mot de passe
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { error: "Identifiants invalides" },
                { status: 401 }
            );
        }

        // Vérifier le mot de passe actuel
        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Identifiants invalides" },
                { status: 401 }
            );
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Mettre à jour le mot de passe
        await prisma.user.update({
            where: { id: session.user.id },
            data: { passwordHash: hashedPassword },
        });

        // Logger l'événement d'audit
        const { ip, userAgent } = getRequestMetadata(request);
        await logAudit({
            action: AuditActions.USER_PASSWORD_CHANGED,
            userId: session.user.id,
            resource: "USER",
            resourceId: session.user.id,
            ip,
            userAgent,
            success: true,
        });

        return NextResponse.json({
            message: "Mot de passe mis à jour avec succès",
        });
    } catch (error) {
        console.error("Erreur lors du changement de mot de passe:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
