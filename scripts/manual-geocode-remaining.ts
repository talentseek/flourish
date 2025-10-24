// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Manual coordinates looked up from Google Maps / OpenStreetMap
const manualCoordinates: Record<string, { lat: number; lon: number; source: string }> = {
  // Liverpool ONE (formerly Liverpool Central)
  "Liverpool Central": { lat: 53.404764, lon: -2.987823, source: "Google Maps - Liverpool ONE shopping center" },
  
  // 5rise Shopping Centre, Bingley
  "5rise Shopping Centre": { lat: 53.849258, lon: -1.838858, source: "Google Maps" },
  
  // Ocean Plaza Retail Park, Southport
  "Ocean Plaza Retail Park": { lat: 53.641887, lon: -3.005447, source: "Google Maps" },
  
  // The Strand Shopping Centre, Douglas, Isle of Man
  "The Strand Shopping Centre": { lat: 54.150753, lon: -4.478935, source: "Google Maps - Douglas, Isle of Man" },
  
  // Tower House, Douglas, Isle of Man
  "Tower House": { lat: 54.149856, lon: -4.480391, source: "Google Maps - Douglas, Isle of Man" },
};

async function main() {
  // Get all remaining locations
  const remaining = await prisma.$queryRaw<Array<{ 
    id: string; 
    name: string; 
    address: string;
    postcode: string;
  }>>`
    SELECT id, name, address, postcode FROM locations 
    WHERE (latitude = 0 OR longitude = 0 OR latitude IS NULL OR longitude IS NULL)
    ORDER BY name
  `;
  
  console.log(`📍 Found ${remaining.length} locations still missing coordinates\n`);
  
  let updated = 0;
  let notFound = 0;
  
  for (const loc of remaining) {
    console.log(`Checking: ${loc.name}`);
    
    // Try exact match
    if (manualCoordinates[loc.name]) {
      const coords = manualCoordinates[loc.name];
      await prisma.location.update({
        where: { id: loc.id },
        data: { 
          latitude: coords.lat, 
          longitude: coords.lon 
        }
      });
      console.log(`  ✓ Updated: ${coords.lat}, ${coords.lon}`);
      console.log(`    Source: ${coords.source}`);
      updated++;
    } else {
      console.log(`  ⚠️  No manual coordinates available`);
      console.log(`    Address: ${loc.address}`);
      console.log(`    Postcode: ${loc.postcode}`);
      notFound++;
    }
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════');
  console.log(`✓ Updated: ${updated}`);
  console.log(`⚠️  Still missing: ${notFound}`);
  
  if (notFound === 0) {
    console.log('\n🎉 All locations now have coordinates!');
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

