/*
  Warnings:

  - You are about to drop the `security_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "security_logs" DROP CONSTRAINT "security_logs_userId_fkey";

-- DropTable
DROP TABLE "security_logs";
