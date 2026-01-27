
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Additional NI Sites...');

    const updates = [
        {
            name: 'Bow Street Mall',
            website: 'https://bowstreetmall.co.uk/',
            owner: 'Bow Street Mall Ltd (Private)',
            parking: 1000, // Paid
            hours: { "Mon-Tue": "09:00-18:00", "Wed-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Kennedy Centre',
            website: 'https://kennedycentre.co.uk/',
            owner: 'Hugh Kennedy and Family',
            parking: 800, // 3h free
            hours: { "Mon": "09:00-18:00", "Tue-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Victoria Square',
            website: 'https://victoriasquare.com/',
            owner: 'Commerzbank AG',
            parking: 1000, // Paid
            hours: { "Mon-Tue": "09:30-18:00", "Wed-Fri": "09:30-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'CastleCourt',
            website: 'https://castlecourt-uk.com/',
            owner: 'Wirefox',
            parking: 1550, // Paid
            hours: { "Mon-Wed": "09:00-18:00", "Thu": "09:00-21:00", "Fri-Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Flagship Centre',
            website: 'https://bangorbythesea.com/', // Redevelopment Info
            owner: 'Northhold Group',
            parking: 430, // Closed/Redevelopment
            hours: { "Mon-Sun": "Closed" } // Redevelopment
        },
        {
            name: 'Great Northern Mall',
            website: 'https://visitbelfast.com/', // General
            owner: 'Great Northern Stores Ltd (Liquidation?)',
            parking: 500, // Paid
            hours: { "Mon-Sat": "07:00-18:00" } // Car park
        }
    ];

    for (const u of updates) {
        let loc = await prisma.location.findFirst({
            where: {
                name: { contains: u.name, mode: 'insensitive' }
            }
        });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${loc.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
