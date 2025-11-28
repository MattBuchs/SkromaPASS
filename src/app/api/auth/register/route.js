import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { fromZodError } from "zod-validation-error";

export async function POST(req) {
    try {
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

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name: validatedFields.name,
                email: validatedFields.email,
                passwordHash: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            {
                message: "Compte créé avec succès",
                user,
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
