import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/security";

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

// GET /api/auth/extension/session-token - Génère un token extension depuis la session web
export async function GET(request) {
    try {
        console.log("[API session-token] Requête reçue");

        // Rate limiting
        const rateLimitResult = rateLimit(request);
        if (!rateLimitResult.allowed) {
            console.log("[API session-token] Rate limit dépassé");
            return NextResponse.json(
                { success: false, error: "Trop de requêtes" },
                { status: 429 }
            );
        }

        const session = await auth();
        console.log(
            "[API session-token] Session:",
            session ? "Présente" : "Absente"
        );

        if (!session || !session.user?.email) {
            console.log("[API session-token] Non authentifié");
            return NextResponse.json(
                { success: false, error: "Non authentifié" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, email: true, name: true, emailVerified: true },
        });

        if (!user) {
            console.log(
                "[API session-token] Utilisateur introuvable:",
                session.user.email
            );
            return NextResponse.json(
                { success: false, error: "Utilisateur introuvable" },
                { status: 404 }
            );
        }

        if (!user.emailVerified) {
            console.log("[API session-token] Email non vérifié:", user.email);
            return NextResponse.json(
                {
                    success: false,
                    error: "Veuillez vérifier votre email avant d'utiliser l'extension",
                },
                { status: 403 }
            );
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, type: "extension" },
            JWT_SECRET,
            { expiresIn: "15d" }
        );

        console.log(
            "[API session-token] Token généré avec succès pour:",
            user.email
        );

        return NextResponse.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        console.error("[API session-token] Erreur:", error);
        return NextResponse.json(
            { success: false, error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
