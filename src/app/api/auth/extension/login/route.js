import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// POST /api/auth/extension/login - Connexion pour l'extension
export async function POST(request) {
    try {
        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de tentatives, veuillez réessayer plus tard",
                },
                { status: 429 }
            );
        }

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { success: false, error: "Email et mot de passe requis" },
                { status: 400 }
            );
        }

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.passwordHash) {
            return NextResponse.json(
                { success: false, error: "Email ou mot de passe incorrect" },
                { status: 401 }
            );
        }

        // Vérifier que l'email est vérifié
        if (!user.emailVerified) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Veuillez vérifier votre email avant de vous connecter",
                },
                { status: 403 }
            );
        }

        // Vérification du mot de passe
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, error: "Email ou mot de passe incorrect" },
                { status: 401 }
            );
        }

        // Générer un JWT pour l'extension
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                type: "extension",
            },
            JWT_SECRET,
            { expiresIn: "15d" } // Token valide 15 jours pour l'extension
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        console.error("Erreur de connexion extension:", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
