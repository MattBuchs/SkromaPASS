-- Migration: Add slug to folders
-- Pour exécuter cette migration manuellement :
-- 1. Connectez-vous à votre base de données
-- 2. Exécutez ces commandes SQL

-- Ajouter la colonne slug (temporairement nullable)
ALTER TABLE "folders" ADD COLUMN "slug" TEXT;

-- Générer des slugs pour les dossiers existants (à adapter selon vos données)
-- Cette requête crée des slugs basiques à partir du nom
UPDATE "folders" 
SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE("name", '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE "slug" IS NULL;

-- Rendre la colonne unique et non-nullable
ALTER TABLE "folders" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "folders_slug_key" ON "folders"("slug");

-- Alternative: Utilisez Prisma Migrate
-- npx prisma migrate dev --name add_slug_to_folders
