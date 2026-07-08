CREATE TYPE "Role" AS ENUM ('Admin', 'Manager', 'Member');

ALTER TABLE "User"
ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "Role"
USING (
  CASE
    WHEN "role" = 'Admin' THEN 'Admin'::"Role"
    WHEN "role" = 'Manager' THEN 'Manager'::"Role"
    WHEN "role" = 'Member' THEN 'Member'::"Role"
    ELSE 'Member'::"Role"
  END
);

ALTER TABLE "User"
ALTER COLUMN "role" SET DEFAULT 'Member';

CREATE TABLE "OrganizationInvite" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "invitedByUserId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "OrganizationInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationInvite_tokenHash_key" ON "OrganizationInvite"("tokenHash");
CREATE INDEX "OrganizationInvite_organizationId_idx" ON "OrganizationInvite"("organizationId");
CREATE INDEX "OrganizationInvite_email_idx" ON "OrganizationInvite"("email");

CREATE UNIQUE INDEX "User_single_admin_per_organization_idx"
ON "User"("organizationId")
WHERE "role" = 'Admin';

ALTER TABLE "OrganizationInvite"
ADD CONSTRAINT "OrganizationInvite_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrganizationInvite"
ADD CONSTRAINT "OrganizationInvite_invitedByUserId_fkey"
FOREIGN KEY ("invitedByUserId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
