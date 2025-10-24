import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// ONS Census 2021 Household Income dataset
const INCOME_DATASET_URL = 'https://www.nomisweb.co.uk/api/v01/dataset/NM_2081_1.data.csv';

interface IncomeData {
  geography: string;
  geographyCode: string;
  avgHouseholdIncome: number;
}

async function fetchIncomeData(): Promise<Map<string, IncomeData>> {
  console.log('📥 Fetching household income data from ONS...\n');

  try {
    // Build query parameters for ONS Nomis API
    // This gets gross household income (before tax) by LTLA (Lower Tier Local Authority)
    const params = new URLSearchParams({
      'date': 'latest',
      'geography': '1811939329...1811939332,1811939334...1811939336,1811939338...1811939428,1811939436...1811939442,1811939768,1811939769,1811939443...1811939497,1811939499...1811939501,1811939503,1811939505...1811939507,1811939509...1811939517,1811939519,1811939520,1811939524...1811939570,1811939575...1811939599,1811939601...1811939628,1811939630...1811939634,1811939636...1811939647,1811939649,1811939655...1811939664,1811939667...1811939680,1811939682,1811939683,1811939685,1811939687...1811939704,1811939707,1811939708,1811939710,1811939712...1811939717,1811939719,1811939720,1811939722...1811939730',
      'c2021_hhinc_10': '0', // Total (all income bands)
      'measures': '20100', // Value
      'select': 'geography_name,geography_code,obs_value'
    });

    const url = `${INCOME_DATASET_URL}?${params.toString()}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DataEnrichmentBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const csvText = await response.text();
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true
    });

    const incomeMap = new Map<string, IncomeData>();

    for (const record of records) {
      const geographyCode = record.GEOGRAPHY_CODE || record.geography_code;
      const geographyName = record.GEOGRAPHY_NAME || record.geography_name;
      const obsValue = record.OBS_VALUE || record.obs_value;

      if (geographyCode && geographyName && obsValue) {
        const income = parseFloat(obsValue);
        if (!isNaN(income) && income > 0) {
          incomeMap.set(geographyCode, {
            geography: geographyName,
            geographyCode,
            avgHouseholdIncome: Math.round(income)
          });
        }
      }
    }

    console.log(`✅ Loaded income data for ${incomeMap.size} local authorities\n`);
    return incomeMap;

  } catch (error: any) {
    console.error('❌ Failed to fetch income data:', error.message);
    console.log('\n⚠️  Note: ONS API may be unavailable or query may need adjustment.');
    console.log('Falling back to approximate income data based on existing demographics...\n');
    return new Map();
  }
}

async function estimateIncomeFromDemographics(location: any): Promise<number | null> {
  // Fallback: Estimate income based on homeownership and car ownership
  // This is a rough approximation for UK data
  // Higher homeownership + car ownership typically correlates with higher income
  
  const homeownership = location.homeownership ? parseFloat(location.homeownership.toString()) : 0;
  const carOwnership = location.carOwnership ? parseFloat(location.carOwnership.toString()) : 0;

  if (homeownership === 0 && carOwnership === 0) return null;

  // UK median household income ~£32,349 (2021 Census)
  // Adjust based on homeownership and car ownership
  const baseIncome = 32349;
  
  // Homeownership adjustment: +/- 20% based on homeownership rate
  const homeAdjustment = (homeownership - 63) / 63 * 0.2; // 63% is UK average
  
  // Car ownership adjustment: +/- 15% based on car ownership rate
  const carAdjustment = (carOwnership - 76) / 76 * 0.15; // 76% is UK average

  const estimatedIncome = baseIncome * (1 + homeAdjustment + carAdjustment);
  
  return Math.round(estimatedIncome);
}

async function main() {
  console.log('💰 HOUSEHOLD INCOME ENRICHMENT\n');
  console.log('Using ONS Census 2021 data...\n');

  // Fetch income data from ONS
  const incomeMap = await fetchIncomeData();

  const locations = await prisma.location.findMany({
    where: {
      avgHouseholdIncome: null
    },
    select: {
      id: true,
      name: true,
      city: true,
      county: true,
      homeownership: true,
      carOwnership: true,
      population: true
    },
    orderBy: { name: 'asc' }
  });

  console.log(`📊 Found ${locations.length} locations missing household income\n`);

  let enrichedFromAPI = 0;
  let enrichedFromEstimate = 0;
  let failedCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    const progress = `[${i + 1}/${locations.length}]`;

    // Try to match by county (which often maps to LTLA)
    let incomeData: IncomeData | undefined;

    // Try exact match first
    for (const [code, data] of incomeMap.entries()) {
      if (data.geography.toLowerCase().includes(loc.county.toLowerCase()) ||
          loc.county.toLowerCase().includes(data.geography.toLowerCase())) {
        incomeData = data;
        break;
      }
    }

    if (incomeData) {
      await prisma.location.update({
        where: { id: loc.id },
        data: { 
          avgHouseholdIncome: incomeData.avgHouseholdIncome,
          // Calculate vs national (UK median = £32,349)
          incomeVsNational: parseFloat(((incomeData.avgHouseholdIncome / 32349) * 100).toFixed(2))
        }
      });
      console.log(`${progress} ${loc.name} - ✅ £${incomeData.avgHouseholdIncome.toLocaleString()} (${incomeData.geography})`);
      enrichedFromAPI++;
    } else {
      // Fallback to estimation
      const estimatedIncome = await estimateIncomeFromDemographics(loc);
      if (estimatedIncome) {
        await prisma.location.update({
          where: { id: loc.id },
          data: { 
            avgHouseholdIncome: estimatedIncome,
            incomeVsNational: parseFloat(((estimatedIncome / 32349) * 100).toFixed(2))
          }
        });
        console.log(`${progress} ${loc.name} - 📊 ~£${estimatedIncome.toLocaleString()} (estimated)`);
        enrichedFromEstimate++;
      } else {
        console.log(`${progress} ${loc.name} - ❌ No data or demographics available`);
        failedCount++;
      }
    }
  }

  console.log('\n✅ Household income enrichment complete!');
  console.log(`   From ONS API: ${enrichedFromAPI}/${locations.length}`);
  console.log(`   From estimation: ${enrichedFromEstimate}/${locations.length}`);
  console.log(`   Failed: ${failedCount}/${locations.length}`);

  // Show coverage
  const totalWithIncome = await prisma.location.count({
    where: { avgHouseholdIncome: { not: null } }
  });
  const totalLocations = await prisma.location.count();

  console.log(`\n📊 Overall Income Coverage: ${totalWithIncome}/${totalLocations} (${(totalWithIncome/totalLocations*100).toFixed(1)}%)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

