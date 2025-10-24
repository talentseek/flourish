// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";

const prisma = new PrismaClient();

interface CensusData {
  population: number;
  medianAge: number;
  familiesPercent: number;
  seniorsPercent: number;
  homeownership: number;
  carOwnership: number;
}

// Load and parse Census CSV files
function loadCensusData() {
  console.log('📊 Loading Census 2021 data...\n');
  
  const censusData = new Map<string, CensusData>();
  
  // Load TS007A - Age data
  const ageFile = path.join(process.cwd(), 'public/census2021-ts007a/census2021-ts007a-ltla.csv');
  const ageContent = readFileSync(ageFile, 'utf-8');
  const ageRecords = parse(ageContent, { columns: true, skip_empty_lines: true });
  
  console.log(`✓ Loaded ${ageRecords.length} LTLA age records`);
  
  // Load TS054 - Housing tenure
  const tenureFile = path.join(process.cwd(), 'public/census2021-ts054/census2021-ts054-ltla.csv');
  const tenureContent = readFileSync(tenureFile, 'utf-8');
  const tenureRecords = parse(tenureContent, { columns: true, skip_empty_lines: true });
  
  console.log(`✓ Loaded ${tenureRecords.length} LTLA tenure records`);
  
  // Load TS045 - Car availability
  const carFile = path.join(process.cwd(), 'public/census2021-ts045/census2021-ts045-ltla.csv');
  const carContent = readFileSync(carFile, 'utf-8');
  const carRecords = parse(carContent, { columns: true, skip_empty_lines: true });
  
  console.log(`✓ Loaded ${carRecords.length} LTLA car records\n`);
  
  // Process each LTLA
  for (const ageRec of ageRecords) {
    const ltlaCode = ageRec['geography code'];
    
    // Calculate demographics from age data
    const totalPop = parseInt(ageRec['Age: Total']) || 0;
    
    if (totalPop === 0) continue;
    
    // Age groups
    const age0to4 = parseInt(ageRec['Age: Aged 4 years and under']) || 0;
    const age5to9 = parseInt(ageRec['Age: Aged 5 to 9 years']) || 0;
    const age10to14 = parseInt(ageRec['Age: Aged 10 to 14 years']) || 0;
    const age15to19 = parseInt(ageRec['Age: Aged 15 to 19 years']) || 0;
    const age65to69 = parseInt(ageRec['Age: Aged 65 to 69 years']) || 0;
    const age70to74 = parseInt(ageRec['Age: Aged 70 to 74 years']) || 0;
    const age75to79 = parseInt(ageRec['Age: Aged 75 to 79 years']) || 0;
    const age80to84 = parseInt(ageRec['Age: Aged 80 to 84 years']) || 0;
    const age85plus = parseInt(ageRec['Age: Aged 85 years and over']) || 0;
    
    const childrenCount = age0to4 + age5to9 + age10to14 + age15to19;
    const seniorsCount = age65to69 + age70to74 + age75to79 + age80to84 + age85plus;
    
    // Calculate approximate median age from 5-year bands
    // Simplified: weight each band by midpoint
    const ages = [
      { count: age0to4, midpoint: 2 },
      { count: age5to9, midpoint: 7 },
      { count: age10to14, midpoint: 12 },
      { count: age15to19, midpoint: 17 },
      { count: parseInt(ageRec['Age: Aged 20 to 24 years']) || 0, midpoint: 22 },
      { count: parseInt(ageRec['Age: Aged 25 to 29 years']) || 0, midpoint: 27 },
      { count: parseInt(ageRec['Age: Aged 30 to 34 years']) || 0, midpoint: 32 },
      { count: parseInt(ageRec['Age: Aged 35 to 39 years']) || 0, midpoint: 37 },
      { count: parseInt(ageRec['Age: Aged 40 to 44 years']) || 0, midpoint: 42 },
      { count: parseInt(ageRec['Age: Aged 45 to 49 years']) || 0, midpoint: 47 },
      { count: parseInt(ageRec['Age: Aged 50 to 54 years']) || 0, midpoint: 52 },
      { count: parseInt(ageRec['Age: Aged 55 to 59 years']) || 0, midpoint: 57 },
      { count: parseInt(ageRec['Age: Aged 60 to 64 years']) || 0, midpoint: 62 },
      { count: age65to69, midpoint: 67 },
      { count: age70to74, midpoint: 72 },
      { count: age75to79, midpoint: 77 },
      { count: age80to84, midpoint: 82 },
      { count: age85plus, midpoint: 87 }
    ];
    
    // Find median
    let cumulative = 0;
    let medianAge = 40; // default
    const halfPop = totalPop / 2;
    
    for (const ag of ages) {
      cumulative += ag.count;
      if (cumulative >= halfPop) {
        medianAge = ag.midpoint;
        break;
      }
    }
    
    // Find tenure data for this LTLA
    const tenureRec = tenureRecords.find(r => r['geography code'] === ltlaCode);
    let homeownership = 63.0; // UK average default
    
    if (tenureRec) {
      const totalHouseholds = parseInt(tenureRec['Tenure of household: Total: All households']) || 0;
      const ownedHouseholds = parseInt(tenureRec['Tenure of household: Owned']) || 0;
      
      if (totalHouseholds > 0) {
        homeownership = (ownedHouseholds / totalHouseholds) * 100;
      }
    }
    
    // Find car data for this LTLA
    const carRec = carRecords.find(r => r['geography code'] === ltlaCode);
    let carOwnership = 75.0; // UK average default
    
    if (carRec) {
      const totalHouseholds = parseInt(carRec['Number of cars or vans: Total: All households']) || 0;
      const noCars = parseInt(carRec['Number of cars or vans: No cars or vans in household']) || 0;
      
      if (totalHouseholds > 0) {
        carOwnership = ((totalHouseholds - noCars) / totalHouseholds) * 100;
      }
    }
    
    censusData.set(ltlaCode, {
      population: totalPop,
      medianAge: Math.round(medianAge),
      familiesPercent: parseFloat(((childrenCount / totalPop) * 100).toFixed(1)),
      seniorsPercent: parseFloat(((seniorsCount / totalPop) * 100).toFixed(1)),
      homeownership: parseFloat(homeownership.toFixed(1)),
      carOwnership: parseFloat(carOwnership.toFixed(1))
    });
  }
  
  console.log(`✅ Processed ${censusData.size} LTLA areas with full demographics\n`);
  return censusData;
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
      return data.result.codes.admin_district || null;
    }
    return null;
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log('🏘️  Demographics Enrichment via Census 2021\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Load all Census data into memory
  const censusData = loadCensusData();
  
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
      postcode: true
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
  let ltlaCache = new Map<string, string>();
  
  // UK national averages for comparison
  const nationalHomeownership = 63.0;
  const nationalCarOwnership = 75.0;
  
  let processedPostcodes = 0;
  for (const [postcode, locs] of postcodeGroups) {
    processedPostcodes++;
    
    if (processedPostcodes % 100 === 0) {
      console.log(`Progress: ${processedPostcodes}/${postcodeGroups.size} postcodes...`);
    }
    
    // Get LTLA code (with caching)
    let ltlaCode = ltlaCache.get(postcode);
    
    if (!ltlaCode) {
      ltlaCode = await getLTLAFromPostcode(postcode);
      if (ltlaCode) {
        ltlaCache.set(postcode, ltlaCode);
      }
      await new Promise(r => setTimeout(r, 100)); // Rate limiting
    }
    
    if (!ltlaCode) {
      failed += locs.length;
      continue;
    }
    
    // Get Census data for this LTLA
    const demographics = censusData.get(ltlaCode);
    
    if (!demographics) {
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
          homeownershipVsNational: parseFloat((demographics.homeownership - nationalHomeownership).toFixed(1)),
          carOwnership: demographics.carOwnership,
          carOwnershipVsNational: parseFloat((demographics.carOwnership - nationalCarOwnership).toFixed(1))
        }
      });
      updated++;
    }
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 Enrichment Summary:');
  console.log(`✓ Successfully enriched: ${updated} locations`);
  console.log(`✗ Failed: ${failed} locations`);
  console.log(`📈 Success rate: ${((updated / locations.length) * 100).toFixed(1)}%`);
  console.log('');
  console.log('✅ Demographics enrichment complete!');
  console.log('Run the enrichment dashboard refresh to see updated Demographic tier %');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

