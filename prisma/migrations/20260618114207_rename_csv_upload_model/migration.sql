/*
  Warnings:

  - You are about to drop the `CSVUpload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CSVUpload" DROP CONSTRAINT "CSVUpload_organizationId_fkey";

-- DropTable
DROP TABLE "CSVUpload";

-- CreateTable
CREATE TABLE "CsvUpload" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CsvUpload_organizationId_createdAt_idx" ON "CsvUpload"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "CsvUpload" ADD CONSTRAINT "CsvUpload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
