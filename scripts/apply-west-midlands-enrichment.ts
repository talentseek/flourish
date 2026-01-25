
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const wmData = [
    // Top 5
    { name: "Bullring", city: "Birmingham", website: "https://bullring.co.uk", facebook: "https://www.facebook.com/bullring", instagram: "https://www.instagram.com/bullring", parkingSpaces: 3100 },
    { name: "Merry Hill", city: "Brierley Hill", legacyNames: ["Intu Merry Hill", "intu Merry Hill"], website: "https://mymerryhill.co.uk", facebook: "https://www.facebook.com/MerryHill", instagram: "https://www.instagram.com/merryhill", parkingSpaces: 10000, postcode: "DY5 1QX" },
    { name: "Telford Centre", city: "Telford", website: "https://telfordcentre.com", facebook: "https://www.facebook.com/TelfordCentre", instagram: "https://www.instagram.com/telfordcentre", parkingSpaces: 4000 },
    { name: "Kingfisher Shopping Centre", city: "Redditch", website: "https://kingfishershopping.co.uk", facebook: "https://www.facebook.com/KingfisherShopping", instagram: "https://www.instagram.com/kingfisherredditch", parkingSpaces: 2400 },
    { name: "Touchwood", city: "Solihull", website: "https://touchwoodsolihull.co.uk", facebook: "https://www.facebook.com/touchwoodsolihull", instagram: "https://www.instagram.com/touchwoodsolihull", parkingSpaces: 1700 },

    // 6-10
    { name: "Mander Centre", city: "Wolverhampton", website: "https://mandercentre.co.uk", facebook: "https://www.facebook.com/ManderCentre", instagram: "https://www.instagram.com/mandercentre", parkingSpaces: 530 },
    { name: "The Potteries Centre", city: "Staffordshire", legacyNames: ["Intu Potteries", "intu Potteries"], website: "https://potteriescentre.co.uk", facebook: "https://www.facebook.com/PotteriesCentre", instagram: "https://www.instagram.com/potteriescentre", parkingSpaces: 900 },
    { name: "Gracechurch Centre", city: "Sutton Coldfield", website: "https://gracechurchcentre.com", facebook: "https://www.facebook.com/GracechurchCentre", parkingSpaces: 950 },
    { name: "Grand Central", create: true, city: "Birmingham", website: "https://grandcentralbirmingham.com", facebook: "https://www.facebook.com/GrandCentralBham", instagram: "https://www.instagram.com/grandcentralbham", parkingSpaces: 0, postcode: "B2 4XJ" }, // Integrated with New St Station/Bullring
    { name: "New Square", city: "West Bromwich", website: "https://newsquarewestbromwich.co.uk", facebook: "https://www.facebook.com/NewSquareWestBromwich", parkingSpaces: 1900 },

    // 11-20
    { name: "Old Market", city: "Hereford", website: "https://oldmarkethereford.co.uk", facebook: "https://www.facebook.com/OldMarketHereford", parkingSpaces: 606 },
    { name: "Crowngate Shopping Centre", city: "Worcester", website: "https://crowngate-worcester.co.uk", parkingSpaces: 750 },
    { name: "Lower Precinct Shopping Centre", city: "Coventry", website: "https://lowerprecinct.com", parkingSpaces: 524 },
    { name: "West Orchards Shopping Centre", city: "Coventry", website: "https://westorchards.co.uk", parkingSpaces: 600 },
    { name: "Wulfrun Shopping Centre", city: "Wolverhampton", website: "https://wulfrunshopping.co.uk", parkingSpaces: 570 },
    { name: "The Darwin Centre", city: "Shrewsbury", website: "https://shrewsburyshopping.co.uk", parkingSpaces: 900 },
    { name: "Ankerside Shopping Centre", city: "Tamworth", website: "https://ankerside.co.uk", parkingSpaces: 700 },
    { name: "Ropewalk Shopping Centre", create: true, city: "Nuneaton", website: "https://nuneatonandbedworth.gov.uk/ropewalk", parkingSpaces: 463, postcode: "CV11 5TZ" },
    { name: "Three Spires Shopping Centre", city: "Lichfield", website: "https://threespireslichfield.com", parkingSpaces: 600 },
    { name: "Cornbow Shopping Centre", city: "Halesowen", website: "https://cornbow.co.uk", parkingSpaces: 600 }
];

async function main() {
    console.log("🐂 Applying West Midlands Top 20 Enrichment...");

    for (const data of wmData) {
        if (data.create) {
            // Check existence first
            let exists = await prisma.location.findFirst({
                where: {
                    name: data.name,
                    OR: [
                        { city: data.city },
                        { address: { contains: data.city } }
                    ]
                }
            });

            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "West Midlands",
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "West Midlands"}`,
                        county: "West Midlands",
                        postcode: data.postcode || "UNKNOWN",
                        latitude: 0.0,
                        longitude: 0.0
                    }
                });
                console.log(`✨ Created: ${data.name} (${data.city})`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name} (${data.city})`);
            }
            continue;
        }

        // Update logic with Legacy Name Support
        let searchNames = [data.name];
        if (data.legacyNames) searchNames = [...searchNames, ...data.legacyNames];

        // Find match using any of the names
        let loc = null;
        for (const searchName of searchNames) {
            // Clean specific suffixes for fuzzy match if strict fails - trying strict first for legacy
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: searchName },
                    OR: [{ city: { contains: data.city } }, { address: { contains: data.city } }, { county: { contains: data.city } }] // Broaden city check by county for 'Staffordshire' vs 'Stoke'
                }
            });
            if (loc) break;
        }

        // Fallback: If still not found, try removing "Shopping Centre"
        if (!loc) {
            const shortName = data.name.replace(" Shopping Centre", "");
            loc = await prisma.location.findFirst({
                where: {
                    name: { contains: shortName },
                    OR: [{ city: { contains: data.city } }, { address: { contains: data.city } }, { county: { contains: data.city } }]
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
