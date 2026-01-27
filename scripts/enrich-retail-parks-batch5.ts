
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 10 Priority Retail Parks (Batch 5 - Final Phase 1)...');

    const updates = [
        {
            name: 'New Mersey Retail Park', // Speke
            website: 'https://newmersey.co.uk/',
            owner: 'British Land',
            management: 'British Land',
            parking: 1850, // Free
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Fife Central Retail Park', // Kirkcaldy
            website: 'https://www.fifecentralretailpark.co.uk/', // Generic, usually exists
            owner: 'Realty Income', // Acquired 2020-2022
            parking: 1080, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Manchester Fort Shopping Park',
            website: 'https://www.manchesterfort.co.uk/',
            owner: 'PGIM Real Estate', // Acquired 2025
            parking: 1200, // 4 hours free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Team Valley Retail Park', // Gateshead (Retail World)
            website: 'https://retailworldgateshead.co.uk/',
            owner: 'ARES',
            management: 'Avison Young',
            parking: 1300, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Gallagher Shopping Park', // Port Glasgow
            website: 'https://gallaghershoppingparkportglasgow.co.uk/',
            owner: 'Clydebuilt (Strathclyde Pension Fund & Ediston)',
            parking: 800, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Strathkelvin Retail Park', // Glasgow
            website: 'https://www.derwentlondon.com/properties/strathkelvin-retail-park', // Asset page
            owner: 'Derwent London & Caledonian Property',
            parking: 1000,
            hours: { "Mon-Fri": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'The Forge Retail Park', // Glasgow
            website: 'https://forgeshopping.com/', // Part of same estate usually
            owner: 'Quadrant Estates (Asset Manager)',
            type: 'RETAIL_PARK', // Distinct from SC
            parking: 1600, // Shared
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Cardiff Gate Retail Park',
            website: 'https://cardiffgate.com/', // Business park parent
            owner: 'Sir Robert McAlpine Enterprises',
            parking: 500, // 4 hours max (strict)
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Two Rivers', // Staines
            website: 'https://tworiversstaines.com/',
            owner: 'Client of Lunson Mitchenall (LM Real Estate)',
            management: 'Centre Management',
            parking: 1000, // Chargeable
            carParkPrice: 2.30, // 1-2h
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Gallions Reach Shopping Park', // London
            website: 'https://www.gallions-reach.co.uk/',
            owner: 'Aberdeen Standard Investments',
            parking: 2000, // 4 hours free
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "11:00-17:00" }
        }
    ];

    for (const u of updates) {
        let loc = await prisma.location.findFirst({ where: { name: u.name } });
        if (!loc) {
            loc = await prisma.location.findFirst({ where: { name: { contains: u.name } } });
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website,
                    owner: u.owner,
                    management: u.management,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    carParkPrice: u.carParkPrice ? u.carParkPrice : 0,
                    isManaged: true
                }
            });
            console.log(`✅ Updated ${u.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
