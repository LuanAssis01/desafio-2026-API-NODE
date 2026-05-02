CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "species" (
  "id" TEXT NOT NULL,
  "commonName" TEXT NOT NULL,
  "scientificName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "externalData" JSONB,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "species_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "species_category_idx" ON "species"("category");
CREATE INDEX "species_commonName_idx" ON "species"("commonName");
CREATE INDEX "species_scientificName_idx" ON "species"("scientificName");

ALTER TABLE "species"
ADD CONSTRAINT "species_createdById_fkey"
FOREIGN KEY ("createdById") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
