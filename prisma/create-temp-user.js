import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createTempUser() {
    console.log("🔧 Création d'un utilisateur temporaire...");

    try {
        // Créer ou récupérer l'utilisateur temporaire
        const user = await prisma.user.upsert({
            where: { email: "temp@memkeypass.com" },
            update: {},
            create: {
                id: "temp-user-id",
                email: "temp@memkeypass.com",
                name: "Utilisateur Test",
                passwordHash: "temp-hash", // Pas utilisé pour l'instant
            },
        });

        console.log("✅ Utilisateur créé:", user.email);
        console.log("📝 ID:", user.id);
    } catch (error) {
        console.error("❌ Erreur:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTempUser();
