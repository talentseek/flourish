import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enrichLocations() {
    const updates = [
        {
            name: 'Carters Square',
            data: {
                city: 'Uttoxeter',
                county: 'Staffordshire',
                parkingSpaces: 73, // + Asda spaces
                openingHours: {
                    Monday: '08:00-18:00',
                    Tuesday: '08:00-18:00',
                    Wednesday: '08:00-18:00',
                    Thursday: '08:00-18:00',
                    Friday: '08:00-18:00',
                    Saturday: '08:00-18:00',
                    Sunday: 'Closed'
                },
                anchorTenants: 2, // Asda, Home Bargains
            }
        },
        {
            name: 'Central Square, Maghull',
            data: {
                city: 'Maghull',
                county: 'Merseyside',
                parkingSpaces: 235, // 75 + 160 Morrisons
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                anchorTenants: 2, // Home Bargains, Morrisons (adjacent)
            }
        },
        {
            name: 'Dukes Mill,Romsey',
            data: {
                city: 'Romsey',
                county: 'Hampshire',
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                anchorTenants: 1, // Aldi nearby
            }
        },
        {
            name: 'Eastgate- Ipswich',
            data: {
                city: 'Ipswich',
                county: 'Suffolk',
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: 'Closed'
                },
                // Note: Surface parking at Carr St (24hr access)
                // Small covered centre on Carr Street, value retailers
            }
        },
        {
            name: 'Hillsborough Barracks, Sheffield',
            data: {
                website: 'https://hillsboroughexchange.co.uk',
                city: 'Sheffield',
                county: 'South Yorkshire',
                parkingSpaces: 106, // Rooftop, Safer Parking Award
                openingHours: {
                    Monday: '09:00-17:30',
                    Tuesday: '09:00-17:30',
                    Wednesday: '09:00-17:30',
                    Thursday: '09:00-17:30',
                    Friday: '09:00-17:30',
                    Saturday: '09:00-17:30',
                    Sunday: '10:00-16:00'
                },
                // Trading name: "Hillsborough Exchange"
                // Built inside historic military barracks, tram stops outside
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

    console.log('\n💡 NOTE: Hillsborough Barracks trades as "Hillsborough Exchange" - consider renaming in database.\n');

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
