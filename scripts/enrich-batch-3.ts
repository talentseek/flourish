import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Park Farm',
            data: {
                website: 'https://m-park-farm.wheree.com',
                parkingSpaces: 90, // approx 80-100
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: '10:00-16:00'
                },
                anchorTenants: 3, // Co-op, Boots, B&M
            }
        },
        {
            name: 'Parkway',
            data: {
                website: 'https://parkwayshopping.co.uk',
                numberOfStores: 50,
                openingHours: {
                    Monday: '08:00-18:30',
                    Tuesday: '08:00-18:30',
                    Wednesday: '08:00-18:30',
                    Thursday: '08:00-19:00',
                    Friday: '08:00-19:00',
                    Saturday: '08:00-18:00',
                    Sunday: '09:30-16:00'
                },
                facebook: 'https://www.facebook.com/ParkwayShopping',
                anchorTenants: 1, // Tesco Extra
            }
        },
        {
            name: 'Pentagon',
            data: {
                website: 'https://pentagonshoppingcentre.co.uk',
                parkingSpaces: 433,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/PentagonShopping',
                instagram: 'https://www.instagram.com/pentagonshopping',
                anchorTenants: 3, // Sainsbury's, Superdrug, Wilko
            }
        },
        {
            name: 'Priory',
            data: {
                parkingSpaces: 359,
                openingHours: {
                    Monday: '07:00-19:00',
                    Tuesday: '07:00-19:00',
                    Wednesday: '07:00-19:00',
                    Thursday: '07:00-19:00',
                    Friday: '07:00-19:00',
                    Saturday: '07:00-19:00',
                    Sunday: '09:00-16:45'
                },
                anchorTenants: 2, // Sainsbury's, Superdrug
            }
        },
        {
            name: 'St Katharine Docks',
            data: {
                website: 'https://skdocks.co.uk',
                openingHours: {
                    Monday: '24h',
                    Tuesday: '24h',
                    Wednesday: '24h',
                    Thursday: '24h',
                    Friday: '24h',
                    Saturday: '24h',
                    Sunday: '24h'
                },
                instagram: 'https://www.instagram.com/stkdocks',
                // Note: Mixed-use Marina & Leisure Estate with 185 marina berths
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
                anchorTenants: true,
                facebook: true,
                instagram: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: Website=${loc.website}, Parking=${loc.parkingSpaces}, Stores=${loc.numberOfStores}, Anchors=${loc.anchorTenants}`);
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
