
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 20 North West Priority Sites...');

    const updates = [
        // Batch 1 (Research 1-10)
        {
            name: 'Middlebrook Retail',
            website: 'https://middlebrook.co.uk/',
            owner: 'Orbit Developments',
            management: 'Emerson Management Services',
            parking: 3000, // 6h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'The Rock',
            website: 'https://completelyretail.co.uk/scheme/The-Rock-Retail-Park-Birkenhead',
            owner: 'CBRE Global Investors',
            parking: 440, // 2.5h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Elk Mill',
            website: 'https://completelyretail.co.uk/scheme/Elk-Mill-Shopping-Park-Oldham',
            owner: 'British Land',
            management: 'Savills',
            parking: 2000, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:30-17:00" }
        },
        {
            name: 'Robin Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Robin-Retail-Park-Wigan',
            owner: 'Frasers Group',
            parking: 800, // 3h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Liverpool Shopping Park',
            website: 'https://liverpoolshoppingpark.co.uk/',
            owner: 'The Albert Gubay Charitable Foundation',
            management: 'Derwent Estates',
            parking: 1500, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Barons Quay',
            website: 'https://baronsquay.co.uk/',
            owner: 'Cheshire West & Chester Council',
            management: 'Rivington Land',
            parking: 900, // 4h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Parsonage Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Parsonage-Retail-Park-Leigh',
            owner: 'Brookhouse Group',
            parking: 1000,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Junction Nine',
            website: 'https://junctionnineretailpark.co.uk/',
            owner: 'The Derwent Group',
            management: 'Smart Parking',
            parking: 963, // 4h max (Strict)
            hours: { "Mon-Sat": "09:30-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Coliseum',
            website: 'https://www.cheshireoaksshopping.co.uk/', // Linked
            owner: 'The Crown Estate',
            parking: 1300,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Lime Square',
            website: 'https://lcpgroup.co.uk/scheme/Lime-Square-Manchester',
            owner: 'LCP Group',
            parking: 600, // 3h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        // Batch 2 (Research 11-20)
        {
            name: 'White City Retail Park',
            website: 'https://whitecityretailpark.co.uk/',
            owner: 'The Albert Gubay Charitable Foundation',
            management: 'Workman LLP',
            parking: 658, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Gateway 49',
            website: 'https://networkspace.co.uk/',
            owner: 'Network Space',
            management: 'NSM',
            parking: 200, // Trade Park
            hours: { "Mon-Fri": "08:00-18:00" } // Trade hours
        },
        {
            name: 'Ocean Plaza',
            website: 'https://oceanplazaleisure.com/',
            owner: 'M Core / LCP Group',
            parking: 1200, // 3h free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Aintree Racecourse',
            website: 'https://completelyretail.co.uk/scheme/Aintree-Racecourse-Retail-Park-Liverpool',
            owner: 'Orbit Developments',
            parking: 500,
            hours: { "Mon-Sat": "07:00-23:00", "Sun": "09:00-23:00" }
        },
        {
            name: 'Snipe Retail Park',
            website: 'https://sniperetailpark.co.uk/',
            owner: 'CBRE Investment Management',
            parking: 500, // 3h max
            hours: { "Mon-Fri": "09:30-20:00", "Sat": "09:30-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Marine Point',
            website: 'https://marinepoint.co.uk/',
            owner: 'David Samuel Properties',
            parking: 750, // Free
            hours: { "Mon-Sun": "09:00-22:00" }
        },
        {
            name: 'Lyme Green',
            website: 'https://completelyretail.co.uk/scheme/Lyme-Green-Retail-Park-Macclesfield',
            owner: 'Orbit Developments',
            parking: 400,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Trafford Retail Park', // Often confused with Centre/Piphe
            website: 'https://traffordcentre.co.uk/',
            owner: 'Peel L&P', // Part of Trafford City
            parking: 1000,
            hours: { "Mon-Fri": "10:00-22:00", "Sat": "10:00-21:00", "Sun": "12:00-18:00" }
        },
        {
            name: 'Cables Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Cables-Retail-Park-Prescot',
            owner: 'Brookhouse Group',
            parking: 800, // 3h max
            hours: { "Mon-Sat": "06:00-23:58", "Sun": "10:00-16:00" }
        },
        {
            name: 'Speke Retail Park', // Usually New Mersey
            website: 'https://newmersey.co.uk/',
            owner: 'British Land',
            parking: 2000,
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
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
                    management: u.management,
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
