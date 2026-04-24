import { PrismaClient } from "@prisma/client";
import "dotenv/config";
import { writeFileSync } from "fs";

const prisma = new PrismaClient();

async function main() {
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { name: { contains: "Bluewater", mode: "insensitive" } },
        { name: { contains: "Meadowhall", mode: "insensitive" } },
      ],
    },
    include: {
      tenants: {
        orderBy: { category: "asc" },
      },
    },
  });

  const output: any[] = [];
  for (const loc of locations) {
    output.push({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      postcode: loc.postcode,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      parkingSpaces: loc.parkingSpaces,
      numberOfStores: loc.numberOfStores,
      footfall: loc.footfall,
      owner: loc.owner,
      management: loc.management,
      region: loc.region,
      retailSpace: loc.retailSpace,
      tenantCount: loc.tenants.length,
      tenants: loc.tenants.map((t) => ({ name: t.name, category: t.category })),
    });
  }

  writeFileSync("/tmp/flourish-locations.json", JSON.stringify(output, null, 2));
  console.log(`Wrote ${output.length} locations to /tmp/flourish-locations.json`);
  for (const l of output) {
    console.log(`  ${l.name}: ${l.tenantCount} tenants, lat=${l.latitude} lng=${l.longitude}`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
