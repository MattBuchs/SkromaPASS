import { apiT, getLocale } from "@/lib/api-i18n";
import { calculatePasswordStrength, decrypt, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// Middleware pour vérifier le token JWT de l'extension
async function verifyExtensionToken(request) {
	const authHeader = request.headers.get("authorization");
	const locale = getLocale(request);

	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return { error: apiT(locale, "tokenNotProvided"), status: 401 };
	}

	const token = authHeader.substring(7);

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		if (decoded.type !== "extension") {
			return { error: apiT(locale, "invalidToken"), status: 401 };
		}

		return { userId: decoded.userId };
	} catch (error) {
		console.error("Erreur vérification token:", error);
		return { error: apiT(locale, "invalidToken"), status: 401 };
	}
}

// GET /api/auth/extension/passwords - Récupérer les mots de passe pour un domaine
export async function GET(request) {
	try {
		const locale = getLocale(request);
		// Vérifier le token
		const auth = await verifyExtensionToken(request);
		if (auth.error) {
			return NextResponse.json(
				{ success: false, error: auth.error },
				{ status: auth.status },
			);
		}

		// Rate limiting
		const rateLimitResult = rateLimit(request);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "tooManyRequestsShort"),
				},
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const domain = searchParams.get("domain");

		if (!domain) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "domainRequired") },
				{ status: 400 },
			);
		}

		// Rechercher les mots de passe qui correspondent au domaine
		const passwords = await prisma.password.findMany({
			where: {
				userId: auth.userId,
				OR: [
					{ website: { contains: domain, mode: "insensitive" } },
					{ name: { contains: domain, mode: "insensitive" } },
				],
			},
			select: {
				id: true,
				name: true,
				username: true,
				email: true,
				website: true,
				password: true,
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		// Déchiffrer les mots de passe
		const decryptedPasswords = passwords
			.map((pwd) => {
				try {
					return {
						id: pwd.id,
						name: pwd.name,
						username: pwd.username || "",
						email: pwd.email || "",
						website: pwd.website || "",
						password: decrypt(pwd.password),
					};
				} catch (error) {
					console.error(
						`Erreur déchiffrement mot de passe ${pwd.id}:`,
						error,
					);
					return null;
				}
			})
			.filter((pwd) => pwd !== null);

		return NextResponse.json({
			success: true,
			passwords: decryptedPasswords,
		});
	} catch (error) {
		console.error("Erreur récupération mots de passe:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}

// POST /api/auth/extension/passwords - Enregistrer un nouveau mot de passe
export async function POST(request) {
	try {
		const locale = getLocale(request);
		// Vérifier le token
		const auth = await verifyExtensionToken(request);
		if (auth.error) {
			return NextResponse.json(
				{ success: false, error: auth.error },
				{ status: auth.status },
			);
		}

		// Rate limiting
		const rateLimitResult = rateLimit(request);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "tooManyRequestsShort"),
				},
				{ status: 429 },
			);
		}

		const { name, url, domain, username, email, password } =
			await request.json();

		if (!name || !password) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(getLocale(request), "nameAndPasswordRequired"),
				},
				{ status: 400 },
			);
		}

		// Vérifier si un mot de passe existe déjà pour ce domaine avec ce username/email
		const existingPassword = await prisma.password.findFirst({
			where: {
				userId: auth.userId,
				OR: [
					{ website: { contains: domain, mode: "insensitive" } },
					{ name: { contains: domain, mode: "insensitive" } },
				],
				OR: username ? [{ username }] : email ? [{ email }] : undefined,
			},
		});

		// Calculer la force du mot de passe
		const strength = calculatePasswordStrength(password);

		if (existingPassword) {
			// Mettre à jour le mot de passe existant
			const updatedPassword = await prisma.password.update({
				where: { id: existingPassword.id },
				data: {
					password: encrypt(password),
					name,
					website: url || domain,
					username: username || null,
					email: email || null,
					strength,
					updatedAt: new Date(),
				},
			});

			return NextResponse.json({
				success: true,
				password: {
					id: updatedPassword.id,
					name: updatedPassword.name,
				},
				message: apiT(getLocale(request), "passwordUpdated"),
			});
		}

		// Créer un nouveau mot de passe
		const newPassword = await prisma.password.create({
			data: {
				userId: auth.userId,
				name,
				password: encrypt(password),
				website: url || domain,
				username: username || null,
				email: email || null,
				strength,
			},
		});

		return NextResponse.json({
			success: true,
			password: {
				id: newPassword.id,
				name: newPassword.name,
			},
			message: apiT(getLocale(request), "passwordSaved"),
		});
	} catch (error) {
		console.error("Erreur sauvegarde mot de passe:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
