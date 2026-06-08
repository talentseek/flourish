-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('OPERATOR_BOOKING', 'CENTRE_EVENT');

-- AlterTable
ALTER TABLE "space_bookings" ADD COLUMN "bookingType" "BookingType" NOT NULL DEFAULT 'OPERATOR_BOOKING';
