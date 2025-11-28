import { PrismaClient } from "@prisma/client";

// PrismaClient est attaché à l'objet `global` en développement pour éviter
// d'épuiser la limite de connexion à la base de données.
// En savoir plus: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global;

let prisma;

if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
} else {
    if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = new PrismaClient();
    }
    prisma = globalForPrisma.prisma;
}

export default prisma;
