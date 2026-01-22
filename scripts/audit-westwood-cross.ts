import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const location = await prisma.location.findFirst({
        where: { name: { contains: 'Westwood Cross' } },
        include: { tenants: true }
    });

    if (!location) {
        console.log('Location not found');
        return;
    }

    console.log('=== WESTWOOD CROSS SHOPPING CENTRE DATA AUDIT ===\n');

    // All possible fields from schema
    const fields: [string, any][] = [
        // Core
        ['id', location.id],
        ['name', location.name],
        ['type', location.type],
        ['address', location.address],
        ['city', location.city],
        ['county', location.county],
        ['postcode', location.postcode],
        ['latitude', location.latitude],
        ['longitude', location.longitude],
        // Contact
        ['phone', location.phone],
        ['website', location.website],
        // Operational
        ['openingHours', location.openingHours],
        ['parkingSpaces', location.parkingSpaces],
        ['totalFloorArea', location.totalFloorArea],
        ['numberOfStores', location.numberOfStores],
        ['numberOfFloors', location.numberOfFloors],
        ['anchorTenants', location.anchorTenants],
        ['publicTransit', location.publicTransit],
        // Commercial
        ['owner', location.owner],
        ['management', location.management],
        ['openedYear', location.openedYear],
        ['footfall', location.footfall],
        ['retailers', location.retailers],
        ['carParkPrice', location.carParkPrice],
        ['retailSpace', location.retailSpace],
        ['evCharging', location.evCharging],
        ['evChargingSpaces', location.evChargingSpaces],
        // Hero Image
        ['heroImage', location.heroImage],
        // Social Media
        ['instagram', location.instagram],
        ['facebook', location.facebook],
        ['youtube', location.youtube],
        ['tiktok', location.tiktok],
        ['twitter', location.twitter],
        // Reviews
        ['googleRating', location.googleRating],
        ['googleReviews', location.googleReviews],
        ['googleVotes', location.googleVotes],
        ['facebookRating', location.facebookRating],
        ['facebookReviews', location.facebookReviews],
        ['facebookVotes', location.facebookVotes],
        // SEO
        ['seoKeywords', location.seoKeywords],
        ['topPages', location.topPages],
        // Demographics
        ['population', location.population],
        ['medianAge', location.medianAge],
        ['familiesPercent', location.familiesPercent],
        ['seniorsPercent', location.seniorsPercent],
        ['avgHouseholdIncome', location.avgHouseholdIncome],
        ['incomeVsNational', location.incomeVsNational],
        ['homeownership', location.homeownership],
        ['homeownershipVsNational', location.homeownershipVsNational],
        ['carOwnership', location.carOwnership],
        ['carOwnershipVsNational', location.carOwnershipVsNational],
        // Commercial KPIs
        ['healthIndex', location.healthIndex],
        ['largestCategory', location.largestCategory],
        ['largestCategoryPercent', location.largestCategoryPercent],
        ['percentMultiple', location.percentMultiple],
        ['percentIndependent', location.percentIndependent],
        // System
        ['isManaged', location.isManaged],
        ['enrichmentScore', location.enrichmentScore],
    ];

    let filled = 0;
    let empty = 0;
    const filledFields: string[] = [];
    const emptyFields: string[] = [];

    fields.forEach(([name, value]) => {
        const hasValue = value !== null && value !== undefined && value !== '';
        if (hasValue) {
            filled++;
            filledFields.push(name);
        } else {
            empty++;
            emptyFields.push(name);
        }
    });

    console.log('=== FILLED FIELDS (' + filled + ') ===');
    fields.forEach(([name, value]) => {
        const hasValue = value !== null && value !== undefined && value !== '';
        if (hasValue) {
            const displayValue = typeof value === 'object'
                ? JSON.stringify(value).substring(0, 80)
                : String(value).substring(0, 80);
            console.log('✅ ' + name + ': ' + displayValue);
        }
    });

    console.log('\n=== MISSING FIELDS (' + empty + ') ===');
    emptyFields.forEach(name => {
        console.log('❌ ' + name);
    });

    console.log('\n=== TENANTS ===');
    console.log('Total tenants: ' + location.tenants.length);
    if (location.tenants.length > 0) {
        location.tenants.slice(0, 15).forEach((t: any) =>
            console.log('- ' + t.name + ' (' + (t.category || 'No category') + ')')
        );
        if (location.tenants.length > 15) {
            console.log('... and ' + (location.tenants.length - 15) + ' more');
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log('Filled fields: ' + filled + '/' + (filled + empty));
    console.log('Empty fields: ' + empty);
    console.log('Completion: ' + Math.round(filled / (filled + empty) * 100) + '%');
}

main().catch(console.error).finally(() => prisma.$disconnect());
