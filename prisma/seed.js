import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Seeding database...");

    // Créer les catégories par défaut
    const categories = [
        {
            name: "Personnel",
            slug: "personnel",
            color: "#3b82f6",
            isDefault: true,
        },
        {
            name: "Professionnel",
            slug: "professionnel",
            color: "#8b5cf6",
            isDefault: true,
        },
        {
            name: "Social",
            slug: "social",
            color: "#ec4899",
            isDefault: true,
        },
        {
            name: "Shopping",
            slug: "shopping",
            color: "#f59e0b",
            isDefault: true,
        },
        {
            name: "Divertissement",
            slug: "divertissement",
            color: "#ef4444",
            isDefault: true,
        },
        {
            name: "Développement",
            slug: "developpement",
            color: "#10b981",
            isDefault: true,
        },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
        console.log(`✅ Catégorie créée: ${category.name}`);
    }

    console.log("✨ Seeding terminé!");
}

main()
    .catch((e) => {
        console.error("❌ Erreur lors du seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
