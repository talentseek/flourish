
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 60 Priority Sites (Devolved Nations)...');

    const updates = [
        // --- Wales Priority (1-20) ---
        {
            name: 'Swansea Enterprise Park',
            website: 'https://www.swansea.gov.uk/enterprisezone', // General
            owner: 'Various / London & Scottish (Enterprise RP)',
            parking: 2000, // Varied
            hours: { "Mon-Sat": "08:00-20:00" }
        },
        {
            name: 'Flintshire Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Flintshire-Retail-Park-Flint',
            owner: 'Hollins Murray Group (HMG)',
            parking: 460, // Free
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Capital Retail Park', // Capital Shopping Park
            website: 'https://capitalshoppingpark.co.uk/',
            owner: 'Aberdeen Asset Management',
            parking: 1762, // 3h max (1.5h match days)
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Mostyn Champneys Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Mostyn-Champneys-Retail-Park-Llandudno',
            owner: 'British Land',
            parking: 1000, // 3h free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Morfa Shopping Park',
            website: 'https://ashbycapital.com/', // Owner
            owner: 'Realty Income Corporation',
            parking: 1000,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Parc Tawe Retail Park',
            website: 'https://parctawe.com/',
            owner: 'Centurion Tawe Ltd',
            parking: 800, // 2h free (extendable)
            hours: { "Mon-Sun": "06:00-22:00" }
        },
        {
            name: 'Cardiff Bay Retail Park',
            website: 'https://almcor.com/', // Manager
            owner: 'ALMCOR / Orchard Street',
            parking: 960, // 3h max
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Fforestfach Retail Park', // Parc Fforestfach
            website: 'https://fforestfachretailparc.co.uk/',
            owner: 'LCP Group / M Core',
            parking: 1300, // 3h free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Parc Pemberton', // Parc Pemberton Retail Park
            website: 'https://parcpemberton.co.uk/',
            owner: 'Colliers International', // Agent/Mgmt
            parking: 650, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Llandudno Retail Park', // Parc Llandudno
            website: 'https://llandudnoshoppingpark.co.uk/',
            owner: 'Postal Pension? / Managed',
            parking: 500, // 2h free
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'The Red Dragon Centre',
            website: 'https://thereddragoncentre.co.uk/',
            owner: 'Cardiff Council',
            parking: 900, // 6h free w/ purchase
            hours: { "Mon-Sun": "08:00-00:00" }
        },
        {
            name: 'East Gate Leisure Park',
            website: 'https://eastgatellanelli.co.uk/',
            owner: 'Henry Davidson Developments',
            parking: 240, // Paid
            hours: { "Mon-Sun": "08:00-00:00" } // Leisure
        },
        {
            name: 'Island Green', // Island Green Shopping Park
            website: 'https://islandgreen.co.uk/',
            owner: 'Focus Estate Fund',
            management: 'Estama',
            parking: 518, // 5h max (Paid)
            hours: { "Mon-Fri": "07:00-20:00", "Sat": "08:00-20:00", "Sun": "08:00-17:00" }
        },
        {
            name: 'Plas Coch Retail Park',
            website: 'https://completelyretail.co.uk/',
            owner: 'Realty Income Corporation',
            parking: 600, // 3h free
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Baglan Bay Retail Park',
            website: 'https://fletchermorgan.co.uk/', // Agent
            owner: 'St Modwen / Welsh Govt (Land)',
            parking: 500,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'City Link Retail Park',
            website: 'https://completelyretail.co.uk/scheme/City-Link-Retail-Park-Cardiff',
            owner: 'Starburst',
            parking: 489, // Free
            hours: { "Mon-Sun": "08:00-22:00" }
        },
        {
            name: 'Bridgend Retail Park', // McArthurGlen Bridgend
            website: 'https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-bridgend/',
            owner: 'McArthurGlen',
            parking: 2000,
            hours: { "Mon-Sat": "10:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: '28 East Retail Park',
            website: 'https://newportretailpark.com/',
            owner: 'Savills Investment Management',
            parking: 828, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Cross Hands Retail Park', // Maes Yr Eithin
            website: 'https://mountainwarehouse.com/', // Tenants
            owner: 'Cross Hands Commericals Ltd',
            parking: 400, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Merthyr Tydfil Leisure Village',
            website: 'https://haloleisure.org.uk/',
            owner: 'Merthyr Tydfil Council / Halo Leisure',
            parking: 500, // Free
            hours: { "Mon-Fri": "06:15-21:00", "Sat-Sun": "08:15-16:00" }
        },

        // --- Scotland Priority (1-20) ---
        {
            name: 'Inverness Shopping Park',
            website: 'https://invernessshoppingpark.co.uk/',
            owner: 'British Land (Hercules Unit Trust)',
            parking: 1000, // Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        },
        {
            name: "St. Catherine's Retail Park",
            website: 'https://completelyretail.co.uk/scheme/St-Catherines-Retail-Park-Perth',
            owner: 'Moorgarth Group',
            management: 'Savills',
            parking: 549, // 3h max
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "09:00-19:00" }
        },
        {
            name: 'Birkenshaw Retail Park',
            website: 'https://xprop.co.uk/',
            owner: 'Propco / XPROP',
            parking: 500,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Fife Leisure Park',
            website: 'https://www.fifeleisurepark.co.uk/',
            owner: 'Grosvenor (Developer)',
            parking: 1500, // Free
            hours: { "Mon-Sun": "09:00-00:00" }
        },
        {
            name: 'Heathfield Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Heathfield-Retail-Park-Ayr',
            owner: 'MCAP Global Finance',
            parking: 696,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "09:00-18:00" }
        },
        {
            name: 'Riverway Retail Park',
            website: 'https://completelyretail.co.uk/',
            owner: 'M&G Real Estate',
            parking: 630, // Time limited
            hours: { "Mon-Sat": "08:00-21:00", "Sun": "08:00-20:00" }
        },
        {
            name: 'Craigleith Retail Park',
            website: 'https://craigleithretailpark.com/', // Tenant info
            owner: 'Nuveen Real Estate',
            parking: 500, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Great Western Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Great-Western-Retail-Park-Glasgow',
            owner: 'US Institutional Buyer',
            parking: 975,
            hours: { "Mon-Sun": "08:00-22:00" }
        },
        {
            name: 'Fountain Leisure Park', // Fountain Park
            website: 'https://fountainpark.co.uk/',
            owner: 'Landsec',
            parking: 600, // 4h free w/ validation
            hours: { "Mon-Sun": "06:00-22:00" }
        },
        {
            name: 'Queens Drive Retail Park',
            website: 'https://completelyretail.co.uk/',
            owner: 'Green & Partners / Custodian Capital',
            parking: 1000,
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-17:00" }
        },
        {
            name: 'Kingsgate Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Kingsgate-Shopping-Park-East-Kilbride',
            owner: 'Orion Capital Managers',
            parking: 1000, // 4h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Springfield Quay Leisure Park', // The Quay
            website: 'https://thequayglasgow.com/',
            owner: 'DTZ Investors',
            parking: 800, // Free (4h limit midnight-6am)
            hours: { "Mon-Sun": "08:00-00:00" }
        },
        {
            name: 'Palace Grounds Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Palace-Grounds-Retail-Park-Hamilton',
            owner: 'Hamilton Trustees',
            parking: 500,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "09:00-19:00" }
        },
        {
            name: 'Telford Retail Park',
            website: 'https://coatesandco.net/', // Agent
            owner: 'Coates & Co (Letting)',
            parking: 300,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Berryden Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Berryden-Retail-Park-Aberdeen',
            owner: 'Realty Income Corporation',
            parking: 720, // 3h max
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-18:00" }
        },
        {
            name: 'Abbotsinch Retail Park',
            website: 'https://abbotsinchshoppingpark.com/',
            owner: 'Realty Income Corporation',
            parking: 1098, // 3h max
            hours: { "Mon-Fri": "09:00-22:00", "Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Hamilton Retail Park', // Hamilton Palace Towers
            website: 'https://completelyretail.co.uk/',
            owner: 'Hamilton Trustees',
            parking: 400,
            hours: { "Mon-Sun": "00:00-00:00" } // 24h access
        },
        {
            name: 'Inshes Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Inshes-Retail-Park-Inverness',
            owner: 'AIA Capital Club / Time Equities',
            parking: 617,
            hours: { "Mon-Sat": "08:00-21:00", "Sun": "09:00-19:00" }
        },
        {
            name: 'Hermiston Gait Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Hermiston-Gait-Retail-Park-Edinburgh',
            owner: 'BauMont Real Estate Capital',
            parking: 600, // 3.5h max
            hours: { "Mon-Fri": "08:00-20:00", "Sat": "08:00-20:00", "Sun": "09:00-19:00" }
        },
        {
            name: 'Cumbernauld Westfield', // Cumbernauld Retail Park
            website: 'https://completelyretail.co.uk/',
            owner: 'L&S Broadwood',
            parking: 573,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "09:00-19:00" }
        },

        // --- Northern Ireland Priority (1-10+) ---
        {
            name: 'Sprucefield Shopping Centre',
            website: 'https://sprucefieldcentre.co.uk/',
            owner: 'Realty Income Corporation',
            parking: 1000, // Free
            hours: { "Mon-Fri": "08:00-22:00", "Sat": "08:00-21:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Abbey Centre',
            website: 'https://www.lesleyabbeycentre.co.uk/',
            owner: 'The Herbert Group',
            parking: 1200, // 4h free, £2 long stay
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Bloomfield Shopping Centre',
            website: 'https://www.lesleybloomfield.com/',
            owner: 'Mussenden Properties (Herbert)',
            parking: 1466, // 4h free
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Forestside Shopping Centre',
            website: 'https://forestside.co.uk/',
            owner: 'Mussenden Properties (Herbert)',
            parking: 1000, // 4h free
            hours: { "Mon-Wed": "09:00-21:00", "Thu-Fri": "09:00-22:00", "Sat": "09:00-19:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'The Boulevard', // The Outlet Banbridge
            website: 'https://the-boulevard.co.uk/',
            owner: 'Tristan Capital / Lotus Property',
            management: 'McConnell Property',
            parking: 1300, // Free
            hours: { "Mon-Wed": "10:00-18:00", "Thu-Fri": "10:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Junction One Antrim', // The Junction
            website: 'https://thejunctionantrim.com/',
            owner: 'Lotus Property / Tristan Capital',
            management: 'McConnell Property',
            parking: 1700, // Free
            hours: { "Mon-Wed": "10:00-18:00", "Thu-Fri": "10:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Rushmere Shopping Centre',
            website: 'https://www.rushmereshopping.com/',
            owner: 'Killahoey Ltd',
            parking: 1800, // Free
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Connswater Shopping Centre', // & Retail Park
            website: 'https://killultagh.com/',
            owner: 'Killultagh Estates',
            parking: 1000,
            hours: { "Mon-Fri": "09:00-21:00", "Sat": "09:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Boucher Road Retail Park', // Boucher Retail Park
            website: 'https://completelyretail.co.uk/scheme/Boucher-Retail-Park-Belfast',
            owner: 'Frasers Group',
            parking: 800,
            hours: { "Mon-Fri": "08:00-21:00", "Sat": "08:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Oaks Shopping Centre',
            website: 'https://oaksshoppingcentre.co.uk/',
            owner: 'Private',
            parking: 360, // Free
            hours: { "Mon-Sat": "09:00-17:30", "Wed-Sat": "09:00-21:00", "Sun": "13:00-18:00" }
        },
        // Adding extra NI to reach 20 if possible, or close to
        {
            name: 'Shane Retail Park',
            website: 'https://shaneretailpark.com/',
            owner: 'Harhill Group?', // Verify
            parking: 700, // 3h max
            hours: { "Mon-Fri": "08:00-21:00", "Sat": "08:00-18:00", "Sun": "13:00-18:00" }
        },
        {
            name: 'Park Centre',
            website: 'https://theparkcentre.co.uk/',
            owner: 'LCP Group',
            parking: 500, // Free
            hours: { "Mon-Sat": "09:00-18:00" }
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
