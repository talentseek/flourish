
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seData = [
    // Top 5
    { name: "Bluewater", city: "Greenhithe", website: "https://bluewater.co.uk", facebook: "https://www.facebook.com/BluewaterShoppingCentre", instagram: "https://www.instagram.com/bluewatershopping", parkingSpaces: 13000, postcode: "DA9 9ST" },
    { name: "centre:mk", city: "Milton Keynes", legacyNames: ["The Centre:MK", "Milton Keynes Shopping Centre"], website: "https://centremk.com", facebook: "https://www.facebook.com/centremk", instagram: "https://www.instagram.com/centremk", parkingSpaces: 1560 }, // Using reasonable estimated/known count or keeping existing if enriched
    { name: "Festival Place", city: "Basingstoke", website: "https://festivalplace.co.uk", facebook: "https://www.facebook.com/FestivalPlace", instagram: "https://www.instagram.com/festivalplace", parkingSpaces: 2500 },
    { name: "Westquay", city: "Southampton", legacyNames: ["West Quay"], website: "https://westquay.co.uk", facebook: "https://www.facebook.com/Westquay", instagram: "https://www.instagram.com/westquay", parkingSpaces: 2489 },
    { name: "The Lexicon", city: "Bracknell", website: "https://thelexiconbracknell.com", facebook: "https://www.facebook.com/TheLexiconBracknell", instagram: "https://www.instagram.com/thelexiconbracknell", parkingSpaces: 3800 },

    // 6-10
    { name: "Royal Victoria Place", city: "Tunbridge Wells", website: "https://royalvictoriaplace.com", parkingSpaces: 1000 },
    { name: "Eden Shopping Centre", city: "High Wycombe", website: "https://edenshopping.co.uk", parkingSpaces: 1500 },
    { name: "Westgate Oxford", city: "Oxford", legacyNames: ["Westgate"], website: "https://westgateoxford.co.uk", facebook: "https://www.facebook.com/WestgateOxford", instagram: "https://www.instagram.com/westgateoxford", parkingSpaces: 1000 },
    { name: "The Oracle", city: "Reading", legacyNames: ["The Oracle Shopping Centre"], website: "https://theoracle.com", facebook: "https://www.facebook.com/TheOracleReading", instagram: "https://www.instagram.com/the_oracle_reading", parkingSpaces: 2216 },
    { name: "Gunwharf Quays", city: "Portsmouth", website: "https://gunwharf-quays.com", parkingSpaces: 1500 },

    // 11-20
    { name: "Victoria Place", city: "Woking", legacyNames: ["The Peacocks", "Peacocks Centre", "Victoria Place (The Peacocks Centre)"], website: "https://victoriaplace.co.uk", facebook: "https://www.facebook.com/VictoriaPlaceWoking", instagram: "https://www.instagram.com/victoriaplacewoking", parkingSpaces: 3000 },
    { name: "Churchill Square", city: "Brighton", website: "https://churchillsquare.com", parkingSpaces: 1600 },
    { name: "The Beacon", city: "Eastbourne", legacyNames: ["Arndale Centre", "Eastbourne Arndale"], website: "https://thebeaconeastbourne.com", parkingSpaces: 1300 },
    { name: "County Mall", city: "Crawley", website: "https://countymall.co.uk", parkingSpaces: 1700 },
    { name: "Hempstead Valley", city: "Gillingham", website: "https://hempsteadvalley.com", facebook: "https://www.facebook.com/HempsteadValley", instagram: "https://www.instagram.com/hempstead_valley", parkingSpaces: 2000 },
    { name: "Castle Quay", city: "Banbury", website: "https://castlequay.co.uk", facebook: "https://www.facebook.com/CastleQuay", instagram: "https://www.instagram.com/castlequay", parkingSpaces: 800 },
    { name: "Midsummer Place", city: "Milton Keynes", legacyNames: ["intu Milton Keynes"], website: "https://midsummerplace.co.uk", parkingSpaces: 720 },
    { name: "The Friary", city: "Guildford", website: "https://thefriaryguildford.com", parkingSpaces: 600 },
    { name: "Pentagon Shopping Centre", city: "Chatham", website: "https://pentagonshoppingcentre.co.uk", parkingSpaces: 420 },
    { name: "Cascades Shopping Centre", city: "Portsmouth", legacyNames: ["Cascades"], website: "https://cascades-shopping.co.uk", parkingSpaces: 1000 }
];

async function main() {
    console.log("🌊 Applying South East Top 20 Enrichment...");

    for (const data of seData) {
        // No inserts this time, just existing matched assets

        // Update logic with Legacy Name Support
        let searchNames = [data.name];
        if (data.legacyNames) searchNames = [...searchNames, ...data.legacyNames];

        let loc = null;
        for (const searchName of searchNames) {
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: searchName },
                    OR: [
                        { city: { contains: data.city } },
                        { address: { contains: data.city } },
                        { county: { contains: data.city } }
                    ]
                }
            });
            if (loc) break;
        }

        // Broaden search if "Shopping Centre" suffix mismatch
        if (!loc && data.name.includes("Shopping Centre")) {
            const shortName = data.name.replace(" Shopping Centre", "");
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: shortName },
                    OR: [{ city: { contains: data.city } }, { address: { contains: data.city } }]
                }
            });
        }

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    name: data.name, // Rename to current name
                    website: data.website,
                    facebook: data.facebook,
                    instagram: data.instagram,
                    parkingSpaces: data.parkingSpaces
                }
            });
            console.log(`✅ Updated: ${loc.name} -> ${data.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name} in ${data.city}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
