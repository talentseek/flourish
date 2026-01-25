
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const neData = [
    // Top 5
    { name: "Metrocentre", city: "Gateshead", website: "https://themetrocentre.co.uk", facebook: "https://www.facebook.com/Metrocentre", instagram: "https://www.instagram.com/metrocentre", parkingSpaces: 10000 },
    { name: "Eldon Square", city: "Newcastle", website: "https://eldonsquare.co.uk", facebook: "https://www.facebook.com/EldonSquareNewcastle", instagram: "https://www.instagram.com/eldonsqnewcastle", parkingSpaces: 1000 },
    { name: "The Bridges", city: "Sunderland", website: "https://thebridges-shopping.com", facebook: "https://www.facebook.com/TheBridgesShoppingCentre", instagram: "https://www.instagram.com/thebridgesshop", parkingSpaces: 900 },
    { name: "The Galleries", city: "Washington", website: "https://gallerieswashington.co.uk", facebook: "https://www.facebook.com/GalleriesWashington", instagram: "https://www.instagram.com/gallerieswashington", parkingSpaces: 2500 },
    { name: "Middleton Grange", city: "Hartlepool", website: "https://middleton-grange.co.uk", facebook: "https://www.facebook.com/MiddletonGrange", instagram: "https://www.instagram.com/middletongrange", parkingSpaces: 1000 },

    // 6-10
    { name: "Manor Walks", city: "Cramlington", website: "https://manorwalks.co.uk", facebook: "https://www.facebook.com/ManorWalks", instagram: "https://www.instagram.com/manorwalks", parkingSpaces: 1500 },
    { name: "Cleveland Centre", create: true, city: "Middlesbrough", website: "https://clevelandcentre.co.uk", facebook: "https://www.facebook.com/ClevelandCentreMiddlesbrough", instagram: "https://www.instagram.com/clevelandcentre", parkingSpaces: 600, postcode: "TS1 2LS" },
    { name: "Billingham Town Centre", nameUpdate: "Billingham Shopping Centre", website: "https://billinghamshopping.co.uk", parkingSpaces: 0 }, // Open air, managed
    { name: "Wellington Square", city: "Stockton-on-Tees", website: "https://wellington-square.co.uk", facebook: "https://www.facebook.com/WellingtonSquareStockton", instagram: "https://www.instagram.com/wellingtonsquare", parkingSpaces: 800 },
    { name: "Captain Cook Square", city: "Middlesbrough", website: "https://captaincooksquare.co.uk", facebook: "https://www.facebook.com/CaptainCookSquare", parkingSpaces: 400 },

    // 11-15
    { name: "Hillstreet Shopping Centre", nameUpdate: "Hillstreet Centre", website: "https://hillstreetshopping.co.uk", parkingSpaces: 650 },
    { name: "Cornmill Centre", city: "Darlington", website: "https://cornmillcentre.co.uk", parkingSpaces: 400 },
    { name: "The Parkway Centre", city: "Coulby Newham", website: "https://parkwayshopping.co.uk", parkingSpaces: 1000 },
    { name: "The Forum Shopping Centre", city: "Wallsend", website: "https://forumwallsend.co.uk", parkingSpaces: 200 },
    { name: "Beacon Shopping Centre", nameUpdate: "Beacon Centre", website: "https://beaconcentre.co.uk", parkingSpaces: 400 },

    // 16-20
    { name: "The Riverwalk", city: "Durham", website: "https://theriverwalk.co.uk", parkingSpaces: 300 },
    { name: "The Viking Centre", city: "Jarrow", website: "https://jarrowvikingcentre.co.uk", parkingSpaces: 400 },
    { name: "Prince Bishops Place", city: "Durham", website: "https://princebishops.co.uk", facebook: "https://www.facebook.com/princebishopsplace", parkingSpaces: 400 },
    { name: "The Gate", city: "Newcastle", website: "https://thegatenewcastle.co.uk", facebook: "https://www.facebook.com/TheGateNewcastle", instagram: "https://www.instagram.com/thegatenewcastle", parkingSpaces: 250 },
    { name: "Byron Place", city: "Seaham", website: "https://byronplace.co.uk", facebook: "https://www.facebook.com/ByronPlaceShoppingCentre", parkingSpaces: 358 }
];

async function main() {
    console.log("🏰 Applying North East Top 20 Enrichment...");

    for (const data of neData) {
        if (data.create) {
            // Check existence first
            const exists = await prisma.location.findFirst({ where: { name: data.name, postcode: data.postcode } }); // Stricter check
            if (!exists) {
                await prisma.location.create({
                    data: {
                        name: data.name,
                        city: data.city || "Middlesbrough", // Default to city if avail
                        website: data.website || null,
                        facebook: data.facebook || null,
                        instagram: data.instagram || null,
                        parkingSpaces: data.parkingSpaces,
                        type: "SHOPPING_CENTRE",
                        address: `${data.name}, ${data.city || "North East"}`,
                        county: "North East", // Flexible
                        postcode: data.postcode || "UNKNOWN",
                        latitude: 0.0,
                        longitude: 0.0
                    }
                });
                console.log(`✨ Created: ${data.name}`);
            } else {
                console.log(`⚠️ Exists (Skipping Create): ${data.name}`);
            }
            continue;
        }

        // Update logic
        let whereClause: any = { name: { contains: data.name } };
        // Improve safety: if multiple similar names exist (like Billingham), rely on fuzzy match first but verify

        const loc = await prisma.location.findFirst({ where: whereClause });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    name: data.nameUpdate || undefined,
                    website: data.website,
                    facebook: data.facebook,
                    instagram: data.instagram,
                    parkingSpaces: data.parkingSpaces
                }
            });
            console.log(`✅ Updated: ${loc.name} -> ${data.nameUpdate || data.name}`);
        } else {
            console.log(`❌ Not Found (Update): ${data.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
