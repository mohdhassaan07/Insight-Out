/*
  Warnings:

  - Added the required column `sentiment` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sentiments" AS ENUM ('Positive', 'Neutral', 'Negative');

-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "sentiment" "Sentiments" NOT NULL;
