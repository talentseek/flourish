-- CreateTable: floor_maps
CREATE TABLE IF NOT EXISTS "floor_maps" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_maps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique location + name
CREATE UNIQUE INDEX IF NOT EXISTS "floor_maps_locationId_name_key" ON "floor_maps"("locationId", "name");

-- AddForeignKey: floor_maps -> locations
ALTER TABLE "floor_maps" ADD CONSTRAINT "floor_maps_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: spaces — add floorMapId, mapPinX, mapPinY, images
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "floorMapId" TEXT;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "mapPinX" DECIMAL(6,3);
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "mapPinY" DECIMAL(6,3);
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey: spaces -> floor_maps
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'spaces_floorMapId_fkey') THEN
        ALTER TABLE "spaces" ADD CONSTRAINT "spaces_floorMapId_fkey" FOREIGN KEY ("floorMapId") REFERENCES "floor_maps"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
