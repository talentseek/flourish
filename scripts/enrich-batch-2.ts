import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Heart',
            data: {
                website: 'https://heartshopping.co.uk',
                footfall: 4680000, // ~90,000 weekly * 52
                parkingSpaces: 700,
                openingHours: {
                    Monday: '09:30-18:00',
                    Tuesday: '09:30-18:00',
                    Wednesday: '09:30-18:00',
                    Thursday: '09:30-18:00',
                    Friday: '09:30-18:00',
                    Saturday: '09:30-18:00',
                    Sunday: '11:00-17:00'
                },
                instagram: 'https://www.instagram.com/heartshopping',
                facebook: 'https://www.facebook.com/HeartShopping',
                twitter: 'https://twitter.com/HeartShopping',
                anchorTenants: 2, // Sainsbury's, Gymfinity Kids
            }
        },
        {
            name: 'Killingworth Centre',
            data: {
                website: 'https://killingworthcentre.com',
                parkingSpaces: 700,
                openingHours: {
                    Monday: '07:00-22:00',
                    Tuesday: '07:00-22:00',
                    Wednesday: '07:00-22:00',
                    Thursday: '07:00-22:00',
                    Friday: '07:00-22:00',
                    Saturday: '07:00-22:00',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/KillingworthCentre',
                twitter: 'https://twitter.com/KillingworthCtr',
                anchorTenants: 3, // Morrisons, Matalan, McDonald's
            }
        },
        {
            name: 'Lexicon , Bracknell',
            data: {
                website: 'https://thelexiconbracknell.com',
                openingHours: {
                    Monday: '09:00-18:00',
                    Tuesday: '09:00-18:00',
                    Wednesday: '09:00-18:00',
                    Thursday: '09:00-18:00',
                    Friday: '09:00-18:00',
                    Saturday: '09:00-18:00',
                    Sunday: '11:00-17:00'
                },
                facebook: 'https://www.facebook.com/TheLexiconBracknell',
                instagram: 'https://www.instagram.com/thelexiconbracknell',
                twitter: 'https://twitter.com/TheLexicon',
                anchorTenants: 2, // Waitrose, Fenwick
            }
        },
        {
            name: 'Longton Exchange',
            data: {
                website: 'https://longtonexchange.co.uk',
                parkingSpaces: 213,
                numberOfStores: 27,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
                facebook: 'https://www.facebook.com/LongtonExchange',
                instagram: 'https://www.instagram.com/longtonexchange',
                anchorTenants: 3, // Boots, Poundland, Iceland
            }
        },
        {
            name: 'Marlands',
            data: {
                website: 'https://marlandsshoppingcentre.co.uk',
                totalFloorArea: 220000,
                parkingSpaces: 810,
                numberOfStores: 60,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-18:00',
                    Saturday: '09:00-18:00',
                    Sunday: 'Closed'
                },
                facebook: 'https://www.facebook.com/MarlandsShopping',
                instagram: 'https://www.instagram.com/marlandsshopping',
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
                footfall: true,
                facebook: true,
                instagram: true,
                twitter: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: Website=${loc.website}, Parking=${loc.parkingSpaces}, Stores=${loc.numberOfStores}, FloorArea=${loc.totalFloorArea}, Footfall=${loc.footfall}`);
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
