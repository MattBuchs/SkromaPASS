/*
  Warnings:

  - You are about to drop the column `icon` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `isDefault` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `passwords` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsed` on the `passwords` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_userId_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "icon",
DROP COLUMN "isDefault",
DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "icon";

-- AlterTable
ALTER TABLE "passwords" DROP COLUMN "expiresAt",
DROP COLUMN "lastUsed";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "image",
ADD COLUMN     "hasSeenTutorial" BOOLEAN NOT NULL DEFAULT false;
