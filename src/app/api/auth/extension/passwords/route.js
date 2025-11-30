import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { decrypt, encrypt, calculatePasswordStrength } from "@/lib/encryption";
import { rateLimit } from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// Middleware pour vérifier le token JWT de l'extension
async function verifyExtensionToken(request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { error: "Token non fourni", status: 401 };
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.type !== "extension") {
            return { error: "Token invalide", status: 401 };
        }

        return { userId: decoded.userId };
    } catch (error) {
        console.error("Erreur vérification token:", error);
        return { error: "Token invalide ou expiré", status: 401 };
    }
}

// GET /api/auth/extension/passwords - Récupérer les mots de passe pour un domaine
export async function GET(request) {
    try {
        // Vérifier le token
        const auth = await verifyExtensionToken(request);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requêtes",
                },
                { status: 429 }
            );
        }

        const { searchParams } = new URL(request.url);
        const domain = searchParams.get("domain");

        if (!domain) {
            return NextResponse.json(
                { success: false, error: "Domaine requis" },
                { status: 400 }
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
                        error
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
            { success: false, error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// POST /api/auth/extension/passwords - Enregistrer un nouveau mot de passe
export async function POST(request) {
    try {
        // Vérifier le token
        const auth = await verifyExtensionToken(request);
        if (auth.error) {
            return NextResponse.json(
                { success: false, error: auth.error },
                { status: auth.status }
            );
        }

        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requêtes",
                },
                { status: 429 }
            );
        }

        const { name, url, domain, username, email, password } =
            await request.json();

        if (!name || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Nom et mot de passe requis",
                },
                { status: 400 }
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
                message: "Mot de passe mis à jour",
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
            message: "Mot de passe enregistré",
        });
    } catch (error) {
        console.error("Erreur sauvegarde mot de passe:", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
