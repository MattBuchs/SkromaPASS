import prisma from "@/lib/prisma";
import crypto from "crypto";

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
 * Envoie un email de vérification via Resend
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
		console.log("📧 Email de vérification (DEV MODE)");
		console.log("🔗 URL:", verificationUrl);
		console.log("========================================\n");
	}

	// Vérifier que les variables d'environnement sont configurées
	if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
		if (process.env.NODE_ENV === "development") {
			console.log("ℹ️ Mode développement: l'email ne sera pas envoyé");
			return;
		}
		throw new Error(
			"Service d'email non configuré. Vérifiez vos variables d'environnement.",
		);
	}

	try {
		const { Resend } = await import("resend");
		const resend = new Resend(process.env.RESEND_API_KEY);

		await resend.emails.send({
			from: `MemKeyPass <${process.env.RESEND_FROM_EMAIL}>`,
			to: email,
			subject: "Vérifiez votre adresse email - MemKeyPass",
			html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Vérification de votre email</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 MemKeyPass</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Bienvenue sur MemKeyPass !</h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Merci de vous être inscrit. Pour activer votre compte et commencer à sécuriser vos mots de passe, veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous :</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Vérifier mon email</a>
                            </div>
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">⏰ Ce lien expire dans <strong>24 heures</strong>.</p>
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 10px 0 0 0;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                            <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 10px 0 0 0;">${verificationUrl}</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">Si vous n'avez pas créé de compte MemKeyPass, vous pouvez ignorer cet email en toute sécurité.</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">© ${new Date().getFullYear()} MemKeyPass. Tous droits réservés.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
		});

		if (process.env.NODE_ENV === "development") {
			console.log("✅ Email de vérification envoyé avec succès");
		}
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error("❌ Erreur lors de l'envoi de l'email:", error);
		}
		throw error;
	}
}

/**
 * Envoie un email de contact via Resend
 * @param {Object} contactData - Les données du formulaire de contact
 * @param {string} contactData.name - Le nom de l'expéditeur
 * @param {string} contactData.email - L'email de l'expéditeur
 * @param {string} contactData.subject - Le sujet du message
 * @param {string} contactData.message - Le message
 * @returns {Promise<void>}
 */
export async function sendContactEmail(contactData) {
	const { name, email, subject, message } = contactData;

	// Vérifier que les variables d'environnement sont configurées
	if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"⚠️ RESEND_API_KEY ou RESEND_FROM_EMAIL non configuré dans .env",
			);
		}
		throw new Error(
			"Service d'email non configuré. Vérifiez vos variables d'environnement.",
		);
	}

	try {
		const { Resend } = await import("resend");
		const resend = new Resend(process.env.RESEND_API_KEY);

		// Envoyer l'email au support
		await resend.emails.send({
			from: `MemKeyPass <${process.env.RESEND_FROM_EMAIL}>`,
			to: process.env.RESEND_FROM_EMAIL, // Envoie au support
			replyTo: email, // Pour pouvoir répondre directement
			subject: `[Contact MemKeyPass] ${subject}`,
			html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Nouveau message de contact</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">📨 Nouveau message de contact</h1>
                        </div>
                        <div style="padding: 30px;">
                            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Informations de l'expéditeur</h3>
                                <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Nom :</strong> ${
									name || "Non renseigné"
								}</p>
                                <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${email}" style="color: #6366f1; text-decoration: none;">${email}</a></p>
                                <p style="color: #4b5563; font-size: 14px; margin: 5px 0;"><strong>Sujet :</strong> ${subject}</p>
                            </div>
                            <div>
                                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">Message</h3>
                                <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; border-left: 4px solid #6366f1;">
                                    <p style="color: #374151; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                                </div>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 13px; margin: 0;">Pour répondre à cet utilisateur, cliquez simplement sur "Répondre" dans votre client email.</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Reçu le ${new Date().toLocaleDateString(
								"fr-FR",
								{ dateStyle: "long" },
							)} à ${new Date().toLocaleTimeString("fr-FR", {
								timeStyle: "short",
							})}</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
		});

		if (process.env.NODE_ENV === "development") {
			console.log("✅ Email de contact envoyé avec succès");
		}
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"❌ Erreur lors de l'envoi de l'email de contact:",
				error,
			);
		}
		throw error;
	}
}

