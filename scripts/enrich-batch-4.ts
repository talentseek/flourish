import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Swan',
            data: {
                website: 'https://swancentreyardley.co.uk',
                parkingSpaces: 797,
                totalFloorArea: 176280,
                openingHours: {
                    Monday: '09:00-18:00',
                    Tuesday: '09:00-18:00',
                    Wednesday: '09:00-18:00',
                    Thursday: '09:00-18:00',
                    Friday: '09:00-18:00',
                    Saturday: '09:00-18:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Tesco Extra (110k sq ft)
            }
        },
        {
            name: 'The Viking Centre',
            data: {
                website: 'https://thevikingcentre.co.uk',
                parkingSpaces: 400,
                numberOfStores: 40,
                openingHours: {
                    Monday: '06:00-21:00',
                    Tuesday: '06:00-21:00',
                    Wednesday: '06:00-21:00',
                    Thursday: '06:00-21:00',
                    Friday: '06:00-21:00',
                    Saturday: '06:00-21:00',
                    Sunday: '08:30-16:00'
                },
            }
        },
        {
            name: 'The Walnuts',
            data: {
                website: 'https://thewalnutsshoppingcentre.com',
                parkingSpaces: 525,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/TheWalnutsShopping',
                twitter: 'https://twitter.com/TheWalnuts',
            }
        },
        {
            name: 'Weston Favell',
            data: {
                website: 'https://westonfavellshopping.com',
                numberOfStores: 65,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Tesco Extra
            }
        },
        {
            name: 'Woolshops',
            data: {
                website: 'https://woolshopsshoppingcentre.co.uk',
                parkingSpaces: 320,
                numberOfStores: 40,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:30-16:30'
                },
                facebook: 'https://www.facebook.com/WoolshopsShopping',
                instagram: 'https://www.instagram.com/woolshopsshopping',
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

    // Show summary
    console.log('\n=== VERIFICATION ===\n');

    for (const update of updates) {
        const loc = await prisma.location.findFirst({
            where: { name: update.name },
            select: {
                name: true,
                website: true,
                parkingSpaces: true,
                numberOfStores: true,
                totalFloorArea: true,
                facebook: true,
                instagram: true,
                twitter: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: Website=${loc.website}, Parking=${loc.parkingSpaces}, Stores=${loc.numberOfStores}, FloorArea=${loc.totalFloorArea}`);
            console.log(`  Socials: FB=${loc.facebook ? '✓' : '✗'} IG=${loc.instagram ? '✓' : '✗'} TW=${loc.twitter ? '✓' : '✗'}`);
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
