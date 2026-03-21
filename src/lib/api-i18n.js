/**
 * Server-side i18n utility for API routes.
 *
 * Usage:
 *   import { getLocale, apiT } from "@/lib/api-i18n";
 *   const locale = getLocale(request);
 *   return NextResponse.json({ error: apiT(locale, "unauthenticated") }, { status: 401 });
 */

const msgs = {
	fr: {
		// Common
		tooManyAttempts: "Trop de tentatives. Réessayez dans quelques minutes.",
		tooManyAttempts15: "Trop de tentatives. Réessayez dans 15 minutes.",
		tooManyRequests: "Trop de requêtes, veuillez réessayer plus tard",
		antiBotFailed:
			"Vérification anti-bot échouée. Rechargez la page et réessayez.",
		invalidBody: "Corps de requête invalide.",
		invalidData: "Données invalides.",
		unauthenticated: "Non authentifié",
		serverError: "Erreur serveur",
		anErrorOccurred: "Une erreur est survenue",
		userNotFound: "Utilisateur non trouvé",
		invalidCredentials: "Identifiants invalides",

		// Auth / Register
		emailAlreadyUsed: "Cet email est déjà utilisé",
		accountCreated:
			"Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.",
		registerError: "Une erreur est survenue lors de l'inscription",

		// Forgot / Reset password
		invalidEmailMsg: "Email invalide.",
		forgotPasswordSuccess:
			"Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.",
		forgotPasswordError: "Une erreur est survenue. Réessayez plus tard.",
		invalidResetLink:
			"Ce lien est invalide ou a expiré. Demandez un nouveau lien.",
		userIntrouvable: "Utilisateur introuvable.",
		samePasswordError:
			"Le nouveau mot de passe doit être différent de l'ancien.",
		passwordResetSuccess: "Mot de passe réinitialisé avec succès.",

		// Password validation (inline Zod schema in reset-password)
		passwordMinLength:
			"Le mot de passe doit contenir au moins 8 caractères",
		passwordNeedsLowercase:
			"Le mot de passe doit contenir au moins une lettre minuscule",
		passwordNeedsUppercase:
			"Le mot de passe doit contenir au moins une lettre majuscule",
		passwordNeedsNumber:
			"Le mot de passe doit contenir au moins un chiffre",
		passwordNeedsSpecial:
			"Le mot de passe doit contenir au moins un caractère spécial",
		passwordTooLong: "Le mot de passe est trop long",

		// Verify email
		emailAndTokenRequired: "Email et token requis",
		invalidOrExpiredToken: "Token invalide ou expiré",
		emailVerifiedSuccess: "Email vérifié avec succès",

		// Resend verification
		emailRequired: "Email requis",
		emailAlreadyVerified: "Cet email est déjà vérifié",
		resendEmailSuccess:
			"Si cet email existe, un nouveau lien a été envoyé.",
		resendEmailSent:
			"Un nouveau lien de vérification a été envoyé à votre adresse email.",
		resendEmailError: "Une erreur est survenue lors de l'envoi de l'email",

		// Reauth
		pinNotConfigured:
			"Code PIN non configuré. Configurez-le dans les paramètres.",
		pinIncorrect: "Code PIN incorrect",
		reauthSuccess: "Authentification réussie",

		// PIN
		pinSetSuccess: "Code PIN configuré avec succès",
		pinVerifyError: "Erreur lors de la vérification",
		passwordsRequired: "Les mots de passe sont requis",

		// 2FA
		verificationCodeRequired: "Code de vérification requis",
		twoFactorAlreadyEnabled: "La 2FA est déjà activée",
		invalidCode: "Code invalide. Veuillez réessayer.",
		twoFactorEnabledSuccess:
			"L'authentification à deux facteurs a été activée avec succès !",
		codeRequired: "Code requis",

		// WebAuthn
		challengeExpired: "Challenge expiré ou invalide. Réessayez.",
		biometricFailed: "La vérification biométrique a échoué.",
		noDeviceRegistered: "Aucun appareil biométrique enregistré",
		deviceNotRecognized: "Appareil non reconnu.",
		biometricVerificationFailed: "Vérification biométrique échouée.",

		// Passwords / Folders
		failedFetchPasswords: "Impossible de récupérer les mots de passe",
		failedFetchFolders: "Impossible de récupérer les dossiers",
		failedCreateFolder: "Impossible de créer le dossier",
		failedUpdateFolder: "Impossible de mettre à jour le dossier",
		failedDeleteFolder: "Impossible de supprimer le dossier",
		passwordNotFound: "Mot de passe introuvable",

		// Share
		linkNotFoundOrExpired: "Lien introuvable ou expiré",
		linkExpired: "Ce lien a expiré",

		// Secure notes
		noteNotFound: "Note introuvable",

		// Export / Import
		exportPasswordRequired:
			"Mot de passe d'export requis (8 caractères minimum)",
		importPasswordMissing: "Mot de passe d'import manquant",
		wrongPasswordOrCorrupted: "Mot de passe incorrect ou fichier corrompu",
		noPasswordsInFile: "Aucun mot de passe trouvé dans le fichier",
		invalidFileFormat: "Format de fichier invalide",

		// Security
		verificationImpossible: "Vérification impossible pour le moment",
		noPasswordsToScan: "Aucun mot de passe à analyser.",

		// Extension
		tokenNotProvided: "Token non fourni",
		invalidToken: "Token invalide",
		emailNotVerified: "Email non vérifié",
		missingCredentials: "Email et mot de passe requis",

		// Contact
		antiBotFailedContact:
			"Vérification anti-bot échouée. Rechargez la page et réessayez.",
		contactEmailError: "Erreur lors de l'envoi de l'email.",
		contactSuccess: "Message envoyé avec succès.",
		contactValidationError: "Erreur de validation",
		contactGeneralError:
			"Une erreur est survenue lors de l'envoi du message",

		// PIN (extended)
		pinInvalidFormat: "Le PIN doit contenir entre 4 et 8 chiffres",
		pinDeleted: "Code PIN supprimé avec succès",
		incorrectPassword: "Mot de passe incorrect",

		// 2FA (extended)
		qrCodeGenerated:
			"QR code généré. Scannez-le avec votre application d'authentification.",
		twoFactorNotEnabled: "La 2FA n'est pas activée",
		twoFactorDisabled:
			"L'authentification à deux facteurs a été désactivée.",
		needQrFirst: "Vous devez d'abord générer un QR code",
		invalidAction: "Action invalide",

		// User account
		passwordUpdated: "Mot de passe mis à jour avec succès",
		accountDeleted: "Compte supprimé avec succès",
		deletePasswordRequired:
			"Le mot de passe est requis pour supprimer le compte",
		tutorialBoolRequired: "hasSeenTutorial doit être un booléen",

		// Extension
		invalidEmailOrPassword: "Email ou mot de passe incorrect",
		verifyEmailFirst:
			"Veuillez vérifier votre email avant de vous connecter",
		verifyEmailForExtension:
			"Veuillez vérifier votre email avant d'utiliser l'extension",
		domainRequired: "Domaine requis",
		nameAndPasswordRequired: "Nom et mot de passe requis",
		passwordSaved: "Mot de passe enregistré",

		// WebAuthn credentials
		credentialIdRequired: "Identifiant requis",
		deviceNotFound: "Appareil non trouvé",

		// Share (extended)
		tooManyRequestsShort: "Trop de requêtes",
		linkInvalid: "Lien invalide",
		linkExhausted: "Ce lien a déjà été utilisé le nombre maximum de fois",
		incompatibleLinkFormat:
			"Format de lien incompatible — recréez un nouveau lien de partage",
		linkNotFound: "Lien introuvable",

		// Security / breach scan
		breachScanDetected:
			"Scan terminé : des mots de passe exposés ont été détectés.",
		breachScanClean: "Scan terminé : aucune fuite publique détectée.",
		breachScanImpossible:
			"Impossible de lancer le scan de fuite pour le moment",
		passwordCheckMinLength:
			"Le mot à vérifier doit contenir au moins 4 caractères",
		passwordCheckTooLong: "Le mot à vérifier est trop long",
		passwordCompromised: "Ce mot de passe apparaît dans des fuites connues",
		passwordNotCompromised:
			"Aucune fuite publique détectée pour ce mot de passe",

		// Import / Export (extended)
		csvMissing: "Contenu CSV manquant",
		csvTooLarge: "Fichier trop volumineux (5 Mo max)",
		noValidPasswords: "Aucun mot de passe valide trouvé dans le fichier",
		maxImportExceeded: "Maximum 1000 mots de passe par import",
		importError: "Erreur lors de l'import",
		mkpMissing: "Contenu .mkp manquant",
		mkpInvalidJson: "Fichier .mkp invalide (JSON malformé)",
		mkpInvalidFormat: "Format .mkp invalide",
		noPasswordsInExport: "Aucun mot de passe trouvé dans l'export",
		exportError: "Erreur lors de l'export",
	},

	en: {
		// Common
		tooManyAttempts:
			"Too many attempts. Please try again in a few minutes.",
		tooManyAttempts15: "Too many attempts. Please try again in 15 minutes.",
		tooManyRequests: "Too many requests, please try again later",
		antiBotFailed:
			"Bot verification failed. Reload the page and try again.",
		invalidBody: "Invalid request body.",
		invalidData: "Invalid data.",
		unauthenticated: "Unauthenticated",
		serverError: "Server error",
		anErrorOccurred: "An error occurred",
		userNotFound: "User not found",
		invalidCredentials: "Invalid credentials",

		// Auth / Register
		emailAlreadyUsed: "This email is already in use",
		accountCreated:
			"Account created successfully. Please check your email to activate your account.",
		registerError: "An error occurred during registration",

		// Forgot / Reset password
		invalidEmailMsg: "Invalid email.",
		forgotPasswordSuccess:
			"If an account exists with this email, you will receive a reset link.",
		forgotPasswordError: "An error occurred. Please try again later.",
		invalidResetLink:
			"This link is invalid or has expired. Request a new link.",
		userIntrouvable: "User not found.",
		samePasswordError:
			"Your new password must be different from the current one.",
		passwordResetSuccess: "Password reset successfully.",

		// Password validation
		passwordMinLength: "Password must be at least 8 characters",
		passwordNeedsLowercase:
			"Password must contain at least one lowercase letter",
		passwordNeedsUppercase:
			"Password must contain at least one uppercase letter",
		passwordNeedsNumber: "Password must contain at least one number",
		passwordNeedsSpecial:
			"Password must contain at least one special character",
		passwordTooLong: "Password is too long",

		// Verify email
		emailAndTokenRequired: "Email and token required",
		invalidOrExpiredToken: "Invalid or expired token",
		emailVerifiedSuccess: "Email verified successfully",

		// Resend verification
		emailRequired: "Email required",
		emailAlreadyVerified: "This email is already verified",
		resendEmailSuccess: "If this email exists, a new link has been sent.",
		resendEmailSent:
			"A new verification link has been sent to your email address.",
		resendEmailError: "An error occurred while sending the email",

		// Reauth
		pinNotConfigured: "PIN code not configured. Set it up in settings.",
		pinIncorrect: "Incorrect PIN code",
		reauthSuccess: "Authentication successful",

		// PIN
		pinSetSuccess: "PIN code configured successfully",
		pinVerifyError: "Verification error",
		passwordsRequired: "Passwords are required",

		// 2FA
		verificationCodeRequired: "Verification code required",
		twoFactorAlreadyEnabled: "2FA is already enabled",
		invalidCode: "Invalid code. Please try again.",
		twoFactorEnabledSuccess:
			"Two-factor authentication has been enabled successfully!",
		codeRequired: "Code required",

		// WebAuthn
		challengeExpired: "Challenge expired or invalid. Please try again.",
		biometricFailed: "Biometric verification failed.",
		noDeviceRegistered: "No biometric device registered",
		deviceNotRecognized: "Device not recognized.",
		biometricVerificationFailed: "Biometric verification failed.",

		// Passwords / Folders
		failedFetchPasswords: "Failed to fetch passwords",
		failedFetchFolders: "Failed to fetch folders",
		failedCreateFolder: "Failed to create folder",
		failedUpdateFolder: "Failed to update folder",
		failedDeleteFolder: "Failed to delete folder",
		passwordNotFound: "Password not found",

		// Share
		linkNotFoundOrExpired: "Link not found or expired",
		linkExpired: "This link has expired",

		// Secure notes
		noteNotFound: "Note not found",

		// Export / Import
		exportPasswordRequired:
			"Export password required (minimum 8 characters)",
		importPasswordMissing: "Import password missing",
		wrongPasswordOrCorrupted: "Wrong password or corrupted file",
		noPasswordsInFile: "No passwords found in file",
		invalidFileFormat: "Invalid file format",

		// Security
		verificationImpossible: "Verification unavailable at the moment",
		noPasswordsToScan: "No passwords to scan.",

		// Extension
		tokenNotProvided: "Token not provided",
		invalidToken: "Invalid token",
		emailNotVerified: "Email not verified",
		missingCredentials: "Email and password required",

		// Contact
		antiBotFailedContact:
			"Bot verification failed. Reload the page and try again.",
		contactEmailError: "Error while sending the email.",
		contactSuccess: "Message sent successfully.",
		contactValidationError: "Validation error",
		contactGeneralError: "An error occurred while sending the message",

		// PIN (extended)
		pinInvalidFormat: "PIN must be between 4 and 8 digits",
		pinDeleted: "PIN code deleted successfully",
		incorrectPassword: "Incorrect password",

		// 2FA (extended)
		qrCodeGenerated:
			"QR code generated. Scan it with your authenticator app.",
		twoFactorNotEnabled: "2FA is not enabled",
		twoFactorDisabled: "Two-factor authentication has been disabled.",
		needQrFirst: "You must first generate a QR code",
		invalidAction: "Invalid action",

		// User account
		passwordUpdated: "Password updated successfully",
		accountDeleted: "Account deleted successfully",
		deletePasswordRequired: "Password is required to delete the account",
		tutorialBoolRequired: "hasSeenTutorial must be a boolean",

		// Extension
		invalidEmailOrPassword: "Incorrect email or password",
		verifyEmailFirst: "Please verify your email before logging in",
		verifyEmailForExtension:
			"Please verify your email before using the extension",
		domainRequired: "Domain required",
		nameAndPasswordRequired: "Name and password required",
		passwordSaved: "Password saved",

		// WebAuthn credentials
		credentialIdRequired: "ID required",
		deviceNotFound: "Device not found",

		// Share (extended)
		tooManyRequestsShort: "Too many requests",
		linkInvalid: "Invalid link",
		linkExhausted:
			"This link has already been used the maximum number of times",
		incompatibleLinkFormat:
			"Incompatible link format — recreate a new share link",
		linkNotFound: "Link not found",

		// Security / breach scan
		breachScanDetected: "Scan complete: exposed passwords were detected.",
		breachScanClean: "Scan complete: no public breaches detected.",
		breachScanImpossible: "Unable to run the breach scan at the moment",
		passwordCheckMinLength:
			"The password to check must be at least 4 characters",
		passwordCheckTooLong: "The password to check is too long",
		passwordCompromised: "This password appears in known breaches",
		passwordNotCompromised: "No public breach detected for this password",

		// Import / Export (extended)
		csvMissing: "CSV content missing",
		csvTooLarge: "File too large (5 MB max)",
		noValidPasswords: "No valid passwords found in the file",
		maxImportExceeded: "Maximum 1000 passwords per import",
		importError: "Import error",
		mkpMissing: ".mkp content missing",
		mkpInvalidJson: ".mkp file is invalid (malformed JSON)",
		mkpInvalidFormat: "Invalid .mkp format",
		noPasswordsInExport: "No passwords found in export",
		exportError: "Export error",
	},
};

/**
 * Get a translated API message.
 * @param {string} locale - "fr" or "en"
 * @param {string} key - message key from msgs
 * @returns {string}
 */
export function apiT(locale, key) {
	return msgs[locale]?.[key] ?? msgs.fr[key] ?? key;
}

/**
 * Detect the user's locale from the request.
 * Priority: mkp_locale cookie → Accept-Language header → "fr"
 * @param {Request} request
 * @returns {"fr"|"en"}
 */
export function getLocale(request) {
	try {
		// Next.js RequestCookies API
		const cookie = request.cookies?.get("mkp_locale")?.value;
		if (cookie === "en" || cookie === "fr") return cookie;

		// Fallback: parse raw Cookie header
		const cookieHeader = request.headers?.get("cookie") ?? "";
		const match = cookieHeader.match(/(?:^|;\s*)mkp_locale=([^;]+)/);
		if (match) {
			const val = decodeURIComponent(match[1].trim());
			if (val === "en" || val === "fr") return val;
		}

		// Accept-Language fallback
		const acceptLang = request.headers?.get("accept-language") ?? "";
		return acceptLang.toLowerCase().startsWith("fr") ? "fr" : "en";
	} catch {
		return "fr";
	}
}
