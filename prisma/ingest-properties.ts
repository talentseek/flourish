import { PrismaClient, LocationType } from '@prisma/client'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import path from 'path'

const prisma = new PrismaClient()

interface CSVProperty {
  'Property Name': string
  'Address': string
  'Property Type': string
  'Health Index': string
  'Largest Category': string
  'Largest Category Percent': string
  'Vacancy': string
  'Vacancy Growth': string
  'Persistent Vacancy (3+ yrs)': string
  'Vacant Units': string
  'Vacant Unit Growth': string
  'Average Tenancy Length (years)': string
  'Total Floorspace': string
  'Number of Units': string
  'Percent Multiple': string
  'Percent Independent': string
  'Quality of Offer - % Mass': string
  'Quality of Offer - % Premium': string
  'Quality of Offer - % Value': string
  'Vacant Floorspace': string
  'Vacant Floorspace Growth': string
  'Floorspace Vacancy': string
  'Floorspace Vacancy Growth': string
  'Floorspace Vacancy Leisure': string
  'Floorspace Vacancy Leisure Growth': string
  'Floorspace Vacancy Retail': string
  'Floorspace Vacancy Retail Growth': string
  'Floorspace Persistent Vacancy (3+ yrs)': string
}

function mapPropertyType(csvType: string): LocationType {
  switch (csvType.toLowerCase()) {
    case 'shopping centre':
      return LocationType.SHOPPING_CENTRE
    case 'retail park':
      return LocationType.RETAIL_PARK
    case 'outlet centre':
      return LocationType.OUTLET_CENTRE
    case 'high street':
      return LocationType.HIGH_STREET
    default:
      console.warn(`Unknown property type: ${csvType}, defaulting to SHOPPING_CENTRE`)
      return LocationType.SHOPPING_CENTRE
  }
}

function parseDecimal(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseFloat(value)
  return isNaN(parsed) ? null : parsed
}

function parseInteger(value: string): number | null {
  if (!value || value.trim() === '') return null
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? null : parsed
}

function extractAddressComponents(address: string): { city: string; county: string; postcode: string } {
  const parts = address.split(',').map(part => part.trim())
  
  // Extract postcode (last part that matches UK postcode pattern)
  const postcodeMatch = parts[parts.length - 1]?.match(/[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}/i)
  const postcode = postcodeMatch ? postcodeMatch[0] : parts[parts.length - 1] || ''
  
  // Extract city and county from remaining parts
  const remainingParts = postcodeMatch ? parts.slice(0, -1) : parts
  const city = remainingParts[remainingParts.length - 1] || ''
  const county = remainingParts[remainingParts.length - 2] || ''
  
  return { city, county, postcode }
}

async function main() {
  try {
    console.log('🚀 Starting CSV property ingestion...')
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public', 'UK_Retail_Properties_Comprehensive_List - All Properties.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records: CSVProperty[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
    
    console.log(`📊 Found ${records.length} properties in CSV`)
    
    // Process each property
    let imported = 0
    let skipped = 0
    let errors = 0
    
    for (const record of records) {
      try {
        const { city, county, postcode } = extractAddressComponents(record['Address'])
        
        // Check if property already exists (by name + postcode)
        const existingProperty = await prisma.location.findFirst({
          where: {
            name: record['Property Name'],
            postcode: postcode
          }
        })
        
        if (existingProperty) {
          console.log(`⏭️  Skipping existing property: ${record['Property Name']}`)
          skipped++
          continue
        }
        
        // Create new property
        const property = await prisma.location.create({
          data: {
            name: record['Property Name'],
            type: mapPropertyType(record['Property Type']),
            address: record['Address'],
            city,
            county,
            postcode,
            // Note: latitude/longitude will be null initially, need geocoding
            latitude: 0, // Placeholder - will be updated with geocoding
            longitude: 0, // Placeholder - will be updated with geocoding
            
            // CSV KPI fields
            healthIndex: parseDecimal(record['Health Index']),
            largestCategory: record['Largest Category'] || null,
            largestCategoryPercent: parseDecimal(record['Largest Category Percent']),
            vacancy: parseDecimal(record['Vacancy']),
            vacancyGrowth: parseDecimal(record['Vacancy Growth']),
            persistentVacancy: parseDecimal(record['Persistent Vacancy (3+ yrs)']),
            vacantUnits: parseInteger(record['Vacant Units']),
            vacantUnitGrowth: parseInteger(record['Vacant Unit Growth']),
            averageTenancyLengthYears: parseDecimal(record['Average Tenancy Length (years)']),
            percentMultiple: parseDecimal(record['Percent Multiple']),
            percentIndependent: parseDecimal(record['Percent Independent']),
            qualityOfferMass: parseDecimal(record['Quality of Offer - % Mass']),
            qualityOfferPremium: parseDecimal(record['Quality of Offer - % Premium']),
            qualityOfferValue: parseDecimal(record['Quality of Offer - % Value']),
            vacantFloorspace: parseInteger(record['Vacant Floorspace']),
            vacantFloorspaceGrowth: parseDecimal(record['Vacant Floorspace Growth']),
            floorspaceVacancy: parseDecimal(record['Floorspace Vacancy']),
            floorspaceVacancyGrowth: parseDecimal(record['Floorspace Vacancy Growth']),
            floorspaceVacancyLeisure: parseDecimal(record['Floorspace Vacancy Leisure']),
            floorspaceVacancyLeisureGrowth: parseDecimal(record['Floorspace Vacancy Leisure Growth']),
            floorspaceVacancyRetail: parseDecimal(record['Floorspace Vacancy Retail']),
            floorspaceVacancyRetailGrowth: parseDecimal(record['Floorspace Vacancy Retail Growth']),
            floorspacePersistentVacancy: parseDecimal(record['Floorspace Persistent Vacancy (3+ yrs)']),
            
            // Set total units if available
            numberOfStores: parseInteger(record['Number of Units']),
            totalFloorArea: parseInteger(record['Total Floorspace']),
          }
        })
        
        console.log(`✅ Imported: ${property.name} (${property.type})`)
        imported++
        
      } catch (error) {
        console.error(`❌ Error importing ${record['Property Name']}:`, error)
        errors++
      }
    }
    
    console.log('\n📈 Import Summary:')
    console.log(`   Imported: ${imported}`)
    console.log(`   Skipped: ${skipped}`)
    console.log(`   Errors: ${errors}`)
    console.log(`   Total processed: ${records.length}`)
    
    console.log('\n⚠️  Note: Properties imported without coordinates. Run geocoding script to add lat/lon.')
    
  } catch (error) {
    console.error('💥 Fatal error during ingestion:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
