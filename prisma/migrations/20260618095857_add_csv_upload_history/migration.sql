-- CreateTable
CREATE TABLE "CSVUpload" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CSVUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CSVUpload_organizationId_createdAt_idx" ON "CSVUpload"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "CSVUpload" ADD CONSTRAINT "CSVUpload_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
