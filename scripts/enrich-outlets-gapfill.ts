
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Gap Fill Outlets (Batch 3)...');

    const updates = [
        {
            name: 'Caledonia Park (Gretna Gateway Outlet Village)',
            website: 'https://caledoniapark.com/',
            owner: 'Railpen', // Acquired 2020
            management: 'Railpen',
            parking: 1000,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Clarks Village',
            website: 'https://clarksvillage.co.uk/',
            owner: 'Landsec',
            management: 'Landsec',
            parking: 1400,
            hours: { "Mon-Fri": "09:00-18:00", "Thu": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-17:00" }
        },
        {
            name: 'Peak Shopping Village',
            website: 'https://peakvillage.co.uk/',
            owner: 'Devonshire Group', // Chatsworth Estate
            management: 'Devonshire Group',
            parking: 400, // Free
            hours: { "Mon-Sat": "09:30-17:30", "Sun": "10:00-17:00" }
        },
        {
            name: 'Quayside MediaCityUK',
            website: 'https://www.mediacityuk.co.uk/quayside/',
            owner: 'Peel L&P', // MediaCity owner
            management: 'Peel L&P',
            parking: 1000,
            hours: { "Mon-Fri": "10:00-20:00", "Sat": "10:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Sterling Mills',
            website: 'https://www.sterlingmills.com/',
            owner: 'Aflac / Global Mutual', // Checked ownership - verified as Global Mutual asset usually
            owner_fallback: 'Private Investor',
            parking: 500, // Free
            hours: { "Mon-Wed": "10:00-17:30", "Thu": "10:00-19:00", "Fri-Sun": "10:00-18:00" }
        },
        {
            name: 'The Mill Batley',
            website: 'http://www.themillbatley.com/',
            owner: 'Modus Properties', // Acquired 2013
            management: 'Realm',
            parking: 550, // Free
            hours: { "Mon-Sat": "09:30-17:30", "Sun": "10:00-16:00" }
        },
        {
            name: 'Trentham Shopping Village',
            website: 'https://trentham.co.uk/',
            owner: 'Blackstone', // Acquired via St Modwen
            management: 'Trentham Estate',
            parking: 1000,
            hours: { "Mon-Sun": "10:00-17:00" }
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
