import { z } from "zod";
import { NextResponse } from "next/server";

// Schéma de validation Zod
const contactSchema = z.object({
    name: z.string().optional(),
    email: z
        .string()
        .email("L'adresse email n'est pas valide")
        .trim()
        .toLowerCase(),
    subject: z
        .string()
        .min(3, "Le sujet doit contenir au moins 3 caractères")
        .max(200, "Le sujet ne peut pas dépasser 200 caractères")
        .trim(),
    message: z
        .string()
        .min(10, "Le message doit contenir au moins 10 caractères")
        .max(2000, "Le message ne peut pas dépasser 2000 caractères")
        .trim(),
});

export async function POST(request) {
    try {
        const body = await request.json();

        // Validation avec Zod
        const validatedData = contactSchema.parse(body);

        // Envoyer l'email via Resend
        const { sendContactEmail } = await import("@/lib/email");

        try {
            await sendContactEmail(validatedData);
        } catch (emailError) {
            console.error("Erreur lors de l'envoi de l'email:", emailError);
            // En développement, on continue même si l'email échoue
            if (process.env.NODE_ENV !== "development") {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Erreur lors de l'envoi de l'email. Veuillez réessayer.",
                    },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: "Message envoyé avec succès",
            },
            { status: 200 }
        );
    } catch (error) {
        // Erreur de validation Zod
        if (error instanceof z.ZodError) {
            const formattedErrors = error.issues.map((err) => ({
                field: err.path[0],
                message: err.message,
            }));

            return NextResponse.json(
                {
                    success: false,
                    error: "Erreur de validation",
                    errors: formattedErrors,
                },
                { status: 400 }
            );
        }

        // Autres erreurs
        console.error("Erreur lors de l'envoi du message:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Une erreur est survenue lors de l'envoi du message",
            },
            { status: 500 }
        );
    }
}
