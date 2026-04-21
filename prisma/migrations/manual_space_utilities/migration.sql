-- Migration: add-space-utilities-and-multi-type
-- Idempotent: all changes already applied to the database manually.
-- The old "type" column has already been dropped and "types" TEXT[] is in place.

-- 1. Ensure new columns exist (idempotent)
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "types" TEXT[] DEFAULT ARRAY['GENERAL']::TEXT[];
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "powerPhase" TEXT;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "hasWater" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "hasDrainage" BOOLEAN DEFAULT false NOT NULL;

-- 2. Drop the old SpaceType enum if it still exists
DROP TYPE IF EXISTS "SpaceType";
