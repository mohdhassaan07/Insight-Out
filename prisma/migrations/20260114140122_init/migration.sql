-- CreateEnum
CREATE TYPE "Categories" AS ENUM ('Bug', 'Feature_Request', 'Performance', 'UI_UX', 'Pricing', 'Support', 'Praise', 'Other');

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "feedback_text" TEXT NOT NULL,
    "primary_category" "Categories" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "status" TEXT NOT NULL DEFAULT 'auto_approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
