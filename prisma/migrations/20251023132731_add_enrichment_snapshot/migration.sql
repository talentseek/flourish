-- CreateTable
CREATE TABLE "enrichment_snapshots" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalLocations" INTEGER NOT NULL,
    "coreComplete" INTEGER NOT NULL,
    "geoComplete" INTEGER NOT NULL,
    "operationalComplete" INTEGER NOT NULL,
    "commercialComplete" INTEGER NOT NULL,
    "digitalComplete" INTEGER NOT NULL,
    "demographicComplete" INTEGER NOT NULL,
    "fieldStats" JSONB NOT NULL,

    CONSTRAINT "enrichment_snapshots_pkey" PRIMARY KEY ("id")
);
