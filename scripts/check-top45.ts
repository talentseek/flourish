
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    "Westfield London", "Metrocentre", "Trafford Centre", "Westfield Stratford", "Bluewater",
    "Bullring", "Lakeside", "St James Quarter", "Merry Hill", "Liverpool One",
    "centre:MK", "Watford", "Meadowhall", "Arndale", "St. David's",
    "Eldon Square", "Derbion", "East Kilbride", "Cabot Circus", "Braehead",
    "Kingfisher", "Festival Place", "Silverburn", "Highcross", "Telford Centre",
    "Cribbs", "Westquay", "Royal Victoria Place", "Trinity Leeds", "The Lexicon",
    "The Centre", "Victoria Centre", "Brent Cross", "Luton", "White Rose",
    "Cwmbran", "Eden", "St. Enoch", "Victoria Square", "Queensgate",
    "Westgate Oxford", "Merrion Centre", "Whitgift", "Frenchgate", "The Oracle"
];

async function main() {
    console.log("Checking for Top 45 Shopping Centres...");

    for (const t of targets) {
        const found = await prisma.location.findFirst({
            where: { name: { contains: t } },
            select: { id: true, name: true, isManaged: true, city: true }
        });

        if (found) {
            console.log(`[FOUND] ${t} -> ${found.name} (${found.city}) [Managed: ${found.isManaged}]`);
        } else {
            console.log(`[MISSING] ${t}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
