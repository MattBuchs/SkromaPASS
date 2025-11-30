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

        // TODO: Implémenter l'envoi d'email
        // Exemple avec Nodemailer, SendGrid, Resend, etc.
        /*
        await sendEmail({
            to: "support@memkeypass.com",
            from: validatedData.email,
            subject: `[Contact] ${validatedData.subject}`,
            text: `
                Nom: ${validatedData.name}
                Email: ${validatedData.email}
                Sujet: ${validatedData.subject}
                
                Message:
                ${validatedData.message}
            `,
            html: `
                <h2>Nouveau message de contact</h2>
                <p><strong>Nom:</strong> ${validatedData.name}</p>
                <p><strong>Email:</strong> ${validatedData.email}</p>
                <p><strong>Sujet:</strong> ${validatedData.subject}</p>
                <h3>Message:</h3>
                <p>${validatedData.message.replace(/\n/g, '<br>')}</p>
            `,
        });
        */

        // Pour l'instant, juste logger les données
        console.log("📧 Message de contact reçu:", validatedData);

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
