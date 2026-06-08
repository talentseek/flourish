-- CreateEnum: EntityType
CREATE TYPE "EntityType" AS ENUM ('LIMITED_COMPANY', 'SOLE_TRADER');

-- AlterEnum: Add new LicenseCategory values
ALTER TYPE "LicenseCategory" ADD VALUE 'PHOTOGRAPHIC_ID';
ALTER TYPE "LicenseCategory" ADD VALUE 'PROOF_OF_ADDRESS';

-- AlterTable: Add entityType to operators
ALTER TABLE "operators" ADD COLUMN "entityType" "EntityType" NOT NULL DEFAULT 'LIMITED_COMPANY';
