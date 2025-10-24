// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import path from "path";

const prisma = new PrismaClient();

interface CSVProperty {
  'Property Name': string;
  'Health Index': string;
  'Largest Category': string;
  'Largest Category Percent': string;
  'Vacancy': string;
  'Vacancy Growth': string;
  'Persistent Vacancy (3+ yrs)': string;
  'Vacant Units': string;
  'Vacant Unit Growth': string;
  'Average Tenancy Length (years)': string;
  'Percent Multiple': string;
  'Percent Independent': string;
  'Quality of Offer - % Mass': string;
  'Quality of Offer - % Premium': string;
  'Quality of Offer - % Value': string;
  'Vacant Floorspace': string;
  'Vacant Floorspace Growth': string;
  'Floorspace Vacancy': string;
  'Floorspace Vacancy Growth': string;
  'Floorspace Vacancy Leisure': string;
  'Floorspace Vacancy Leisure Growth': string;
  'Floorspace Vacancy Retail': string;
  'Floorspace Vacancy Retail Growth': string;
  'Floorspace Persistent Vacancy (3+ yrs)': string;
  'Total Floorspace': string;
  'Number of Units': string;
}

function parseDecimal(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

function parseInteger(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function normalizeName(name: string): string {
  // Remove "(Other)" suffix and common variations
  return name
    .replace(/\s*\(Other\)\s*$/i, '')
    .replace(/\s*\(.*?\)\s*$/, '') // Remove any parenthetical
    .trim()
    .toLowerCase();
}

async function main() {
  console.log('🔄 Backfilling Commercial Data from CSV\n');
  
  // Read CSV file
  const csvPath = path.join(process.cwd(), 'public', 'UK_Retail_Properties_Comprehensive_List - All Properties.csv');
  const csvContent = readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const records: CSVProperty[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  console.log(`📊 Found ${records.length} properties in CSV\n`);
  
  // Create a map for faster lookup
  const csvMap = new Map<string, CSVProperty>();
  records.forEach(record => {
    const normalizedName = normalizeName(record['Property Name']);
    csvMap.set(normalizedName, record);
  });
  
  // Get locations missing health index (the main missing field)
  const missingLocations = await prisma.location.findMany({
    where: {
      healthIndex: null
    },
    orderBy: { name: 'asc' }
  });
  
  console.log(`Found ${missingLocations.length} locations missing healthIndex\n`);
  
  let updated = 0;
  let notFound = 0;
  const notFoundList: string[] = [];
  
  for (const location of missingLocations) {
    const normalizedName = normalizeName(location.name);
    const csvRecord = csvMap.get(normalizedName);
    
    if (csvRecord) {
      // Update with commercial data from CSV
      await prisma.location.update({
        where: { id: location.id },
        data: {
          healthIndex: parseDecimal(csvRecord['Health Index']),
          largestCategory: csvRecord['Largest Category'] || location.largestCategory,
          largestCategoryPercent: parseDecimal(csvRecord['Largest Category Percent']) || location.largestCategoryPercent,
          vacancy: parseDecimal(csvRecord['Vacancy']) || location.vacancy,
          vacancyGrowth: parseDecimal(csvRecord['Vacancy Growth']),
          persistentVacancy: parseDecimal(csvRecord['Persistent Vacancy (3+ yrs)']),
          vacantUnits: parseInteger(csvRecord['Vacant Units']),
          vacantUnitGrowth: parseInteger(csvRecord['Vacant Unit Growth']),
          averageTenancyLengthYears: parseDecimal(csvRecord['Average Tenancy Length (years)']),
          percentMultiple: parseDecimal(csvRecord['Percent Multiple']),
          percentIndependent: parseDecimal(csvRecord['Percent Independent']),
          qualityOfferMass: parseDecimal(csvRecord['Quality of Offer - % Mass']),
          qualityOfferPremium: parseDecimal(csvRecord['Quality of Offer - % Premium']),
          qualityOfferValue: parseDecimal(csvRecord['Quality of Offer - % Value']),
          vacantFloorspace: parseInteger(csvRecord['Vacant Floorspace']),
          vacantFloorspaceGrowth: parseDecimal(csvRecord['Vacant Floorspace Growth']),
          floorspaceVacancy: parseDecimal(csvRecord['Floorspace Vacancy']),
          floorspaceVacancyGrowth: parseDecimal(csvRecord['Floorspace Vacancy Growth']),
          floorspaceVacancyLeisure: parseDecimal(csvRecord['Floorspace Vacancy Leisure']),
          floorspaceVacancyLeisureGrowth: parseDecimal(csvRecord['Floorspace Vacancy Leisure Growth']),
          floorspaceVacancyRetail: parseDecimal(csvRecord['Floorspace Vacancy Retail']),
          floorspaceVacancyRetailGrowth: parseDecimal(csvRecord['Floorspace Vacancy Retail Growth']),
          floorspacePersistentVacancy: parseDecimal(csvRecord['Floorspace Persistent Vacancy (3+ yrs)']),
          numberOfStores: parseInteger(csvRecord['Number of Units']) || location.numberOfStores,
          totalFloorArea: parseInteger(csvRecord['Total Floorspace']) || location.totalFloorArea,
        }
      });
      
      console.log(`✓ Updated: ${location.name} (Health Index: ${csvRecord['Health Index']})`);
      updated++;
    } else {
      console.log(`✗ Not found in CSV: ${location.name}`);
      notFound++;
      notFoundList.push(location.name);
    }
  }
  
  console.log('\n═══════════════════════════════════════════');
  console.log('📊 Backfill Summary:');
  console.log(`✓ Updated: ${updated}`);
  console.log(`✗ Not found in CSV: ${notFound}`);
  console.log(`📈 Success rate: ${((updated / missingLocations.length) * 100).toFixed(1)}%`);
  
  if (notFoundList.length > 0 && notFoundList.length <= 20) {
    console.log('\n⚠️  Locations not found in CSV:');
    notFoundList.forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  } else if (notFoundList.length > 20) {
    console.log(`\n⚠️  ${notFoundList.length} locations not found in CSV (showing first 20):`);
    notFoundList.slice(0, 20).forEach((name, i) => console.log(`  ${i + 1}. ${name}`));
  }
  
  console.log('\n✅ Backfill complete!');
  console.log('Run the enrichment dashboard refresh to see updated Commercial tier %');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });

