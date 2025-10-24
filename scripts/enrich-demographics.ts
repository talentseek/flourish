// @ts-nocheck
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DemographicData {
  population: number;
  medianAge: number;
  familiesPercent: number; // % aged 0-17
  seniorsPercent: number; // % aged 65+
  homeownership: number; // % owner occupied
  homeownershipVsNational: number;
}

const RATE_LIMIT_MS = 1000; // 1 second between requests to be polite

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Get LTLA code from postcode
async function getLTLAFromPostcode(postcode: string): Promise<string | null> {
  try {
    const cleanPostcode = postcode.trim().replace(/\s+/g, ' ');
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.result && data.result.codes) {
      // Return the admin district code (LTLA equivalent)
      return data.result.codes.admin_district || null;
    }
    return null;
  } catch (error) {
    console.error(`Error looking up postcode ${postcode}:`, error.message);
    return null;
  }
}

// Fetch Census 2021 demographics from NOMIS
async function getCensusDemographics(ltlaCode: string): Promise<DemographicData | null> {
  try {
    // Census 2021 Age table (TS007A)
    // Get population by age groups
    const ageUrl = `https://www.nomisweb.co.uk/api/v01/dataset/NM_2071_1.data.json?geography=${ltlaCode}&c2021_age_88=0...88&measures=20100`;
    
    const ageResponse = await fetch(ageUrl);
    if (!ageResponse.ok) {
      console.error(`Failed to fetch age data for ${ltlaCode}`);
      return null;
    }
    
    const ageData = await ageResponse.json();
    
    if (!ageData.obs || ageData.obs.length === 0) {
      return null;
    }
    
    // Calculate demographics from age data
    const ageGroups = ageData.obs.map((obs: any) => ({
      age: parseInt(obs.c2021_age_88_name),
      count: obs.obs_value?.value || 0
    }));
    
    const totalPop = ageGroups.reduce((sum, ag) => sum + ag.count, 0);
    const childrenCount = ageGroups.filter(ag => ag.age <= 17).reduce((sum, ag) => sum + ag.count, 0);
    const seniorsCount = ageGroups.filter(ag => ag.age >= 65).reduce((sum, ag) => sum + ag.count, 0);
    
    // Calculate median age
    let cumulative = 0;
    let medianAge = 0;
    for (const ag of ageGroups.sort((a, b) => a.age - b.age)) {
      cumulative += ag.count;
      if (cumulative >= totalPop / 2) {
        medianAge = ag.age;
        break;
      }
    }
    
    await sleep(500); // Rate limiting
    
    // Census 2021 Housing Tenure table (TS054)
    const housingUrl = `https://www.nomisweb.co.uk/api/v01/dataset/NM_2072_1.data.json?geography=${ltlaCode}&c2021_tenure_9=1,2&measures=20100`;
    
    const housingResponse = await fetch(housingUrl);
    let homeownershipPercent = 0;
    
    if (housingResponse.ok) {
      const housingData = await housingResponse.json();
      
      if (housingData.obs && housingData.obs.length > 0) {
        const totalHouseholds = housingData.obs.reduce((sum: number, obs: any) => sum + (obs.obs_value?.value || 0), 0);
        // Tenure code 1 = Owned
        const ownedHouseholds = housingData.obs
          .filter((obs: any) => obs.c2021_tenure_9 === 1)
          .reduce((sum: number, obs: any) => sum + (obs.obs_value?.value || 0), 0);
        
        homeownershipPercent = totalHouseholds > 0 ? (ownedHouseholds / totalHouseholds) * 100 : 0;
      }
    }
    
    // England & Wales national average homeownership: ~63% (Census 2021)
    const nationalHomeownership = 63.0;
    
    return {
      population: Math.round(totalPop),
      medianAge: Math.round(medianAge),
      familiesPercent: totalPop > 0 ? parseFloat(((childrenCount / totalPop) * 100).toFixed(1)) : 0,
      seniorsPercent: totalPop > 0 ? parseFloat(((seniorsCount / totalPop) * 100).toFixed(1)) : 0,
      homeownership: parseFloat(homeownershipPercent.toFixed(1)),
      homeownershipVsNational: parseFloat((homeownershipPercent - nationalHomeownership).toFixed(1))
    };
    
  } catch (error) {
    console.error(`Error fetching demographics for ${ltlaCode}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🏘️  Demographics Enrichment via ONS Census 2021\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Get locations missing demographic data
  const locations = await prisma.location.findMany({
    where: {
      OR: [
        { population: null },
        { medianAge: null },
        { homeownership: null }
      ]
    },
    select: {
      id: true,
      name: true,
      city: true,
      postcode: true,
      population: true
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Found ${locations.length} locations needing demographic data\n`);
  
  if (locations.length === 0) {
    console.log('✅ All locations already have demographic data!');
    return;
  }
  
  // Group by postcode to avoid duplicate LTLA lookups
  const postcodeGroups = new Map<string, typeof locations>();
  locations.forEach(loc => {
    if (!loc.postcode || loc.postcode === '-') return;
    if (!postcodeGroups.has(loc.postcode)) {
      postcodeGroups.set(loc.postcode, []);
    }
    postcodeGroups.get(loc.postcode)!.push(loc);
  });
  
  console.log(`Processing ${postcodeGroups.size} unique postcodes...\n`);
  
  let updated = 0;
  let failed = 0;
  let ltlaCache = new Map<string, DemographicData | null>();
  
  let processedPostcodes = 0;
  for (const [postcode, locs] of postcodeGroups) {
    processedPostcodes++;
    console.log(`[${processedPostcodes}/${postcodeGroups.size}] ${postcode} (${locs.length} locations)`);
    
    // Get LTLA code
    const ltlaCode = await getLTLAFromPostcode(postcode);
    
    if (!ltlaCode) {
      console.log(`  ✗ Could not find LTLA for postcode`);
      failed += locs.length;
      continue;
    }
    
    // Check cache
    if (!ltlaCache.has(ltlaCode)) {
      console.log(`  📊 Fetching Census data for ${ltlaCode}...`);
      const demographics = await getCensusDemographics(ltlaCode);
      ltlaCache.set(ltlaCode, demographics);
      await sleep(RATE_LIMIT_MS); // Rate limiting
    }
    
    const demographics = ltlaCache.get(ltlaCode);
    
    if (!demographics) {
      console.log(`  ✗ No Census data available`);
      failed += locs.length;
      continue;
    }
    
    // Update all locations with this postcode
    for (const loc of locs) {
      await prisma.location.update({
        where: { id: loc.id },
        data: {
          population: demographics.population,
          medianAge: demographics.medianAge,
          familiesPercent: demographics.familiesPercent,
          seniorsPercent: demographics.seniorsPercent,
          homeownership: demographics.homeownership,
          homeownershipVsNational: demographics.homeownershipVsNational
        }
      });
      updated++;
    }
    
    console.log(`  ✓ Updated ${locs.length} location(s)`);
    console.log(`    Pop: ${demographics.population.toLocaleString()}, Median Age: ${demographics.medianAge}, Homeownership: ${demographics.homeownership}%`);
    console.log('');
  }
  
  console.log('═══════════════════════════════════════════');
  console.log('📊 Enrichment Summary:');
  console.log(`✓ Successfully enriched: ${updated} locations`);
  console.log(`✗ Failed: ${failed} locations`);
  console.log(`📈 Success rate: ${((updated / locations.length) * 100).toFixed(1)}%`);
  console.log('');
  console.log('✅ Demographics enrichment complete!');
  console.log('Run the enrichment dashboard refresh to see updated Demographic tier %');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

