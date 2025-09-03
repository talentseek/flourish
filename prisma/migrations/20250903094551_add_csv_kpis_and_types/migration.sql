-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LocationType" ADD VALUE 'OUTLET_CENTRE';
ALTER TYPE "LocationType" ADD VALUE 'HIGH_STREET';

-- AlterTable
ALTER TABLE "locations" ADD COLUMN     "averageTenancyLengthYears" DECIMAL(6,2),
ADD COLUMN     "floorspacePersistentVacancy" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancy" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancyGrowth" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancyLeisure" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancyLeisureGrowth" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancyRetail" DECIMAL(6,4),
ADD COLUMN     "floorspaceVacancyRetailGrowth" DECIMAL(6,4),
ADD COLUMN     "healthIndex" DECIMAL(5,2),
ADD COLUMN     "largestCategory" TEXT,
ADD COLUMN     "largestCategoryPercent" DECIMAL(6,4),
ADD COLUMN     "percentIndependent" DECIMAL(6,4),
ADD COLUMN     "percentMultiple" DECIMAL(6,4),
ADD COLUMN     "persistentVacancy" DECIMAL(6,4),
ADD COLUMN     "qualityOfferMass" DECIMAL(6,4),
ADD COLUMN     "qualityOfferPremium" DECIMAL(6,4),
ADD COLUMN     "qualityOfferValue" DECIMAL(6,4),
ADD COLUMN     "vacancy" DECIMAL(6,4),
ADD COLUMN     "vacancyGrowth" DECIMAL(6,4),
ADD COLUMN     "vacantFloorspace" INTEGER,
ADD COLUMN     "vacantFloorspaceGrowth" DECIMAL(6,4),
ADD COLUMN     "vacantUnitGrowth" INTEGER,
ADD COLUMN     "vacantUnits" INTEGER;
