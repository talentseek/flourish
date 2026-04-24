-- Migration: add-space-external-and-notes
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "isExternal" BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE "spaces" ADD COLUMN IF NOT EXISTS "notes" TEXT;
