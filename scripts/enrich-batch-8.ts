import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Armada Way ,Royal Parade,Plymouth',
            data: {
                website: 'https://armadacentreplymouth.co.uk',
                city: 'Plymouth',
                county: 'Devon',
                parkingSpaces: 103,
                openingHours: {
                    Monday: '07:00-20:00',
                    Tuesday: '07:00-20:00',
                    Wednesday: '07:00-20:00',
                    Thursday: '07:00-20:00',
                    Friday: '07:00-20:00',
                    Saturday: '07:00-20:00',
                    Sunday: '10:30-16:30'
                },
                anchorTenants: 1, // Sainsbury's
            }
        },
        {
            name: 'Balmoral Centre, Scarborough',
            data: {
                website: 'https://ncp.co.uk/balmoral',
                city: 'Scarborough',
                county: 'North Yorkshire',
                parkingSpaces: 397,
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
            }
        },
        {
            name: 'Billingham, Town Centre',
            data: {
                website: 'https://stockton.gov.uk/billingham',
                city: 'Billingham',
                county: 'County Durham',
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                // Note: 6 car parks with free unlimited stay
                // Home to Billingham Forum (Ice Arena/Theatre)
            }
        },
    ];

    // Note: Beacon Place (#40) skipped - likely data error (Community Centre, not shopping mall)
    // Note: Astley Bridge skipped - this is an Asda Superstore, not a traditional mall

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

    // Flag Beacon Place as potential data error
    console.log('\n⚠️  FLAGGED: Beacon Place (EX4 4PN) - NOT UPDATED');
    console.log('   Reason: Address corresponds to The Beacon Community Centre, not a shopping mall.');
    console.log('   Recommend: Review source data and remove if confirmed as error.\n');

    // Show summary
    console.log('=== VERIFICATION ===\n');

    for (const update of updates) {
        const loc = await prisma.location.findFirst({
            where: { name: update.name },
            select: {
                name: true,
                city: true,
                county: true,
                website: true,
                parkingSpaces: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: City=${loc.city}, County=${loc.county}, Website=${loc.website}, Parking=${loc.parkingSpaces}`);
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
