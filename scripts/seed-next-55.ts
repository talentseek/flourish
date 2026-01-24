
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const targets = [
    { name: "The Friary Guildford", city: "Guildford", postcode: "GU1 4YT" }, // Canonical Name
    { name: "Castle Quay Shopping Centre", city: "Banbury", postcode: "OX16 2UW" },
    { name: "Southside Shopping Centre", city: "London", postcode: "SW18 4TF" },
    { name: "Fosse Park", city: "Leicester", postcode: "LE19 1HY" } // Hybrid - accepting as Market Data
];

async function main() {
    console.log("Seeding 'Next 55' Missing Locations...");

    for (const t of targets) {
        const existing = await prisma.location.findFirst({
            where: {
                OR: [
                    { postcode: t.postcode },
                    { name: { contains: t.name, mode: 'insensitive' } }
                ]
            }
        });

        if (existing) {
            console.log(`[EXISTS] ${t.name} (ID: ${existing.id})`);
        } else {
            console.log(`[MISSING] ${t.name} -> Creating...`);
            await prisma.location.create({
                data: {
                    name: t.name,
                    city: t.city,
                    postcode: t.postcode,
                    address: "Seeded Market Data (Next 55)",
                    isManaged: false,
                    county: t.city, // Placeholder
                    type: "SHOPPING_CENTRE",
                    latitude: 0.0,
                    longitude: 0.0
                }
            });
            console.log(`   -> Created ${t.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
