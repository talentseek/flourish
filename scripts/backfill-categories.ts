import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const toTitle = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  const batchSize = 500;
  let linked = 0;
  let scanned = 0;

  for (;;) {
    const tenants = await prisma.tenant.findMany({
      where: { categoryId: null },
      select: { id: true, category: true },
      take: batchSize,
    });
    if (tenants.length === 0) break;

    for (const t of tenants) {
      scanned += 1;
      const raw = (t.category ?? "").trim();
      if (!raw) continue;

      // Normalize basic whitespace & casing for category names
      const normalized = toTitle(raw.replace(/\s+/g, " "));

      const cat = await prisma.category.upsert({
        where: { name: normalized },
        update: {},
        create: { name: normalized },
      });

      await prisma.tenant.update({
        where: { id: t.id },
        data: { categoryId: cat.id },
      });
      linked += 1;
    }
    console.log(`Processed batch: scanned=${scanned}, linked=${linked}`);
  }

  const total = await prisma.tenant.count();
  const withFk = await prisma.tenant.count({ where: { categoryId: { not: null } } });
  console.log(`Done. Tenants linked: ${withFk}/${total}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


