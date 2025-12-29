import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Lower Precinct ',
            data: {
                website: 'https://lowerprecinct.com',
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '09:00-17:00'
                },
                facebook: 'https://www.facebook.com/LowerPrecinctCoventry',
                instagram: 'https://www.instagram.com/lowerprecinctcoventry',
                anchorTenants: 3, // Next, H&M, Pandora
            }
        },
        {
            name: 'Mailbox Birmingham',
            data: {
                website: 'https://mailboxlife.com',
                parkingSpaces: 687, // Q-Park, 24/7 secure
                openingHours: {
                    Monday: '10:00-22:00',
                    Tuesday: '10:00-22:00',
                    Wednesday: '10:00-22:00',
                    Thursday: '10:00-22:00',
                    Friday: '10:00-22:00',
                    Saturday: '10:00-22:00',
                    Sunday: '11:00-22:00'
                },
                // Note: Premium Mixed-Use (Offices, Hotels, Dining). Home to BBC Birmingham.
            }
        },
        {
            name: 'One Stop',
            data: {
                website: 'https://onestop-shopping.co.uk',
                openingHours: {
                    Monday: '08:30-20:00',
                    Tuesday: '08:30-20:00',
                    Wednesday: '08:30-20:00',
                    Thursday: '08:30-22:00',
                    Friday: '08:30-22:00',
                    Saturday: '08:30-20:00',
                    Sunday: '10:00-16:00'
                },
                facebook: 'https://www.facebook.com/OneStopShopping',
                // Note: Includes "Market Village" indoor market + M&S Outlet
            }
        },
        {
            name: 'Priors Hall',
            data: {
                openingHours: {
                    Monday: '07:00-23:00',
                    Tuesday: '07:00-23:00',
                    Wednesday: '07:00-23:00',
                    Thursday: '07:00-23:00',
                    Friday: '07:00-23:00',
                    Saturday: '07:00-23:00',
                    Sunday: '07:00-23:00'
                },
                // Note: Neighbourhood Centre / District Centre for Priors Hall Park residential development
            }
        },
        {
            name: 'Riverside',
            data: {
                openingHours: {
                    Monday: '07:30-18:30',
                    Tuesday: '07:30-18:30',
                    Wednesday: '07:30-18:30',
                    Thursday: '07:30-18:30',
                    Friday: '07:30-18:30',
                    Saturday: '07:30-18:30',
                    Sunday: '09:30-16:00'
                },
                // Note: Open-air precinct in Evesham, managed by Wychavon Council. Surface parking Pay & Display £4/24h.
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
                facebook: true,
                instagram: true,
                openingHours: true,
            }
        });
        if (loc) {
            console.log(`${loc.name}: Website=${loc.website}, Parking=${loc.parkingSpaces}`);
            console.log(`  Socials: FB=${loc.facebook ? '✓' : '✗'} IG=${loc.instagram ? '✓' : '✗'}`);
            console.log(`  Hours: ${loc.openingHours ? '✓' : '✗'}`);
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
