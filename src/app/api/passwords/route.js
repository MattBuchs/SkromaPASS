import { requireAuth } from "@/lib/auth-helpers";
import { decrypt, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { passwordSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";

// GET /api/passwords - Récupérer tous les mots de passe de l'utilisateur
export async function GET(request) {
	try {
		// Vérifier l'authentification
		const { userId, error } = await requireAuth();
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		// Rate limiting pour API
		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: "Trop de requêtes, veuillez réessayer plus tard",
				},
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const folderId = searchParams.get("folder");
		const search = searchParams.get("search");
		const isFavorite = searchParams.get("favorite");

		// Construire les filtres
		const where = {
			userId,
			...(folderId && { folderId }),
			...(isFavorite && { isFavorite: isFavorite === "true" }),
			...(search && {
				OR: [
					{ name: { contains: search, mode: "insensitive" } },
					{ username: { contains: search, mode: "insensitive" } },
					{ email: { contains: search, mode: "insensitive" } },
					{ website: { contains: search, mode: "insensitive" } },
				],
			}),
		};

		const passwords = await prisma.password.findMany({
			where,
			include: {
				folder: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Déchiffrer les mots de passe
		const decryptedPasswords = passwords.map((pwd) => {
			try {
				return {
					...pwd,
					password: decrypt(pwd.password),
				};
			} catch (error) {
				console.error(
					`Erreur déchiffrement password ${pwd.id}:`,
					error,
				);
				// En cas d'erreur, masquer le mot de passe
				return {
					...pwd,
					password: "***ERROR***",
				};
			}
		});

		// Log de sécurité
		logSecurityEvent("PASSWORDS_FETCHED", {
			userId,
			count: passwords.length,
		});

		return NextResponse.json({
			success: true,
			data: decryptedPasswords,
		});
	} catch (error) {
		console.error("Error fetching passwords:", error);
		logSecurityEvent("ERROR_FETCHING_PASSWORDS", { error: error.message });
		return NextResponse.json(
			{
				success: false,
				error: "Failed to fetch passwords",
			},
			{ status: 500 },
		);
	}
}

// POST /api/passwords - Créer un nouveau mot de passe
export async function POST(request) {
	try {
		// Vérifier l'authentification
		const { userId, error } = await requireAuth();
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		// Rate limiting pour API
		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: "Trop de requêtes, veuillez réessayer plus tard",
				},
				{ status: 429 },
			);
		}

		const body = await request.json();

		// Validation avec Zod
		const validation = passwordSchema.safeParse(body);
		if (!validation.success) {
			const validationError = fromZodError(validation.error);
			return NextResponse.json(
				{
					success: false,
					error: validationError.message,
				},
				{ status: 400 },
			);
		}

		const {
			name,
			username,
			email,
			password,
			website,
			notes,
			folderId,
			strength,
		} = validation.data;

		// Chiffrer le mot de passe avec AES-256-GCM
		const encryptedPassword = encrypt(password);

		const newPassword = await prisma.password.create({
			data: {
				name,
				username: username || null,
				email: email || null,
				password: encryptedPassword,
				website: website || null,
				notes: notes || null,
				strength: strength || 0,
				userId,
				folderId: folderId || null,
			},
			include: {
				folder: true,
			},
		});

		logSecurityEvent("PASSWORD_CREATED", {
			userId,
			passwordId: newPassword.id,
		});

		// Retourner le mot de passe déchiffré pour l'affichage
		return NextResponse.json(
			{
				success: true,
				data: {
					...newPassword,
					password: password, // Retourner le mot de passe en clair
				},
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Error creating password:", error);
		console.error("Error details:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});

		logSecurityEvent("ERROR_CREATING_PASSWORD", {
			error: error.message,
			userId,
		});

		return NextResponse.json(
			{
				success: false,
				error: error.message || "Failed to create password",
			},
			{ status: 500 },
		);
	}
}
