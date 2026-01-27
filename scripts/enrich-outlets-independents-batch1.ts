
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Affinity & Independent Outlets (Batch 1)...');

    const updates = [
        {
            name: 'Affinity Devon',
            website: 'https://www.affinitydevon.com/',
            owner: 'Promontoria Sterling (Affinity)', // Global Mutual manages Affinity/Promontoria portfolio
            management: 'Global Mutual',
            parking: 800,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Affinity Lancashire',
            website: 'https://affinitylancashire.com/',
            owner: 'Promontoria Sterling (Affinity)',
            management: 'Global Mutual',
            parking: 700,
            hours: { "Mon-Sat": "10:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Affinity Staffordshire',
            website: 'https://affinitystaffordshire.com/',
            owner: 'Promontoria Sterling (Affinity)',
            management: 'Global Mutual',
            parking: 600,
            hours: { "Mon-Sat": "10:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Clacton Shopping Village',
            website: 'https://www.clactonshoppingvillage.com/',
            owner: 'ROM Capital (Clacton) Limited', // Acquired 2008
            management: 'Centre Management',
            parking: 500, // 4 hours free
            hours: { "Mon-Sat": "10:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Hornsea Village (Hornsea Freeport)',
            website: 'https://hornseavillage.com/',
            owner: 'Private Investor', // Formerly Freeport
            management: 'Centre Management',
            parking: 500, // Free
            hours: { "Mon-Fri": "10:00-17:30", "Sat": "09:30-17:00", "Sun": "11:00-17:00" }
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
