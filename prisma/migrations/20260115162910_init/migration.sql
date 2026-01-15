/*
  Warnings:

  - The `status` column on the `Feedback` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('auto_approved', 'self_approved');

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'auto_approved';
