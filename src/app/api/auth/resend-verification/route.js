import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateVerificationToken, sendVerificationEmail } from "@/lib/email";

export async function POST(req) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email requis" },
                { status: 400 }
            );
        }

        // Vérifier que l'utilisateur existe
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                emailVerified: true,
            },
        });

        if (!user) {
            // Par sécurité, on ne révèle pas si l'email existe ou non
            return NextResponse.json(
                {
                    message:
                        "Si cet email existe, un nouveau lien a été envoyé.",
                },
                { status: 200 }
            );
        }

        // Vérifier si l'email n'est pas déjà vérifié
        if (user.emailVerified) {
            return NextResponse.json(
                { error: "Cet email est déjà vérifié" },
                { status: 400 }
            );
        }

        // Générer un nouveau token et envoyer l'email
        const token = await generateVerificationToken(email);
        await sendVerificationEmail(email, token);

        return NextResponse.json({
            message:
                "Un nouveau lien de vérification a été envoyé à votre adresse email.",
        });
    } catch (error) {
        console.error(
            "Erreur lors du renvoi de l'email de vérification:",
            error
        );
        return NextResponse.json(
            { error: "Une erreur est survenue lors de l'envoi de l'email" },
            { status: 500 }
        );
    }
}
