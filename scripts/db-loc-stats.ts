import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.count();
  const withLargest = await prisma.location.count({ where: { largestCategory: { not: null } } });
  const withLargestPercent = await prisma.location.count({ where: { largestCategoryPercent: { not: null } } });
  console.log({ locations, withLargest, withLargestPercent });

  const topLargest = await prisma.location.groupBy({
    by: ["largestCategory"],
    _count: { largestCategory: true },
    where: { largestCategory: { not: null } },
    orderBy: { _count: { largestCategory: "desc" } },
    take: 10,
  });
  console.log("topLargestCategories", topLargest);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });


