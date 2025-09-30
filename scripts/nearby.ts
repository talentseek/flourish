import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function main() {
  const radiusMiles = Number(process.argv[2] || 10);
  const targetName = process.argv[3] || "Queensgate Shopping Centre";

  const target = await prisma.location.findFirst({
    where: { name: { contains: targetName, mode: "insensitive" } },
    select: { id: true, name: true, latitude: true, longitude: true, city: true, county: true },
  });

  if (!target || target.latitude == null || target.longitude == null) {
    console.error("Target location not found or missing coordinates");
    process.exit(1);
  }

  const lat = Number(target.latitude);
  const lon = Number(target.longitude);

  const all = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      county: true,
      numberOfStores: true,
      latitude: true,
      longitude: true,
    },
  });

  const within = all
    .filter((l: any) => l.id !== target.id)
    .filter((l: any) => l.latitude != null && l.longitude != null)
    .filter((l: any) => Number(l.latitude) !== 0 && Number(l.longitude) !== 0)
    .map((l: any) => {
      const d = haversineMiles(lat, lon, Number(l.latitude), Number(l.longitude));
      return { ...l, distance: d };
    })
    .filter((l: any) => l.distance <= radiusMiles)
    .sort((a: any, b: any) => a.distance - b.distance);

  console.log(`Target: ${target.name} (${target.city}, ${target.county})`);
  console.log(`Within ${radiusMiles} miles: ${within.length}`);
  for (const l of within) {
    console.log(
      `${l.distance.toFixed(1)} mi | ${l.name} | ${l.type} | ${l.city}, ${l.county} | stores=${l.numberOfStores ?? 0}`
    );
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


