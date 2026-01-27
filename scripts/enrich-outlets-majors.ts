
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Landsec, Value Retail & Blackstone Outlets...');

    const updates = [
        {
            name: 'Braintree Village',
            website: 'https://braintree-village.com/',
            owner: 'Landsec',
            management: 'Landsec',
            parking: 1800, // Estimate
            hours: { "Mon-Fri": "10:00-18:00", "Sat": "09:00-19:00", "Sun": "10:00-17:00" }
        },
        {
            name: 'Gunwharf Quays',
            website: 'https://gunwharf-quays.com/',
            owner: 'Landsec',
            management: 'Landsec',
            parking: 1526, // Exact
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Bicester Village',
            website: 'https://www.thebicestercollection.com/bicester-village/',
            owner: 'Value Retail (L Catterton)',
            management: 'Value Retail',
            parking: 3000, // Estimate
            hours: { "Mon-Sat": "09:00-21:00", "Sun": "10:00-19:00" }
        },
        {
            name: 'Livingston Designer Outlet',
            website: 'https://livingston-designer-outlet.co.uk/',
            owner: 'Blackstone', // Acquired 2017
            management: 'Realm', // Often managed by Realm
            parking: 1775, // Exact
            hours: { "Mon-Wed": "09:00-18:00", "Thu": "09:00-20:00", "Fri-Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        }
    ];

    for (const u of updates) {
        const loc = await prisma.location.findFirst({ where: { name: u.name } });
        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    management: u.management,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${u.name}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
