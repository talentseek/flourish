// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UK bounding box (including Isle of Man, Channel Islands)
const UK_BOUNDS = {
  minLat: 49.5,   // Scilly Isles
  maxLat: 61.0,   // Shetland Islands
  minLon: -8.5,   // Western Ireland border
  maxLon: 2.0     // East Anglia
};

// Known city coordinates for validation (approximate centers)
const KNOWN_CITIES: Record<string, { lat: number; lon: number; radius: number }> = {
  'London': { lat: 51.5074, lon: -0.1278, radius: 50 },
  'Greater London': { lat: 51.5074, lon: -0.1278, radius: 50 },
  'Manchester': { lat: 53.4808, lon: -2.2426, radius: 40 },
  'Greater Manchester': { lat: 53.4808, lon: -2.2426, radius: 40 },
  'Birmingham': { lat: 52.4862, lon: -1.8904, radius: 40 },
  'West Midlands': { lat: 52.4862, lon: -1.8904, radius: 40 },
  'Leeds': { lat: 53.8008, lon: -1.5491, radius: 35 },
  'West Yorkshire': { lat: 53.8008, lon: -1.5491, radius: 40 },
  'Liverpool': { lat: 53.4084, lon: -2.9916, radius: 30 },
  'Merseyside': { lat: 53.4084, lon: -2.9916, radius: 35 },
  'Glasgow': { lat: 55.8642, lon: -4.2518, radius: 30 },
  'Edinburgh': { lat: 55.9533, lon: -3.1883, radius: 25 },
  'Cardiff': { lat: 51.4816, lon: -3.1791, radius: 25 },
  'Peterborough': { lat: 52.5695, lon: -0.2405, radius: 20 },
  'Cambridgeshire': { lat: 52.5695, lon: -0.2405, radius: 50 },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function main() {
  console.log('🔍 Verifying Geocoded Coordinates\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Get all locations
  const locations = await prisma.location.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      city: true,
      county: true,
      postcode: true,
      latitude: true,
      longitude: true,
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Total locations: ${locations.length}\n`);
  
  // Validation checks
  const issues: Array<{ location: string; issue: string; severity: 'error' | 'warning' }> = [];
  let outsideUK = 0;
  let suspiciousDistance = 0;
  let allValid = 0;
  
  for (const loc of locations) {
    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);
    
    // Check 1: Coordinates within UK bounds
    if (lat < UK_BOUNDS.minLat || lat > UK_BOUNDS.maxLat || 
        lon < UK_BOUNDS.minLon || lon > UK_BOUNDS.maxLon) {
      issues.push({
        location: `${loc.name} (${loc.city})`,
        issue: `Outside UK bounds: ${lat.toFixed(4)}, ${lon.toFixed(4)}`,
        severity: 'error'
      });
      outsideUK++;
      continue;
    }
    
    // Check 2: Distance from stated city (if we have reference coords)
    const cityName = loc.city || loc.county || '';
    const cityRef = KNOWN_CITIES[cityName];
    
    if (cityRef) {
      const distance = haversineKm(lat, lon, cityRef.lat, cityRef.lon);
      if (distance > cityRef.radius) {
        issues.push({
          location: `${loc.name} (${cityName})`,
          issue: `${distance.toFixed(1)}km from ${cityName} center (expected within ${cityRef.radius}km)`,
          severity: 'warning'
        });
        suspiciousDistance++;
        continue;
      }
    }
    
    allValid++;
  }
  
  // Summary
  console.log('📊 Validation Results:\n');
  console.log(`✅ Valid coordinates: ${allValid} (${(allValid / locations.length * 100).toFixed(1)}%)`);
  console.log(`⚠️  Suspicious distance: ${suspiciousDistance}`);
  console.log(`❌ Outside UK bounds: ${outsideUK}`);
  console.log('');
  
  // Show issues
  if (issues.length > 0) {
    console.log('═══════════════════════════════════════════');
    console.log('🚨 Issues Found:\n');
    
    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');
    
    if (errors.length > 0) {
      console.log('❌ ERRORS (must fix):');
      errors.forEach(({ location, issue }) => {
        console.log(`  • ${location}`);
        console.log(`    ${issue}`);
      });
      console.log('');
    }
    
    if (warnings.length > 0 && warnings.length <= 20) {
      console.log('⚠️  WARNINGS (should review):');
      warnings.forEach(({ location, issue }) => {
        console.log(`  • ${location}`);
        console.log(`    ${issue}`);
      });
    } else if (warnings.length > 20) {
      console.log(`⚠️  WARNINGS: ${warnings.length} locations (showing first 10):`);
      warnings.slice(0, 10).forEach(({ location, issue }) => {
        console.log(`  • ${location}`);
        console.log(`    ${issue}`);
      });
      console.log(`  ... and ${warnings.length - 10} more`);
    }
  } else {
    console.log('🎉 All coordinates passed validation checks!');
  }
  
  // Generate sample verification CSV
  console.log('\n═══════════════════════════════════════════');
  console.log('📄 Generating sample for manual spot-check...\n');
  
  // Sample 20 random locations
  const sample = locations
    .sort(() => Math.random() - 0.5)
    .slice(0, 20);
  
  console.log('Random sample (20 locations) - verify on Google Maps:');
  console.log('Format: Name | Address | Coordinates | Google Maps Link\n');
  
  sample.forEach((loc, i) => {
    const lat = Number(loc.latitude);
    const lon = Number(loc.longitude);
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
    
    console.log(`${i + 1}. ${loc.name}`);
    console.log(`   ${loc.address || 'No address'}`);
    console.log(`   📍 ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
    console.log(`   🔗 ${googleMapsUrl}`);
    console.log('');
  });
  
  // Statistics on recently geocoded
  console.log('═══════════════════════════════════════════');
  console.log('📍 Recently Geocoded Locations:\n');
  
  const recentlyGeocoded = [
    'Lakeside Shopping Centre (Lakeside)',
    'Liverpool Central',
    'Pyramid Shopping Centre (Peterborough)',
    'Discovery Business Park (retail cluster)',
    '5rise Shopping Centre',
    'Ocean Plaza Retail Park',
    'The Strand Shopping Centre',
    'Tower House'
  ];
  
  for (const name of recentlyGeocoded) {
    const loc = locations.find(l => l.name === name);
    if (loc) {
      const lat = Number(loc.latitude);
      const lon = Number(loc.longitude);
      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      
      console.log(`${loc.name}`);
      console.log(`  Address: ${loc.address || 'N/A'}`);
      console.log(`  City: ${loc.city}`);
      console.log(`  Coordinates: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);
      console.log(`  Verify: ${googleMapsUrl}`);
      console.log('');
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

