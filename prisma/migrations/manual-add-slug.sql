-- Migration manuelle pour ajouter le champ slug aux dossiers
-- À exécuter si la migration Prisma ne fonctionne pas

-- Étape 1: Ajouter la colonne slug (nullable temporairement)
ALTER TABLE "folders" ADD COLUMN "slug" TEXT;

-- Étape 2: Générer des slugs pour les dossiers existants
-- (Remplacer les accents et caractères spéciaux par des versions simples)
UPDATE "folders" 
SET "slug" = lower(
    regexp_replace(
        regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    )
);

-- Étape 3: Ajouter des suffixes numériques pour éviter les doublons
WITH ranked_folders AS (
    SELECT 
        id,
        slug,
        ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt") as rn
    FROM "folders"
)
UPDATE "folders" f
SET "slug" = rf.slug || '-' || rf.rn
FROM ranked_folders rf
WHERE f.id = rf.id AND rf.rn > 1;

-- Étape 4: Rendre la colonne slug NOT NULL et UNIQUE
ALTER TABLE "folders" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "folders_slug_key" ON "folders"("slug");
