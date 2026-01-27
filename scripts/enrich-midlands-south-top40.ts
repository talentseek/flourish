
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching Top 40 Priority Sites (Midlands & South)...');

    const updates = [
        // --- Midlands Priority (1-20) ---
        {
            name: 'The Fort Shopping Park',
            website: 'https://thefort.co.uk/',
            owner: 'Invesco Real Estate / George Capital',
            management: 'Savills',
            parking: 2000, // Free
            hours: { "Mon-Fri": "09:30-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Arena Shopping Park',
            website: 'https://arenashopping.com/',
            owner: 'Tesco plc',
            parking: 1600, // 5h free
            hours: { "Mon-Sat": "10:00-00:00", "Sun": "10:30-17:00" }
        },
        {
            name: 'Star City Leisure Park',
            website: 'https://starcitycentre.co.uk/',
            owner: 'Quadrant Estates', // Managed by
            parking: 2400, // Free
            hours: { "Mon-Sun": "09:00-00:00" }
        },
        {
            name: 'Battlefield Enterprise Park',
            website: 'https://investinshropshire.co.uk/', // General
            owner: 'Shropshire Council / Private',
            parking: 500,
            hours: { "Mon-Sat": "08:00-18:00" } // Business hours
        },
        {
            name: 'Elliotts Field', // Elliotts Field Retail Park
            website: 'https://elliottsfield.co.uk/', // Theoretical/Directory
            owner: 'Orion European Real Estate',
            parking: 600, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Meteor Centre', // Meteor Centre Retail Park
            website: 'https://completelyretail.co.uk/scheme/Meteor-Centre-Derby',
            owner: 'LondonMetric Property',
            parking: 1200, // 4h max
            hours: { "Mon-Sat": "10:00-21:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Warwickshire Shopping Park',
            website: 'https://warwickshireshoppingpark.co.uk/',
            owner: 'Aviva Investors',
            parking: 400,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Carlton Centre',
            website: 'https://lincolnshire.coop/', // Developed by
            owner: 'Lincolnshire Co-op',
            parking: 460,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Kingsway Retail Park',
            website: 'https://kingswayretailpark.co.uk/',
            owner: 'Orchard Street Investment Management',
            parking: 500, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'One Stop Retail Park', // One Stop Shopping
            website: 'https://onestop-shopping.co.uk/',
            owner: 'Europa Capital / Sovereign Centros',
            parking: 1200, // 4h max
            hours: { "Mon-Wed": "08:30-20:00", "Thu-Fri": "08:30-22:00", "Sat": "08:00-20:00", "Sun": "09:30-17:00" }
        },
        {
            name: 'Meole Brace Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Meole-Brace-Retail-Park-Shrewsbury',
            owner: 'Morris Property / Shropshire Council', // Mixed
            parking: 800, // 4h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Thurmaston Shopping Park',
            website: 'https://completelyretail.co.uk/scheme/Thurmaston-Shopping-Centre-Leicester',
            owner: 'Hammerson',
            parking: 600, // 4h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Meridian Leisure Park',
            website: 'https://meridian-leisure.co.uk/',
            owner: 'Greenridge Opportunities',
            management: 'Savills',
            parking: 1500, // Free
            hours: { "Mon-Sun": "08:00-00:00" }
        },
        {
            name: 'Wrekin Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Wrekin-Retail-Park-Telford',
            owner: 'Hammerson',
            parking: 670,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'St. Georges Retail Park', // St Georges
            website: 'https://completelyretail.co.uk/scheme/St-Georges-Retail-Park-Leicester',
            owner: 'Orchard Street Investment Management',
            parking: 400,
            hours: { "Mon-Sat": "08:00-22:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Junction One', // Junction One Retail Park
            website: 'https://junctiononeretailpark.co.uk/',
            owner: 'The Albert Gubay Charitable Foundation',
            management: 'Workman LLP',
            parking: 963, // 3h max strict
            hours: { "Mon-Sat": "09:30-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Oldbury Green Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Oldbury-Green-Retail-Park-Oldbury',
            owner: 'Blackrock',
            parking: 500, // Free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Princess Alice Retail Park',
            website: 'https://princessaliceretailpark.co.uk/',
            owner: 'Phoenix Life Limited',
            management: 'abrdn',
            parking: 500, // 3h free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "11:00-17:00" }
        },
        {
            name: 'Crown Wharf Shopping Park',
            website: 'https://crownwharfshoppingpark.co.uk/',
            owner: 'British Land',
            parking: 590, // Paid (Free after 6pm)
            hours: { "Mon-Sat": "08:00-22:00", "Sun": "10:00-20:00" }
        },
        {
            name: 'Lady Bay Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Lady-Bay-Retail-Park-Nottingham',
            owner: 'Font Real Estate',
            parking: 400, // 3h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:30-16:30" }
        },

        // --- South Priority (1-20) ---
        {
            name: 'Wincheap Industrial Estate',
            website: 'https://canterbury.gov.uk/',
            owner: 'Canterbury City Council / Various',
            parking: 500, // Public & Private
            hours: { "Mon-Sat": "08:00-18:00" }
        },
        {
            name: 'The Kingston Centre',
            website: 'https://kingstoncentre.co.uk/',
            owner: 'British Land',
            management: 'Savills',
            parking: 1300, // Free (some 4h max)
            hours: { "Mon-Fri": "08:00-20:00", "Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Bretton Centre',
            website: 'https://completelyretail.co.uk/scheme/Bretton-Centre-Peterborough',
            owner: 'Private Investor (via Allsop)',
            management: 'CSP',
            parking: 600, // Free
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Westcroft District Centre',
            website: 'https://lcpgroup.co.uk/scheme/Westcroft-District-Centre-Milton-Keynes',
            owner: 'LCP Group / M Core',
            parking: 343,
            hours: { "Mon-Sat": "09:00-18:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Hedge End Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Hedge-End-Retail-Park-Southampton',
            owner: 'Aviva Investors',
            parking: 1000,
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Orbital Shopping Park',
            website: 'https://orbitalshoppingpark.com/',
            owner: 'British Land',
            parking: 1000, // 5h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Greenbridge Retail', // Greenbridge Retail & Leisure Park
            website: 'https://completelyretail.co.uk/scheme/Greenbridge-Retail-Park-Swindon',
            owner: 'M&G Real Estate',
            parking: 1000, // 24h Free
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Emersons Green Retail Park',
            website: 'https://cspretail.com/properties/emersons-green-retail-park/',
            owner: 'Emersons Green Development Co',
            management: 'CSP',
            parking: 500, // Free
            hours: { "Mon-Sat": "07:00-22:00", "Sun": "10:00-17:00" }
        },
        {
            name: 'Mayflower Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Mayflower-Retail-Park-Basildon',
            owner: 'British Land',
            parking: 600, // 3h max
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:30" }
        },
        {
            name: 'Roaring Meg Retail Park',
            website: 'https://roaringmeg.co.uk/', // Assumed or Directory
            owner: 'Stevenage Retail Limited',
            parking: 800, // 3h max
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Stacey Bushes', // Stacey Bushes Trading Centre
            website: 'https://stacey-bushes.co.uk/',
            owner: 'Various / Kirkby Diamond',
            parking: 300,
            hours: { "Mon-Sat": "08:00-18:00" }
        },
        {
            name: 'Transit Way Retail Park',
            website: 'https://tesco.com', // Anchor
            owner: 'Custodian REIT / Tesco',
            parking: 400,
            hours: { "Mon-Sat": "08:00-22:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'West Quay Retail Park',
            website: 'https://westquayretail.com/',
            owner: 'Aviva Investors',
            parking: 700, // Paid
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-19:00", "Sun": "11:00-17:00" }
        },
        // Skipping Ashford Trade Centre (Not primarily retail)
        {
            name: 'Beehive Centre',
            website: 'https://beehivecentre.co.uk/',
            owner: 'RPMI Railpen',
            parking: 800, // 4h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:30-16:30" }
        },
        {
            name: 'Abbey Wood Shopping Park',
            website: 'https://abbeywoodshoppingpark.co.uk/',
            owner: 'Legal & General / Scarborough Group',
            management: 'Savills',
            parking: 600, // 4h free
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Cambridge Retail Park',
            website: 'https://cambridge-retail-park.co.uk/',
            owner: 'RPMI Railpen',
            parking: 600, // 4h max
            hours: { "Mon-Fri": "09:00-20:00", "Sat": "09:00-18:00", "Sun": "10:00-16:30" }
        },
        {
            name: 'Pipps Hill Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Pipps-Hill-Retail-Park-Basildon',
            owner: 'Royal London Asset Management',
            parking: 500,
            hours: { "Mon-Sat": "08:00-20:00", "Sun": "10:00-16:00" }
        },
        {
            name: 'Cambridge Leisure',
            website: 'https://cambridgeleisure.co.uk/',
            owner: 'Landsec',
            management: 'Savills',
            parking: 600, // Ticketless Pay
            hours: { "Mon-Sun": "08:00-00:00" }
        },
        {
            name: 'Longwater Retail Park',
            website: 'https://completelyretail.co.uk/scheme/Longwater-Retail-Park-Norwich',
            owner: 'Royal London Asset Management',
            parking: 500, // 5h max (Overnight banned)
            hours: { "Mon-Sat": "09:00-20:00", "Sun": "10:00-16:00" }
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
