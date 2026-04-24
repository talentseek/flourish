-- Migration: expand-power-specification
-- Add amperage, connection type, and delivery method to spaces

ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "powerAmperage" TEXT;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "powerConnection" TEXT;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "powerDelivery" TEXT;
