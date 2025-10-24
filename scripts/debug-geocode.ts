// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizePostcode(pc: string): string | null {
  if (!pc) return null;
  const trimmed = pc.trim().toUpperCase();
  // Basic UK postcode normalization: ensure single space before inward code
  const m = trimmed.replace(/\s+/g, "").match(/^(\w{2,4})(\d\w\w)$/);
  if (m) return `${m[1]} ${m[2]}`;
  // Fallback: return trimmed
  return trimmed;
}

async function testPostcode(postcode: string) {
  const normalized = normalizePostcode(postcode);
  console.log(`Original: "${postcode}" → Normalized: "${normalized}"`);
  
  if (!normalized) {
    console.log('  ✗ Failed to normalize\n');
    return;
  }
  
  try {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(normalized)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 200 && data.result) {
      console.log(`  ✓ Found: ${data.result.latitude}, ${data.result.longitude}`);
    } else {
      console.log(`  ✗ Not found: ${data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.log(`  ✗ Error: ${error.message}`);
  }
  console.log('');
}

async function main() {
  // Get sample postcodes that are failing
  const sample = await prisma.$queryRaw<Array<{ name: string; postcode: string }>>`
    SELECT name, postcode FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    AND postcode IS NOT NULL AND postcode != '' AND postcode != '-'
    LIMIT 10
  `;
  
  console.log('Testing postcode geocoding:\n');
  
  for (const loc of sample) {
    console.log(`Location: ${loc.name}`);
    await testPostcode(loc.postcode);
    await new Promise(r => setTimeout(r, 100)); // Rate limiting
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

