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
        },
        {
            name: "Professionnel",
            slug: "professionnel",
            color: "#8b5cf6",
        },
        {
            name: "Social",
            slug: "social",
            color: "#ec4899",
        },
        {
            name: "Shopping",
            slug: "shopping",
            color: "#f59e0b",
        },
        {
            name: "Divertissement",
            slug: "divertissement",
            color: "#ef4444",
        },
        {
            name: "Développement",
            slug: "developpement",
            color: "#10b981",
        },
        {
            name: "Finance",
            slug: "finance",
            color: "#14b8a6",
        },
        {
            name: "Autre",
            slug: "autre",
            color: "#6b7280",
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
