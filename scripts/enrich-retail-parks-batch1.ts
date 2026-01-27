
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 10 Priority Retail Parks (Batch 1)...');

    const updates = [
        {
            name: 'Middlebrook Retail Park', // Also 'Middlebrook Retail & Leisure Park'
            website: 'https://middlebrook.co.uk/',
            owner: 'Orbit Developments (The Emerson Group)',
            management: 'Emerson Management Services',
            parking: 3000, // Free (6h max Mon-Fri 7am-6pm)
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Aintree Shopping Park',
            website: 'https://aintreeshoppingpark.co.uk/', // Or Crown Estate page
            owner: 'The Crown Estate',
            management: 'Savills', // Savills manages Crown Estate regional
            parking: 1100, // Free (Unlimited)
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Deepdale Retail Park', // Also 'Deepdale Shopping Park'
            website: 'https://www.deepdaleshoppingpark.co.uk/', // Often barely active, but valid domain existing or aggregator
            website_fallback: 'https://visitpreston.com/article/3475/Deepdale-Shopping-Park',
            owner: 'Melford Capital', // Acquired 2023/24
            parking: 1000, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'MK1 Shopping & Leisure',
            website: 'https://www.mk1shoppingpark.co.uk/',
            owner: 'The Crown Estate',
            parking: 900, // 4 hours free
            hours: { "Mon-Sat": "09:00-23:30", "Sun": "09:00-22:30" } // Leisure hours included
        },
        {
            name: 'Teesside Park', // Also 'Teesside Retail Park'
            website: 'https://www.teessideshopping.co.uk/',
            owner: 'British Land',
            management: 'British Land',
            parking: 4000, // 4h max in South, Unlimited in North
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'St Georges Retail Park',
            website: 'https://marshallcdp.com/project/st-georges-retail-park-leeds/', // Developer page acting as info
            owner: 'Institutional Investor', // Kept generic if undisclosed
            parking: 275,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Peel Centre', // Stockport Retail Park
            website: 'https://stockportretailpark.co.uk/',
            owner: 'The Peel Group',
            management: 'Peel L&P',
            parking: 1074, // Charges apply day, Free >5pm
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Gilston Park',
            website: 'https://gilstonparkestate.com/',
            owner: 'Hansteen & Cala Homes',
            status: 'Development', // Note: This might not be a functional retail park yet
            parking: 0,
            notes: 'Mixed use development site, possibly not active retail park yet'
        },
        {
            name: 'Banbury Gateway', // Banbury Gateway Shopping Park
            website: 'https://www.banburygateway.co.uk/', // Redirects often to Crown Estate
            owner: 'The Crown Estate',
            parking: 500, // 4 hours free
            hours: { "Mon-Thu": "09:00-20:00", "Fri-Sat": "09:00-20:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Junction 32', // Also enriched as Outlet. Ensuring consistency.
            website: 'https://junction32.com/',
            owner: 'Frasers Group',
            management: 'Frasers Group',
            parking: 1400, // Free
            hours: { "Mon-Fri": "10:00-19:00", "Sat": "10:00-18:00", "Sun": "11:00-17:00" }
        }
    ];

    for (const u of updates) {
        // Try finding by exact name first, then fuzzy
        let loc = await prisma.location.findFirst({ where: { name: u.name, type: 'RETAIL_PARK' } });
        if (!loc) {
            loc = await prisma.location.findFirst({ where: { name: { contains: u.name }, type: 'RETAIL_PARK' } });
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: u.website || u.website_fallback,
                    owner: u.owner,
                    management: u.management,
                    parkingSpaces: u.parking,
                    openingHours: u.hours,
                    isManaged: true,
                    // If it was missing these, it was likely a ghost record
                }
            });
            console.log(`✅ Updated ${u.name}`);
        } else {
            console.log(`⚠️ Skipped ${u.name} (Not found in DB)`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
