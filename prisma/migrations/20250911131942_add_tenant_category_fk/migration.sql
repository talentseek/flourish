-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
