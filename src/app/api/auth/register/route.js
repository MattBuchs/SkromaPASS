import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { fromZodError } from "zod-validation-error";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";
import { logAudit, AuditActions, getRequestMetadata } from "@/lib/audit-log";

export async function POST(req) {
    try {
        // Rate limiting strict pour l'inscription
        const { rateLimit } = await import("@/lib/security");
        const rateLimitResult = rateLimit(req, { endpoint: "auth" });

        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    error: "Trop de tentatives. Réessayez dans quelques minutes.",
                },
                { status: 429 }
            );
        }

        const body = await req.json();

        // Validation avec Zod
        const validatedFields = registerSchema.parse(body);

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.user.findUnique({
            where: {
                email: validatedFields.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Cet email est déjà utilisé" },
                { status: 400 }
            );
        }

        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(validatedFields.password, 12);

        // Créer l'utilisateur (emailVerified = null par défaut)
        const user = await prisma.user.create({
            data: {
                name: validatedFields.name,
                email: validatedFields.email,
                passwordHash: hashedPassword,
                emailVerified: null, // Email non vérifié lors de la création
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        // Créer un dossier par défaut pour le nouvel utilisateur
        try {
            await prisma.folder.create({
                data: {
                    name: "Mon premier dossier",
                    slug: "mon-premier-dossier",
                    description:
                        "Dossier créé automatiquement pour vous aider à démarrer",
                    color: "#3b82f6",
                    userId: user.id,
                },
            });
        } catch (folderError) {
            console.error(
                "Erreur lors de la création du dossier par défaut:",
                folderError
            );
            // Ne pas faire échouer l'inscription si le dossier ne peut pas être créé
        }

        // Générer et envoyer le token de vérification
        try {
            const token = await generateVerificationToken(
                validatedFields.email
            );
            await sendVerificationEmail(validatedFields.email, token);
        } catch (emailError) {
            console.error(
                "Erreur lors de l'envoi de l'email de vérification:",
                emailError
            );
            // On ne fait pas échouer l'inscription si l'email ne peut pas être envoyé
        }

        // Logger l'événement d'audit
        const { ip, userAgent } = getRequestMetadata(req);
        await logAudit({
            action: AuditActions.REGISTER,
            userId: user.id,
            resource: "USER",
            resourceId: user.id,
            ip,
            userAgent,
            success: true,
        });

        return NextResponse.json(
            {
                message:
                    "Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
                user,
                requiresEmailVerification: true,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);

        if (error.name === "ZodError") {
            const validationError = fromZodError(error);
            return NextResponse.json(
                { error: validationError.message },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Une erreur est survenue lors de l'inscription" },
            { status: 500 }
        );
    }
}
