/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `folders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `folders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "folders_slug_key" ON "folders"("slug");
