-- A keyword is unique within an organization, not across all organizations.
DROP INDEX "Keyword_name_key";

CREATE UNIQUE INDEX "Keyword_organizationId_name_key" ON "Keyword"("organizationId", "name");
