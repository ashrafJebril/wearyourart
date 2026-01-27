-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "isCustomized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "screenshots" JSONB;
