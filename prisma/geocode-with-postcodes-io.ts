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
  // Basic UK postcode normalization: ensure single space before inward code
  const m = trimmed.replace(/\s+/g, "").match(/^(\w{2,4})(\d\w\w)$/);
  if (m) return `${m[1]} ${m[2]}`;
  // Fallback: return trimmed
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
  // Fetch locations missing or zero coords but with a postcode
  // Use raw SQL to avoid Decimal filter issues
  const toEnrich = await prisma.$queryRawUnsafe<{ id: string; name: string; postcode: string | null }[]>(
    'SELECT id, name, postcode FROM "locations" WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL) AND postcode IS NOT NULL'
  );

  console.log(`Found ${toEnrich.length} locations to enrich via postcodes.io`);

  const batches: string[][] = [];
  const normalized: { id: string; pc: string }[] = [];
  for (const loc of toEnrich) {
    const pc = normalizePostcode(loc.postcode || "");
    if (!pc) continue;
    normalized.push({ id: loc.id, pc });
  }

  // Create batches of up to 100 postcodes
  for (let i = 0; i < normalized.length; i += 100) {
    batches.push(normalized.slice(i, i + 100).map((n) => n.pc));
  }

  let updated = 0;
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const map = await bulkLookup(batch);
    // Map postcode back to ids (may be duplicates)
    for (const { id, pc } of normalized.filter((n) => batch.includes(n.pc))) {
      const coords = map.get(pc);
      if (!coords) continue;
      await prisma.location.update({
        where: { id },
        data: { latitude: coords.lat, longitude: coords.lon },
      });
      updated++;
    }
    console.log(`Batch ${i + 1}/${batches.length}: updated ${updated} so far`);
    // Polite rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`Done. Updated ${updated} locations with coordinates.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });


