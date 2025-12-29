import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    // First, rename Hillsborough Barracks to Hillsborough Exchange
    console.log('=== RENAMING ===\n');
    const renameResult = await prisma.location.updateMany({
        where: { name: 'Hillsborough Barracks, Sheffield' },
        data: { name: 'Hillsborough Exchange' }
    });
    if (renameResult.count > 0) {
        console.log(`✅ Renamed: "Hillsborough Barracks, Sheffield" → "Hillsborough Exchange"\n`);
    }

    console.log('=== ENRICHING BATCH 10 ===\n');

    const updates = [
        {
            name: 'Kingsland ,Thatcham',
            data: {
                website: 'https://thatchamtowncouncil.gov.uk',
                city: 'Thatcham',
                county: 'Berkshire',
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Waitrose & Partners
            }
        },
        {
            name: 'Marsh Hythe ',
            data: {
                city: 'Hythe',
                county: 'Kent',
                openingHours: {
                    Monday: '08:00-20:00',
                    Tuesday: '08:00-20:00',
                    Wednesday: '08:00-20:00',
                    Thursday: '08:00-20:00',
                    Friday: '08:00-20:00',
                    Saturday: '08:00-20:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Waitrose
                // Note: "Marsh Hythe" refers to the location, not a specific mall building
            }
        },
        {
            name: 'Palace Shopping, Enfield ',
            data: {
                website: 'https://palaceshopping.co.uk',
                city: 'Enfield',
                county: 'Greater London',
                parkingSpaces: 1000,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-19:00', // Late night Thursday
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:30-16:30'
                },
                instagram: 'https://www.instagram.com/palaceshopping',
                facebook: 'https://www.facebook.com/PalaceShopping',
                // Structure: Two malls ("Gardens" and "Exchange") linked by town centre
            }
        }
    ];

    for (const update of updates) {
        try {
            const result = await prisma.location.updateMany({
                where: { name: update.name },
                data: update.data
            });

            if (result.count > 0) {
                console.log(`✅ Updated: ${update.name} (${result.count} record(s))`);
            } else {
                console.log(`⚠️  Not found: ${update.name}`);
            }
        } catch (error) {
            console.error(`❌ Error updating ${update.name}:`, error);
        }
    }

    // Flag data conflicts
    console.log('\n=== FLAGGED LOCATIONS - ACTION REQUIRED ===\n');

    console.log('⚠️  #48 Ladysmith Newcastle under lyme - DATA CONFLICT');
    console.log('   Issue: Name "Ladysmith" belongs to Ashton-under-Lyne (OL6), not Newcastle-under-Lyme (ST5)');
    console.log('   Option A: Ladysmith Shopping Centre (Ashton-under-Lyne, OL6 9AR) - ladysmithshoppingcentre.com');
    console.log('   Option B: Roebuck Shopping Centre (Newcastle-under-Lyme, ST5 1DU)');
    console.log('   NOT UPDATED - Awaiting client clarification.\n');

    console.log('⚠️  #50 Naunton Fitzwarren Taunton - NAME ERROR');
    console.log('   Issue: Should be "Norton Fitzwarren" (typo)');
    console.log('   Type: Small local parade / trading estate, not a shopping centre');
    console.log('   NOT UPDATED - Awaiting client clarification.\n');

    // Show summary
    console.log('=== VERIFICATION ===\n');

    const verify = ['Hillsborough Exchange', 'Kingsland ,Thatcham', 'Marsh Hythe ', 'Palace Shopping, Enfield '];
    for (const name of verify) {
        const loc = await prisma.location.findFirst({
            where: { name },
            select: {
                name: true,
                city: true,
                county: true,
                website: true,
                parkingSpaces: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: City=${loc.city}, County=${loc.county}, Parking=${loc.parkingSpaces}`);
        }
    }
}

enrichLocations()
    .then(() => prisma.$disconnect())
    .catch((e) => {
        console.error(e);
        prisma.$disconnect();
        process.exit(1);
    });
