import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Armthorpe Shopping centre',
            data: {
                parkingSpaces: 80,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 3, // Tesco Express, Co-op, Heron Foods
            }
        },
        {
            name: 'Bell Walk',
            data: {
                parkingSpaces: 50,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Waitrose nearby
            }
        },
        {
            name: 'Borough Parade',
            data: {
                website: 'https://borough-parade.wheree.com',
                parkingSpaces: 172,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/BoroughParadeChippenham',
                anchorTenants: 3, // Waterstones, New Look, Caffè Nero
            }
        },
        {
            name: 'Britten Centre',
            data: {
                website: 'https://brittencentre.co.uk',
                parkingSpaces: 365, // Note: Currently CLOSED for repairs
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/BrittenCentre',
            }
        },
        {
            name: 'Highcross',
            data: {
                website: 'https://highcrossleicester.com',
                footfall: 18000000, // ~18m annual
                parkingSpaces: 3000,
                numberOfStores: 100,
                openingHours: {
                    Monday: '09:30-20:00',
                    Tuesday: '09:30-20:00',
                    Wednesday: '09:30-20:00',
                    Thursday: '09:30-20:00',
                    Friday: '09:30-20:00',
                    Saturday: '09:00-19:00',
                    Sunday: '11:00-17:00'
                },
                facebook: 'https://www.facebook.com/HighcrossLeicester',
                instagram: 'https://www.instagram.com/highcrossleicester',
                twitter: 'https://twitter.com/HighcrossLeic',
                anchorTenants: 1, // John Lewis
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
                footfall: true,
                facebook: true,
                instagram: true,
                twitter: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: Website=${loc.website}, Parking=${loc.parkingSpaces}, Stores=${loc.numberOfStores}, Footfall=${loc.footfall}`);
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
