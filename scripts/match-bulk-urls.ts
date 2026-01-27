
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGETS = [
    { name: "Rutherglen Exchange", url: "https://www.rutherglenexchange.com/" },
    { name: "Springburn", url: "https://www.springburnshopping.com/" },
    { name: "Avenue", url: "https://www.avenueshopping.co.uk/" },
    { name: "Rivergate", url: "https://rivergatecentre.com/" },
    { name: "Sanderson Arcade", url: "https://www.sandersonarcade.co.uk/" },
    { name: "Park View", url: "https://parkviewshoppingcentre.co.uk/" },
    { name: "Newcastle Quays", url: "https://www.newcastlequays.com/" }, // Might be Royal Quays
    { name: "The Bridges", url: "https://www.thebridges-shopping.com/" },
    { name: "Trinity Square", url: "https://trinitysquaregateshead.co.uk/" },
    { name: "St Cuthberts", url: "https://www.stcuthbertswalk.co.uk/" },
    { name: "Newgate", url: "https://newgatecentre.co.uk/" },
    { name: "Queen Street", url: "https://www.queenstreetshoppingcentre.co.uk/" },
    { name: "Promenades", url: "https://www.promenadesshoppingcentre.co.uk/" },
    { name: "Flemingate", url: "https://flemingate.co.uk/" },
    { name: "North Point", url: "https://www.northpointshoppingcentre.co.uk/" },
    { name: "Parishes", url: "https://theparishes.com/" },
    { name: "Britten", url: "https://brittencentre.co.uk/" },
    { name: "White River", url: "https://whiteriverplace.co.uk/" },
    { name: "Saxon Square", url: "https://www.saxon-square.co.uk/" },
    { name: "The Guild", url: "https://www.theguildwiltshire.co.uk/" }
];

async function main() {
    console.log("🔍 Matching URLs to Database Locations...\n");
    const matches = [];
    const missing = [];

    for (const t of TARGETS) {
        // Try exact name match or contains
        const locs = await prisma.location.findMany({
            where: {
                name: { contains: t.name, mode: 'insensitive' }
            }
        });

        if (locs.length === 1) {
            matches.push({ ...t, id: locs[0].id, dbName: locs[0].name });
        } else if (locs.length > 1) {
            // Ambiguous
            matches.push({ ...t, id: locs[0].id, dbName: locs[0].name, note: `Ambiguous (${locs.length} matches), picked first` });
        } else {
            // Try searching without common suffixes
            missing.push(t);
        }
    }

    console.table(matches);

    if (missing.length > 0) {
        console.log("\n⚠️ Could not match:");
        console.table(missing);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
