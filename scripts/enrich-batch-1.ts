import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Birchwood',
            data: {
                website: 'https://birchwoodshoppingcentre.co.uk',
                parkingSpaces: 1100,
                openingHours: {
                    Monday: '08:00-20:00',
                    Tuesday: '08:00-20:00',
                    Wednesday: '08:00-20:00',
                    Thursday: '08:00-20:00',
                    Friday: '08:00-20:00',
                    Saturday: '08:00-20:00',
                    Sunday: '10:00-16:30'
                },
                facebook: 'https://www.facebook.com/BirchwoodShoppingCentre',
                twitter: 'https://twitter.com/BirchwoodSC',
                anchorTenants: 2, // Asda & Aldi
            }
        },
        {
            name: 'Byron Place Shopping Centre',
            data: {
                website: 'https://byronplace.co.uk',
                parkingSpaces: 358,
                totalFloorArea: 45000, // Asda alone is 45k sq ft
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                facebook: 'https://www.facebook.com/ByronPlaceSeaham',
                numberOfStores: 15,
            }
        },
        {
            name: 'Chelmsley Wood',
            data: {
                website: 'https://chelmsleywoodshopping.co.uk',
                openingHours: {
                    Monday: '08:00-19:00',
                    Tuesday: '08:00-19:00',
                    Wednesday: '08:00-19:00',
                    Thursday: '08:00-19:00',
                    Friday: '08:00-19:00',
                    Saturday: '08:00-19:00',
                    Sunday: '10:00-17:00'
                },
                googleRating: 4.0,
            }
        },
        {
            name: 'Cwmbran',
            data: {
                website: 'https://cwmbrancentre.com',
                footfall: 22260000, // 22.26m annual
                parkingSpaces: 3000,
                numberOfStores: 170,
                facebook: 'https://www.facebook.com/CwmbranCentre',
            }
        },
        {
            name: 'Grosvenor',
            data: {
                website: 'https://grosvenorshoppingnorthampton.co.uk',
                parkingSpaces: 810,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: '09:30-17:30'
                },
                instagram: 'https://www.instagram.com/grosvenorshoppingnorthampton',
                facebook: 'https://www.facebook.com/GrosvenorShoppingNorthampton',
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

    // Show summary of updated locations
    console.log('\n=== VERIFICATION ===\n');

    for (const update of updates) {
        const loc = await prisma.location.findFirst({
            where: { name: update.name },
            select: {
                name: true,
                website: true,
                parkingSpaces: true,
                numberOfStores: true,
                footfall: true,
                googleRating: true,
                facebook: true,
                instagram: true,
                twitter: true,
                openingHours: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}:`);
            console.log(`  Website: ${loc.website}`);
            console.log(`  Parking: ${loc.parkingSpaces}`);
            console.log(`  Stores: ${loc.numberOfStores}`);
            console.log(`  Footfall: ${loc.footfall}`);
            console.log(`  Google Rating: ${loc.googleRating}`);
            console.log(`  Facebook: ${loc.facebook}`);
            console.log(`  Instagram: ${loc.instagram}`);
            console.log(`  Twitter: ${loc.twitter}`);
            console.log(`  Hours: ${JSON.stringify(loc.openingHours)}`);
            console.log('');
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
