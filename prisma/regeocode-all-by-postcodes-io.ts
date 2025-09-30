import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type BulkPostcodeReq = { postcodes: string[] };
type PostcodesIoResult = {
  status: number;
  result: Array<{
    query: string;
    result: null | {
      postcode: string;
      latitude: number;
      longitude: number;
    };
  }>;
};

function normalizePostcode(pc: string): string | null {
  if (!pc) return null;
  const trimmed = pc.trim().toUpperCase();
  const m = trimmed.replace(/\s+/g, "").match(/^(\w{2,4})(\d\w\w)$/);
  if (m) return `${m[1]} ${m[2]}`;
  return trimmed;
}

async function bulkLookup(postcodes: string[]): Promise<Map<string, { lat: number; lon: number }>> {
  const map = new Map<string, { lat: number; lon: number }>();
  if (postcodes.length === 0) return map;
  const body: BulkPostcodeReq = { postcodes };
  const res = await fetch("https://api.postcodes.io/postcodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as PostcodesIoResult;
  if (json?.result) {
    for (const row of json.result) {
      const q = row.query;
      const r = row.result;
      if (q && r && typeof r.latitude === "number" && typeof r.longitude === "number") {
        map.set(q, { lat: r.latitude, lon: r.longitude });
      }
    }
  }
  return map;
}

async function main() {
  console.log("🗺️ Re-geocoding ALL locations with valid postcodes via postcodes.io…");

  // Pull all locations that have any postcode value
  const locations = await prisma.location.findMany({
    select: { id: true, name: true, postcode: true },
  });

  const normalized: { id: string; name: string; pc: string }[] = [];
  for (const loc of locations) {
    const pc = normalizePostcode((loc.postcode || "") as string);
    if (!pc) continue;
    normalized.push({ id: loc.id, name: loc.name, pc });
  }

  const uniquePcs = Array.from(new Set(normalized.map((n) => n.pc)));
  console.log(`Found ${normalized.length} rows with postcodes (${uniquePcs.length} unique).`);

  // Batch lookups of unique postcodes to reduce API calls
  const pcToCoords = new Map<string, { lat: number; lon: number }>();
  for (let i = 0; i < uniquePcs.length; i += 100) {
    const batch = uniquePcs.slice(i, i + 100);
    const result = await bulkLookup(batch);
    result.forEach((v, k) => pcToCoords.set(k, v));
    console.log(`Batch ${Math.floor(i / 100) + 1}/${Math.ceil(uniquePcs.length / 100)} resolved.`);
    await new Promise((r) => setTimeout(r, 250));
  }

  let updated = 0;
  for (const row of normalized) {
    const coords = pcToCoords.get(row.pc);
    if (!coords) continue;
    await prisma.location.update({
      where: { id: row.id },
      data: { latitude: coords.lat, longitude: coords.lon },
    });
    updated++;
  }

  console.log(`✅ Updated coordinates for ${updated} locations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


