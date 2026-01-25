
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing Managed Batch A Failures...");

    const repairs = [
        // Spinning Gate
        { fuzzy: "Spinning Gate Shopping Centre", update: { name: "The Spinning Gate Shopping Centre", website: "https://spinninggate.co.uk", facebook: "https://www.facebook.com/spinninggateshoppingcentre", parkingSpaces: 314 } },

        // Queensgate - Select the Peterborough one (check postcode PE1)
        { fuzzy: "Queensgate", postcode: "PE1", update: { name: "Queensgate Shopping Centre", website: "https://queensgate-shopping.co.uk", instagram: "https://www.instagram.com/queensgate_pb", facebook: "https://www.facebook.com/Queensgate", parkingSpaces: 2200 } },

        // Grosvenor - Select the Northampton one (NN1)
        { fuzzy: "Grosvenor", postcode: "NN1", update: { name: "The Grosvenor Centre", website: "https://grosvenorshoppingnorthampton.co.uk", facebook: "https://www.facebook.com/GrosvenorShoppingNorthampton", instagram: "https://www.instagram.com/grosvenornorthampton", parkingSpaces: 800 } },

        // Chimes
        { fuzzy: "Chimes Shopping Centre", update: { name: "The Chimes", website: "https://thechimes.uk.com", parkingSpaces: 1550 } },

        // Bon Accord
        { fuzzy: "Bon Accord Aberdeen", update: { name: "Bon Accord Centre", website: "https://bonaccordcentre.com", facebook: "https://www.facebook.com/BonAccordCentre", instagram: "https://www.instagram.com/bonaccordcentre", parkingSpaces: 1400 } },

        // Darwin
        { fuzzy: "Darwin Shopping Centre", update: { name: "The Darwin Centre", website: "https://thedarwincentre.co.uk", parkingSpaces: 700 } }, // Est

        // Liberty
        { fuzzy: "The Liberty", update: { name: "The Liberty Shopping Centre", website: "https://theliberty.co.uk", facebook: "https://www.facebook.com/LibertyRomford", instagram: "https://www.instagram.com/libertyromford", parkingSpaces: 800 } },

        // Ashley
        { fuzzy: "Ashley Centre", postcode: "KT1", update: { name: "The Ashley Centre", website: "https://theashleycentre.co.uk", facebook: "https://www.facebook.com/TheAshleyCentre", instagram: "https://www.instagram.com/theashleycentre", parkingSpaces: 1300 } },

        // Harpur
        { fuzzy: "Harpur Centre", update: { name: "The Harpur Centre", website: "https://harpurcentre.co.uk", facebook: "https://www.facebook.com/TheHarpurCentre", instagram: "https://www.instagram.com/harpurcentre", parkingSpaces: 380 } }
    ];

    for (const repair of repairs) {
        let whereClause: any = { name: { contains: repair.fuzzy } };
        if (repair.postcode) whereClause.postcode = { contains: repair.postcode };

        const loc = await prisma.location.findFirst({ where: whereClause });
        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: repair.update
            });
            console.log(`✅ Repaired: ${loc.name} -> ${repair.update.name}`);
        } else {
            console.log(`⚠️ Could not find match for ${repair.fuzzy}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