// ============================================================
// Réinitialisation de mot de passe
// ============================================================

/**
 * Génère un token de réinitialisation de mot de passe (usage unique, 1h)
 * @param {string} email
 * @returns {Promise<string>} token hex (64 chars)
 */
export async function generatePasswordResetToken(email) {
	const token = crypto.randomBytes(32).toString("hex");
	const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

	// Supprimer tout token précédent pour cet email
	await prisma.passwordResetToken.deleteMany({
		where: { identifier: email },
	});

	await prisma.passwordResetToken.create({
		data: { identifier: email, token, expires },
	});

	return token;
}

/**
 * Vérifie un token de réinitialisation de mot de passe (usage unique)
 * @param {string} email
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function verifyPasswordResetToken(email, token) {
	const record = await prisma.passwordResetToken.findUnique({
		where: { identifier_token: { identifier: email, token } },
	});

	if (!record) return false;

	// Déjà utilisé
	if (record.usedAt) {
		await prisma.passwordResetToken.delete({
			where: { identifier_token: { identifier: email, token } },
		});
		return false;
	}

	// Expiré
	if (record.expires < new Date()) {
		await prisma.passwordResetToken.delete({
			where: { identifier_token: { identifier: email, token } },
		});
		return false;
	}

	// Marquer comme utilisé et supprimer (usage unique)
	await prisma.passwordResetToken.delete({
		where: { identifier_token: { identifier: email, token } },
	});

	return true;
}

/**
 * Envoie un email de réinitialisation de mot de passe via Resend
 * @param {string} email
 * @param {string} token
 */
export async function sendPasswordResetEmail(email, token) {
	const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

	if (process.env.NODE_ENV === "development") {
		console.log("\n========================================");
		console.log("🔑 Email de réinitialisation (DEV MODE)");
		console.log("🔗 URL:", resetUrl);
		console.log("========================================\n");
	}

	if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
		if (process.env.NODE_ENV === "development") {
			console.log("ℹ️ Mode développement: l'email ne sera pas envoyé");
			return;
		}
		throw new Error(
			"Service d'email non configuré. Vérifiez vos variables d'environnement.",
		);
	}

	try {
		const { Resend } = await import("resend");
		const resend = new Resend(process.env.RESEND_API_KEY);

		await resend.emails.send({
			from: `MemKeyPass <${process.env.RESEND_FROM_EMAIL}>`,
			to: email,
			subject: "Réinitialisation de votre mot de passe - MemKeyPass",
			html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Réinitialisation de mot de passe</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🔐 MemKeyPass</h1>
                        </div>
                        <div style="padding: 40px 30px;">
                            <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Réinitialisation de votre mot de passe</h2>
                            <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #6366f1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Réinitialiser mon mot de passe</a>
                            </div>
                            <div style="background-color: #fef9c3; border: 1px solid #fde047; border-radius: 6px; padding: 16px; margin: 20px 0;">
                                <p style="color: #854d0e; font-size: 14px; margin: 0 0 8px 0;">⚠️ <strong>Sécurité</strong></p>
                                <ul style="color: #854d0e; font-size: 14px; margin: 0; padding-left: 18px; line-height: 1.8;">
                                    <li>Ce lien expire dans <strong>1 heure</strong>.</li>
                                    <li>Il ne peut être utilisé <strong>qu'une seule fois</strong>.</li>
                                    <li>Si vous n'avez pas fait cette demande, ignorez cet email — votre mot de passe reste inchangé.</li>
                                </ul>
                            </div>
                            <p style="color: #6b7280; font-size: 14px; margin: 20px 0 0 0;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
                            <p style="color: #6366f1; font-size: 12px; word-break: break-all; margin: 8px 0 0 0;">${resetUrl}</p>
                        </div>
                        <div style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">Si vous n'avez pas demandé de réinitialisation de mot de passe, aucune action n'est requise et votre compte reste sécurisé.</p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">© ${new Date().getFullYear()} MemKeyPass. Tous droits réservés.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
		});

		if (process.env.NODE_ENV === "development") {
			console.log("✅ Email de réinitialisation envoyé avec succès");
		}
	} catch (error) {
		if (process.env.NODE_ENV === "development") {
			console.error(
				"❌ Erreur lors de l'envoi de l'email de réinitialisation:",
				error,
			);
		}
		throw error;
	}
}
