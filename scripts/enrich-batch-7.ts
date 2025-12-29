import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'St Martins Walk',
            data: {
                website: 'https://stmartinswalk.com',
                parkingSpaces: 372,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Free Parking'
                },
                anchorTenants: 3, // Waitrose, M&S, Holland & Barrett
            }
        },
        {
            name: 'The Bridges',
            data: {
                website: 'https://thebridges-shopping.com',
                city: 'Sunderland',
                county: 'Tyne & Wear',
                parkingSpaces: 900,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-20:00', // Late night Thursday
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/TheBridgesSunderland',
                instagram: 'https://www.instagram.com/thebridgessunderland',
                anchorTenants: 2, // Primark, TK Maxx
            }
        },
        {
            name: 'Waterborne Walk ',
            data: {
                openingHours: {
                    Monday: '08:00-20:00',
                    Tuesday: '08:00-20:00',
                    Wednesday: '08:00-20:00',
                    Thursday: '08:00-20:00',
                    Friday: '08:00-20:00',
                    Saturday: '08:00-20:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Waitrose & Partners
            }
        },
        {
            name: 'Weavers Wharf',
            data: {
                website: 'https://weavers-wharf.com',
                parkingSpaces: 396,
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:30-16:30'
                },
            }
        },
        {
            name: 'Willows',
            data: {
                openingHours: {
                    Monday: '08:00-20:00',
                    Tuesday: '08:00-20:00',
                    Wednesday: '08:00-20:00',
                    Thursday: '08:00-20:00',
                    Friday: '08:00-20:00',
                    Saturday: '08:00-20:00',
                    Sunday: 'Closed'
                },
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
                city: true,
                county: true,
                website: true,
                parkingSpaces: true,
                facebook: true,
                instagram: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: City=${loc.city}, County=${loc.county}, Website=${loc.website}, Parking=${loc.parkingSpaces}`);
            console.log(`  Socials: FB=${loc.facebook ? '✓' : '✗'} IG=${loc.instagram ? '✓' : '✗'}`);
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
