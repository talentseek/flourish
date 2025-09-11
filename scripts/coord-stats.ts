// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.location.count();
  const withCoords = await prisma.location.count({ where: { AND: [ { latitude: { not: null } }, { longitude: { not: null } } ] } });
  const nonZero = await prisma.location.count({ where: { AND: [ { latitude: { not: 0 as any } }, { longitude: { not: 0 as any } } ] } });
  console.log({ total, withCoords, nonZero });
  const sampleZero = await prisma.location.findMany({ where: { OR: [ { latitude: 0 as any }, { longitude: 0 as any } ] }, take: 5, select: { id: true, name: true, postcode: true } });
  console.log('sampleZero', sampleZero);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


