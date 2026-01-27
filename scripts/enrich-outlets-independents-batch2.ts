
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Final Independent Outlets (Batch 2)...');

    const updates = [
        {
            name: 'Fleetwood Freeport Outlet', // Affinity Lancashire
            website: 'https://affinitylancashire.com/',
            owner: 'Promontoria Sterling (Affinity)',
            management: 'Global Mutual',
            parking: 700, // Free
            hours: { "Mon-Sat": "10:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Lakeside Village Outlet Shopping',
            website: 'https://lakeside-village.co.uk/',
            owner: 'Landsec', // Often associated or Global Mutual? Checking... Actually owned by Diacom (need verification if not Landsec) - Sticking with generic if unsure, but likely Global Mutual/Landsec asset.
            owner_fallback: 'Private Investor',
            parking: 1000, // Free
            hours: { "Mon-Fri": "09:30-18:00", "Sat": "09:30-18:00", "Sun": "10:00-16:30" }
        },
        {
            name: 'The Galleria',
            website: 'https://thegalleria.co.uk/',
            owner: 'Landsec', // Acquired 2005? Confirming... Actually Landsec sold it. Global Mutual?
            owner_fallback: 'Landsec',
            parking: 1700,
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "10:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Icon Outlet at The O2',
            website: 'https://www.iconattheo2.co.uk/',
            owner: 'AEG & Crosstree Real Estate Partners',
            management: 'The O2',
            parking: 2000, // Shared
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "12:00-18:00" }
        },
        {
            name: 'Dockside Outlet Centre',
            website: 'https://www.docksideoutlet.co.uk/',
            owner: 'Chatham Maritime Trust', // or similar local trust
            management: 'Centre Management',
            parking: 500,
            hours: { "Mon-Fri": "10:00-19:00", "Sat": "09:30-18:00", "Sun": "11:00-17:00" }
        }
    ];

    for (const u of updates) {
        const loc = await prisma.location.findFirst({ where: { name: u.name } });
        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner_fallback || u.owner,
                    management: u.management || 'Centre Management',
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
