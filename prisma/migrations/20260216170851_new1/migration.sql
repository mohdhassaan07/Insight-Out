/*
  Warnings:

  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePic" TEXT DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/250px-Default_pfp.svg.png',
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'Admin';

-- DropEnum
DROP TYPE "Role";
