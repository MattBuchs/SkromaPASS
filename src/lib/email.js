import crypto from "crypto";
import prisma from "@/lib/prisma";

/**
 * Génère un token de vérification sécurisé et le stocke dans la base de données
 * @param {string} email - L'email de l'utilisateur
 * @returns {Promise<string>} Le token généré
 */
export async function generateVerificationToken(email) {
    // Générer un token aléatoire sécurisé (32 bytes = 64 caractères hex)
    const token = crypto.randomBytes(32).toString("hex");

    // Le token expire dans 24 heures
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Supprimer les anciens tokens pour cet email
    await prisma.verificationToken.deleteMany({
        where: { identifier: email },
    });

    // Créer le nouveau token
    await prisma.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return token;
}

/**
 * Vérifie si un token de vérification est valide
 * @param {string} email - L'email de l'utilisateur
 * @param {string} token - Le token à vérifier
 * @returns {Promise<boolean>} True si le token est valide, false sinon
 */
export async function verifyEmailToken(email, token) {
    const verificationToken = await prisma.verificationToken.findUnique({
        where: {
            identifier_token: {
                identifier: email,
                token,
            },
        },
    });

    if (!verificationToken) {
        return false;
    }

    // Vérifier si le token n'a pas expiré
    if (verificationToken.expires < new Date()) {
        // Supprimer le token expiré
        await prisma.verificationToken.delete({
            where: {
                identifier_token: {
                    identifier: email,
                    token,
                },
            },
        });
        return false;
    }

    // Supprimer le token après utilisation
    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: email,
                token,
            },
        },
    });

    return true;
}

/**
 * Envoie un email de vérification (mock pour développement)
 * En production, utiliser un service comme Resend, SendGrid, AWS SES, etc.
 * @param {string} email - L'email du destinataire
 * @param {string} token - Le token de vérification
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(email, token) {
    const verificationUrl = `${
        process.env.NEXTAUTH_URL
    }/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    // En développement, logger l'URL dans la console
    if (process.env.NODE_ENV === "development") {
        console.log("\n========================================");
        console.log("📧 Email de vérification pour:", email);
        console.log("🔗 URL de vérification:", verificationUrl);
        console.log("========================================\n");
        return;
    }

    // TODO: En production, intégrer un service d'email réel
    // Exemple avec Resend:
    /*
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
        from: "MemKeyPass <noreply@memkeypass.com>",
        to: email,
        subject: "Vérifiez votre adresse email",
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Bienvenue sur MemKeyPass!</h2>
                <p>Merci de vous être inscrit. Veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                    Vérifier mon email
                </a>
                <p>Ce lien expire dans 24 heures.</p>
                <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
            </div>
        `,
    });
    */

    throw new Error(
        "Service d'email non configuré. Configurez un service d'email pour la production."
    );
}
