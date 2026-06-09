-- AlterTable: Add PAT exempt flag to space_bookings
ALTER TABLE "space_bookings" ADD COLUMN "patExempt" BOOLEAN NOT NULL DEFAULT false;
