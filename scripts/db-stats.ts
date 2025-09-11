// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.count();
  const locations = await prisma.location.count();
  const categories = await prisma.category.count();
  const withCategoryId = await prisma.tenant.count({ where: { categoryId: { not: null } } });
  const withoutCategoryId = tenants - withCategoryId;

  const distinct = await prisma.tenant.findMany({ select: { category: true }, distinct: ["category"] });
  const nullOrEmpty = await prisma.tenant.count({ where: { OR: [ { category: null }, { category: "" } ] } });

  console.log({ tenants, locations, categories, withCategoryId, withoutCategoryId, distinctCategories: distinct.length, nullOrEmptyCategories: nullOrEmpty });

  // Show sample of top categories by count
  const top = await prisma.tenant.groupBy({ by: ["category"], _count: { category: true }, orderBy: { _count: { category: "desc" } }, take: 10 });
  console.log("topCategories", top);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


