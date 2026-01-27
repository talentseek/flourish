
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Independent/Other Major Outlets...');

    const updates = [
        {
            name: 'Junction 32 Outlet Shopping Village',
            website: 'https://junction32.com/',
            owner: 'Landsec', // Acquired 2017
            management: 'Landsec',
            parking: 1400, // Free
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "10:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'London Designer Outlet',
            website: 'https://www.londondesigneroutlet.com/',
            owner: 'Quintain',
            management: 'Realm',
            parking: 3000, // Shared Wembley Park
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "11:00-18:00" }
        },
        {
            name: 'Gloucester Quays Factory Outlet',
            website: 'https://www.gloucesterquays.co.uk/',
            owner: 'Peel L&P',
            management: 'Peel L&P',
            parking: 1400,
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "10:00-20:00", "Sun": "10:00-17:00" }
        },
        {
            name: 'Dalton Park',
            website: 'https://www.dalton-park.co.uk/',
            owner: 'Global Mutual', // Acquired recently
            management: 'Realm',
            parking: 1500, // Free
            hours: { "Mon-Fri": "10:00-18:00", "Sat": "09:30-18:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Springfields Outlet', // Springfields Outlet Shopping Village
            website: 'https://springfieldsoutlet.co.uk/',
            owner: 'UBS Triton Property Fund', // Long term owner
            management: 'Asset Management',
            parking: 1000, // Estimate
            hours: { "Mon-Fri": "09:30-18:00", "Thu": "09:30-20:00", "Sat": "09:00-18:00", "Sun": "10:30-17:00" }
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
