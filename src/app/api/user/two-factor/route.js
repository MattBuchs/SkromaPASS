import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import {
    generateTwoFactorSecret,
    generateOtpAuthUrl,
    generateQRCode,
    verifyTwoFactorToken,
} from "@/lib/two-factor";

// GET - Récupérer le statut 2FA de l'utilisateur
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                twoFactorEnabled: true,
            },
        });

        return NextResponse.json({
            twoFactorEnabled: user?.twoFactorEnabled || false,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du statut 2FA:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// POST - Générer un QR code pour activer la 2FA
export async function POST(req) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { action, token } = await req.json();

        // Action: setup - Générer le QR code
        if (action === "setup") {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    email: true,
                    twoFactorEnabled: true,
                },
            });

            if (user?.twoFactorEnabled) {
                return NextResponse.json(
                    { error: "La 2FA est déjà activée" },
                    { status: 400 }
                );
            }

            // Générer un nouveau secret
            const secret = generateTwoFactorSecret();

            // Stocker temporairement le secret (il sera confirmé lors de l'enable)
            await prisma.user.update({
                where: { id: session.user.id },
                data: { twoFactorSecret: secret },
            });

            // Générer l'URL otpauth et le QR code
            const otpAuthUrl = generateOtpAuthUrl(user.email, secret);
            const qrCode = await generateQRCode(otpAuthUrl);

            return NextResponse.json({
                secret,
                qrCode,
                message: "QR code généré. Scannez-le avec votre application d'authentification.",
            });
        }

        // Action: enable - Activer la 2FA après vérification du code
        if (action === "enable") {
            if (!token) {
                return NextResponse.json(
                    { error: "Code de vérification requis" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    twoFactorSecret: true,
                    twoFactorEnabled: true,
                },
            });

            if (!user?.twoFactorSecret) {
                return NextResponse.json(
                    { error: "Vous devez d'abord générer un QR code" },
                    { status: 400 }
                );
            }

            if (user.twoFactorEnabled) {
                return NextResponse.json(
                    { error: "La 2FA est déjà activée" },
                    { status: 400 }
                );
            }

            // Vérifier le code
            const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

            if (!isValid) {
                return NextResponse.json(
                    { error: "Code invalide. Veuillez réessayer." },
                    { status: 400 }
                );
            }

            // Activer la 2FA
            await prisma.user.update({
                where: { id: session.user.id },
                data: { twoFactorEnabled: true },
            });

            return NextResponse.json({
                success: true,
                message: "L'authentification à deux facteurs a été activée avec succès !",
            });
        }

        // Action: disable - Désactiver la 2FA
        if (action === "disable") {
            if (!token) {
                return NextResponse.json(
                    { error: "Code de vérification requis" },
                    { status: 400 }
                );
            }

            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: {
                    twoFactorSecret: true,
                    twoFactorEnabled: true,
                },
            });

            if (!user?.twoFactorEnabled) {
                return NextResponse.json(
                    { error: "La 2FA n'est pas activée" },
                    { status: 400 }
                );
            }

            // Vérifier le code
            const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

            if (!isValid) {
                return NextResponse.json(
                    { error: "Code invalide. Veuillez réessayer." },
                    { status: 400 }
                );
            }

            // Désactiver la 2FA et supprimer le secret
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    twoFactorEnabled: false,
                    twoFactorSecret: null,
                },
            });

            return NextResponse.json({
                success: true,
                message: "L'authentification à deux facteurs a été désactivée.",
            });
        }

        return NextResponse.json(
            { error: "Action invalide" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Erreur lors de la gestion de la 2FA:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
