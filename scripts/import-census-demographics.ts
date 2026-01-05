#!/usr/bin/env tsx
/**
 * Import Census 2021 Demographics Data
 * Maps locations to Local Authority (LTLA) and imports demographic stats
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

// UK Postcode to Local Authority mapping (simplified - first part maps to common LAs)
// This is a simplified approach - ideally use postcode.io API for accurate mapping
const postcodeToLTLA: Record<string, string> = {
    // London
    'E': 'London', 'EC': 'London', 'N': 'London', 'NW': 'London', 'SE': 'London',
    'SW': 'London', 'W': 'London', 'WC': 'London',
    // Major cities - use city name matching instead
};

interface CensusData {
    // TS007a - Age
    ageTotal?: number;
    age0to4?: number;
    age5to9?: number;
    age65plus?: number;
    // TS045 - Cars
    carsTotal?: number;
    noCars?: number;
    oneCar?: number;
    twoPlusCars?: number;
    // TS054 - Tenure
    tenureTotal?: number;
    owned?: number;
    // TS062 - NS-SEC
    nsSecTotal?: number;
    professional?: number;
}

// Load census data by LTLA
function loadCensusLTLA(): Map<string, CensusData> {
    const censusMap = new Map<string, CensusData>();

    // Load TS007a - Age demographics
    try {
        const ageData = parse(readFileSync('./public/census2021-ts007a/census2021-ts007a-ltla.csv', 'utf-8'), { columns: true, bom: true });
        for (const row of ageData) {
            const name = row['geography'];
            if (!censusMap.has(name)) censusMap.set(name, {});
            const data = censusMap.get(name)!;
            data.ageTotal = parseInt(row['Age: Total']) || 0;
            data.age0to4 = parseInt(row['Age: Aged 4 years and under']) || 0;
            data.age5to9 = parseInt(row['Age: Aged 5 to 9 years']) || 0;
            const age65 = (parseInt(row['Age: Aged 65 to 69 years']) || 0) +
                (parseInt(row['Age: Aged 70 to 74 years']) || 0) +
                (parseInt(row['Age: Aged 75 to 79 years']) || 0) +
                (parseInt(row['Age: Aged 80 to 84 years']) || 0) +
                (parseInt(row['Age: Aged 85 years and over']) || 0);
            data.age65plus = age65;
        }
        console.log(`  Loaded ${ageData.length} LTLAs from TS007a (Age)`);
    } catch (e) {
        console.log('  ⚠️ Failed to load TS007a');
    }

    // Load TS045 - Car ownership
    try {
        const carData = parse(readFileSync('./public/census2021-ts045/census2021-ts045-ltla.csv', 'utf-8'), { columns: true, bom: true });
        for (const row of carData) {
            const name = row['geography'];
            if (!censusMap.has(name)) censusMap.set(name, {});
            const data = censusMap.get(name)!;
            data.carsTotal = parseInt(row['Number of cars or vans: Total: All households']) || 0;
            data.noCars = parseInt(row['Number of cars or vans: No cars or vans in household']) || 0;
            data.oneCar = parseInt(row['Number of cars or vans: 1 car or van in household']) || 0;
            data.twoPlusCars = (parseInt(row['Number of cars or vans: 2 cars or vans in household']) || 0) +
                (parseInt(row['Number of cars or vans: 3 or more cars or vans in household']) || 0);
        }
        console.log(`  Loaded ${carData.length} LTLAs from TS045 (Cars)`);
    } catch (e) {
        console.log('  ⚠️ Failed to load TS045');
    }

    // Load TS054 - Tenure
    try {
        const tenureData = parse(readFileSync('./public/census2021-ts054/census2021-ts054-ltla.csv', 'utf-8'), { columns: true, bom: true });
        for (const row of tenureData) {
            const name = row['geography'];
            if (!censusMap.has(name)) censusMap.set(name, {});
            const data = censusMap.get(name)!;
            data.tenureTotal = parseInt(row['Tenure of household: Total: All households']) || 0;
            data.owned = parseInt(row['Tenure of household: Owned']) || 0;
        }
        console.log(`  Loaded ${tenureData.length} LTLAs from TS054 (Tenure)`);
    } catch (e) {
        console.log('  ⚠️ Failed to load TS054');
    }

    return censusMap;
}

// Match location city/county to LTLA name
function matchLTLA(city: string, county: string, censusMap: Map<string, CensusData>): string | null {
    // Direct city match
    for (const ltla of censusMap.keys()) {
        if (ltla.toLowerCase() === city.toLowerCase()) return ltla;
        if (ltla.toLowerCase().includes(city.toLowerCase())) return ltla;
        if (city.toLowerCase().includes(ltla.toLowerCase())) return ltla;
    }

    // County match
    for (const ltla of censusMap.keys()) {
        if (ltla.toLowerCase() === county.toLowerCase()) return ltla;
        if (ltla.toLowerCase().includes(county.toLowerCase())) return ltla;
    }

    return null;
}

async function main() {
    console.log('\n📊 CENSUS 2021 DEMOGRAPHICS IMPORT\n');
    console.log('='.repeat(60));

    console.log('\n📥 Loading Census data...');
    const censusMap = loadCensusLTLA();
    console.log(`  Total LTLAs loaded: ${censusMap.size}`);

    // Get all locations
    const locations = await prisma.location.findMany({
        where: { population: null },
        select: { id: true, name: true, city: true, county: true }
    });

    console.log(`\n🏪 Processing ${locations.length} locations without demographics...\n`);

    let updated = 0;
    let matched = 0;

    for (const loc of locations) {
        const ltla = matchLTLA(loc.city, loc.county, censusMap);
        if (!ltla) continue;

        matched++;
        const census = censusMap.get(ltla)!;

        // Calculate percentages
        const population = census.ageTotal || 0;
        const seniorsPercent = population > 0 ? ((census.age65plus || 0) / population) * 100 : null;
        const carOwnership = census.carsTotal ? ((census.carsTotal - (census.noCars || 0)) / census.carsTotal) * 100 : null;
        const homeownership = census.tenureTotal ? ((census.owned || 0) / census.tenureTotal) * 100 : null;

        try {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    population,
                    seniorsPercent: seniorsPercent ? parseFloat(seniorsPercent.toFixed(1)) : null,
                    carOwnership: carOwnership ? parseFloat(carOwnership.toFixed(1)) : null,
                    homeownership: homeownership ? parseFloat(homeownership.toFixed(1)) : null,
                }
            });
            updated++;
        } catch (e) {
            // Skip errors
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 IMPORT COMPLETE`);
    console.log(`   LTLAs matched: ${matched}`);
    console.log(`   Locations updated: ${updated}`);

    // Final counts
    const withPop = await prisma.location.count({ where: { population: { not: null } } });
    const withCar = await prisma.location.count({ where: { carOwnership: { not: null } } });
    const withHome = await prisma.location.count({ where: { homeownership: { not: null } } });

    console.log(`\n📊 DATABASE STATUS:`);
    console.log(`   Population: ${withPop}`);
    console.log(`   Car Ownership: ${withCar}`);
    console.log(`   Homeownership: ${withHome}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
