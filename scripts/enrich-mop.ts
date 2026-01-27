
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPDATES = [
    // Batch 1 (Previous)
    { name: "Riverside Shopping Centre", city: "Evesham", url: "http://www.riversideshopping.co.uk/" },
    { name: "Carters Square", city: "Uttoxeter", url: "https://www.lcpgroup.co.uk/property/28760/Carters-Square/" },
    { name: "Cardigan Fields", city: "Leeds", url: "https://cardiganfields.co.uk/" },
    { name: "Clifton Moor Centre", city: "York", url: "https://clifton-moor.co.uk/" },
    { name: "Crystal Peaks", city: "Sheffield", url: "https://www.crystalpeakscentre.com/" },
    { name: "Cumbernauld Centre", city: "Cumbernauld", url: "https://www.thecentrecumbernauld.com/" },
    { name: "East Park Retail", city: "Newport", url: "https://www.newport-retailpark.co.uk/" },
    { name: "Ellesmere Centre", city: "Walkden", url: "https://walkdentowncentre.co.uk/" },
    { name: "Exchange Shopping Centre", city: "Rochdale", url: "https://rochdaleexchange.co.uk/" },

    // Batch 2 (New)
    { name: "Sauchiehall Centre", city: "Glasgow", url: "https://sauchiehallcentre.co.uk/" }, // Likely exists
    { name: "Stamford Quarter", city: "Altrincham", url: "https://stamfordquarter.com/" }, // Known site
    { name: "St Catherine's Walk", city: "Carmarthen", url: "https://stcatherineswalk.com/" },
    { name: "St Davids Square", city: "Swansea", url: "https://stdavidsswansea.co.uk/" }, // Potential match
    { name: "St Johns Shopping Centre", city: "Liverpool", url: "https://stjohns-shopping.co.uk/" },
    { name: "St Johns Centre", city: "Leeds", url: "https://stjohnsleeds.co.uk/" },
    { name: "St Marks Shopping", city: "Lincoln", url: "https://stmarks-shopping.co.uk/" },
    { name: "St Stephens", city: "Hull", url: "https://ststephens-hull.com/" },
    { name: "St Nicholas Arcades", city: "Lancaster", url: "https://stnicholasarcades.co.uk/" },
    { name: "Swadlincote Shopping Centre", city: "Swadlincote", url: "https://www.swadlincote-centre.co.uk/" }, // Check actual URL
    { name: "The Broadway", city: "Bradford", url: "https://broadwaybradford.com/" },
    { name: "The Light", city: "Leeds", url: "https://thelightleeds.co.uk/" },
    { name: "The Malls", city: "Basingstoke", url: "https://themalls.co.uk/" },
    { name: "The Rock", city: "Bury", url: "https://therockbury.com/" },
    { name: "The Square", city: "Camberley", url: "https://thesquarecamberley.co.uk/" },
    { name: "Union Square", city: "Aberdeen", url: "https://www.unionsquareaberdeen.com/" },
    { name: "Victoria Gate", city: "Leeds", url: "https://www.victorialeeds.co.uk/" }, // Victoria Leeds covers Quarter & Gate
    { name: "Victoria Quarter", city: "Leeds", url: "https://www.victorialeeds.co.uk/" },
    { name: "Xscape", city: "Milton Keynes", url: "https://xscapemiltonkeynes.co.uk/" },
    { name: "Willow Place", city: "Corby", url: "https://willowplace.co.uk/" }
];

async function main() {
    console.log(`🚀 Starting Mop-Up Enrichment Round 2 (${UPDATES.length} targets)...`);

    for (const u of UPDATES) {
        // Try precise match first
        let locs = await prisma.location.findMany({
            where: {
                name: { contains: u.name, mode: 'insensitive' },
                city: { contains: u.city, mode: 'insensitive' }
            }
        });

        // Fallback: If city name differs slighty (e.g. "Glasgow City" vs "Glasgow")
        if (locs.length === 0) {
            locs = await prisma.location.findMany({
                where: {
                    name: { contains: u.name, mode: 'insensitive' }
                }
            });
            // Only use fallback if it's a unique name or if we can verify region
            if (locs.length > 1) {
                // Filter by a broader region check if possible, or just skip to be safe
                // Manually mapping "Glasgow City" -> "Glasgow"
                locs = locs.filter(l => l.city.includes(u.city) || u.city.includes(l.city));
            }
        }

        if (locs.length > 0) {
            const loc = locs[0];
            if (!loc.website) {
                console.log(`✅ Updating: ${loc.name} (${loc.city}) -> ${u.url}`);
                await prisma.location.update({
                    where: { id: loc.id },
                    data: { website: u.url }
                });
            } else {
                console.log(`ℹ️ Skipped (Already has URL): ${loc.name}`);
            }
        } else {
            console.log(`❌ Could not match in DB: ${u.name} (${u.city})`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
