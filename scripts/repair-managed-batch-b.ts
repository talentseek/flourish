
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing Managed Batch B Failures...");

    const repairs = [
        // The Brewery Romford
        { fuzzy: "The Brewery", city: "Romford", update: { name: "The Brewery", website: "https://thebreweryromford.co.uk", facebook: "https://www.facebook.com/TheBreweryRomford", instagram: "https://www.instagram.com/thebreweryromford", parkingSpaces: 1700 } },

        // The Gate Newcastle
        { fuzzy: "The Gate", city: "Newcastle", update: { name: "The Gate", website: "https://thegatenewcastle.co.uk", facebook: "https://www.facebook.com/TheGateNewcastle", instagram: "https://www.instagram.com/thegatenewcastle", parkingSpaces: 250 } },

        // The Orchards Dartford
        { fuzzy: "The Orchards", city: "Dartford", update: { name: "The Orchards Shopping Centre", website: "https://theorchardsdartford.co.uk", facebook: "https://www.facebook.com/orchardsdartford", instagram: "https://www.instagram.com/orchardsdartford", parkingSpaces: 250 } },

        // County Square
        { fuzzy: "County Square", update: { name: "County Square Shopping Centre", website: "https://countysquareshoppingcentre.com", facebook: "https://www.facebook.com/CountySquareShoppingCentre", instagram: "https://www.instagram.com/countysquare", parkingSpaces: 600 } }, // Likely "County Square Shopping Centre" vs just "County Square"

        // Culver Square
        { fuzzy: "Culver Square", update: { name: "Culver Square Shopping Centre", website: "https://culversquare.co.uk", facebook: "https://www.facebook.com/CulverSquare", instagram: "https://www.instagram.com/culversquare", parkingSpaces: 500 } },

        // Fairhill
        { fuzzy: "Fairhill", update: { name: "Fairhill Shopping Centre", website: "https://fairhillshopping.co.uk", facebook: "https://www.facebook.com/FairhillShoppingCentre", instagram: "https://www.instagram.com/fairhillsc", parkingSpaces: 900 } },

        // Wellgate
        { fuzzy: "Wellgate", update: { name: "Wellgate Shopping Centre", website: "https://wellgatedundee.co.uk", parkingSpaces: 600 } },

        // Ryemarket
        { fuzzy: "Ryemarket", update: { name: "The Ryemarket Shopping Centre", website: "https://ryemarketshoppingcentre.co.uk", parkingSpaces: 300 } }
    ];

    for (const repair of repairs) {
        let whereClause: any = { name: { contains: repair.fuzzy } };
        if (repair.city) whereClause.city = { contains: repair.city };

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
