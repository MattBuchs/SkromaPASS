import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

// GET /api/stats - Récupérer les statistiques du dashboard
export async function GET() {
    try {
        // Vérifier l'authentification
        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        // Récupérer les statistiques
        const [
            totalPasswords,
            strongPasswords,
            mediumPasswords,
            weakPasswords,
            compromisedPasswords,
            recentPasswords,
        ] = await Promise.all([
            // Total des mots de passe
            prisma.password.count({
                where: { userId },
            }),

            // Mots de passe forts (strength >= 70)
            prisma.password.count({
                where: {
                    userId,
                    strength: { gte: 70 },
                },
            }),

            // Mots de passe moyens (40 <= strength < 70)
            prisma.password.count({
                where: {
                    userId,
                    strength: { gte: 40, lt: 70 },
                },
            }),

            // Mots de passe faibles (strength < 40)
            prisma.password.count({
                where: {
                    userId,
                    strength: { lt: 40 },
                },
            }),

            // Mots de passe compromis
            prisma.password.count({
                where: {
                    userId,
                    compromised: true,
                },
            }),

            // Mots de passe ajoutés dans les 30 derniers jours
            prisma.password.count({
                where: {
                    userId,
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        // Calculer le score de sécurité (0-100)
        const securityScore =
            totalPasswords > 0
                ? Math.round(
                      (strongPasswords / totalPasswords) * 70 +
                          ((totalPasswords - compromisedPasswords) /
                              totalPasswords) *
                              30
                  )
                : 0;

        // Récupérer la distribution par catégorie
        const categoriesDistribution = await prisma.category.findMany({
            where: {
                OR: [{ userId }, { isDefault: true }],
            },
            include: {
                _count: {
                    select: {
                        passwords: {
                            where: { userId },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                totalPasswords,
                strongPasswords,
                mediumPasswords,
                weakPasswords,
                compromisedPasswords,
                recentPasswords,
                securityScore,
                categoriesDistribution: categoriesDistribution.map((cat) => ({
                    id: cat.id,
                    name: cat.name,
                    count: cat._count.passwords,
                    color: cat.color,
                })),
            },
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to fetch statistics",
            },
            { status: 500 }
        );
    }
}
