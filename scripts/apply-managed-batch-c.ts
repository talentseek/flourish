
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const enrichmentData = [
    // Batch C Highlights (Search 1)
    { name: "The Forum Shopping Centre", city: "Wallsend", website: "https://theforumshoppingcentre.co.uk", facebook: "https://www.facebook.com/TheForumWallsend", parkingSpaces: 160 },
    { name: "The Orchards", city: "Dartford", website: "https://theorchardsdartford.co.uk", facebook: "https://www.facebook.com/orchardsdartford", instagram: "https://www.instagram.com/orchardsdartford", parkingSpaces: 250 },
    { name: "The Piazza", city: "Huddersfield", website: "https://piazzacentre.co.uk", facebook: "https://www.facebook.com/PiazzaCentre", instagram: "https://www.instagram.com/piazzahuddersfield", parkingSpaces: 0 }, // Part of town
    { name: "Wharfside Shopping Centre", website: "https://wharfsidepz.co.uk", facebook: "https://www.facebook.com/WharfsidePZ", instagram: "https://www.instagram.com/wharfsidepz", parkingSpaces: 0 }, // Uses council parking

    // Batch C Highlights (Search 2 - Mini Batch)
    { name: "Stretford Mall", website: "https://stretfordtowncentre.co.uk", parkingSpaces: 500 },
    { name: "Bowen Square", city: "Daventry", website: "https://mcore.co.uk", parkingSpaces: 110 }, // M Core site
    { name: "Clydebank Shopping Centre", website: "https://clyde-shoppingcentre.co.uk", facebook: "https://www.facebook.com/ClydebankShoppingCentre", instagram: "https://www.instagram.com/clydeshoppingcentre", parkingSpaces: 0 }, // "Free parking" unspecified count
    { name: "Angel Central", nameUpdate: "Angel Central", website: "https://angelcentral.co.uk", facebook: "https://www.facebook.com/AngelCentralIslington", instagram: "https://www.instagram.com/angel_central", parkingSpaces: 100 }, // Was N1 Centre

    // Batch C Highlights (Search 3 - Middle Batch)
    { name: "Great Northern", city: "Manchester", website: "https://thegreatnorthern.com", facebook: "https://www.facebook.com/greatnorthernwarehouse", instagram: "https://www.instagram.com/greatnorthernmcr", parkingSpaces: 1200 },
    { name: "The Exchange", city: "Ilford", website: "https://exchangeilford.co.uk", facebook: "https://www.facebook.com/exchangeilford", instagram: "https://www.instagram.com/exchangeilford", parkingSpaces: 1000 },
    { name: "Islington Square", website: "https://islingtonsquare.com", facebook: "https://www.facebook.com/islingtonsquare", instagram: "https://www.instagram.com/islingtonsquare", parkingSpaces: 0 },
    { name: "Cardigan Fields", website: "https://cardiganfields.co.uk", facebook: "https://www.facebook.com/cardiganfields", instagram: "https://www.instagram.com/cardiganfields", parkingSpaces: 0 }, // Leisure - Free parking
    { name: "Riverside", city: "Norwich", website: "https://riversidenorwich.co.uk", facebook: "https://www.facebook.com/riversidenorwich", instagram: "https://www.instagram.com/riversidenorwich", parkingSpaces: 364 },
    { name: "The Pavilions", city: "Uxbridge", website: "https://thepavilionsuxbridge.com", facebook: "https://www.facebook.com/thepavilionsuxbridge", instagram: "https://www.instagram.com/thepavilionsuxbridge", parkingSpaces: 1000 },
    { name: "The Priory", city: "Dartford", website: "https://theprioryshoppingcentre.co.uk", facebook: "https://www.facebook.com/ThePrioryDartford", instagram: "https://www.instagram.com/thepriorydartford", parkingSpaces: 0 },
    { name: "Salford Shopping City", website: "https://salfordshoppingcentre.com", parkingSpaces: 0 },
    { name: "Spindles Town Square", website: "https://spindlestownsquare.com", parkingSpaces: 1000 },
    { name: "The Concourse", city: "Skelmersdale", website: "https://concourse-shopping.co.uk", facebook: "https://www.facebook.com/ConcourseShoppingCentre", parkingSpaces: 764 },
    { name: "Four Seasons Shopping Centre", website: "https://fourseasonsmansfield.co.uk", facebook: "https://www.facebook.com/FourSeasonsMansfield", instagram: "https://www.instagram.com/fourseasonsmansfield", parkingSpaces: 550 },
    { name: "Abbey Centre", city: "Belfast", website: "https://lesleyabbeycentre.co.uk", facebook: "https://www.facebook.com/LesleyAbbeycentre", instagram: "https://www.instagram.com/lesleyabbeycentre", parkingSpaces: 0 }, // Free
    { name: "Arndale Centre", city: "Morecambe", website: "https://arndale-morecambe.co.uk", facebook: "https://www.facebook.com/arndale.morecambe", parkingSpaces: 400 },
    { name: "Fishergate Shopping Centre", website: "https://shopfishergate.co.uk", facebook: "https://www.facebook.com/FishergateShoppingCentre", instagram: "https://www.instagram.com/fishergatesc", parkingSpaces: 0 },
    { name: "Eastgate Centre", city: "Inverness", website: "https://eastgateshopping.co.uk", facebook: "https://www.facebook.com/EastgateShoppingCentre", instagram: "https://www.instagram.com/eastgateshopping", parkingSpaces: 1350 },
    { name: "Wulfrun Centre", website: "https://thewulfrunshoppingcentre.co.uk", parkingSpaces: 570 },
    { name: "Clifton Down Shopping Centre", website: "https://cliftondown.co.uk", facebook: "https://www.facebook.com/cliftondownsc", instagram: "https://www.instagram.com/cliftondownsc", parkingSpaces: 360 },
    { name: "County Square Shopping Centre", website: "https://countysquareashford.co.uk", facebook: "https://www.facebook.com/CountySquareAshford", instagram: "https://www.instagram.com/countysquareashford", parkingSpaces: 800 }, // Combined
    { name: "Culver Square Shopping Centre", website: "https://culversquare.co.uk", facebook: "https://www.facebook.com/Culversquarecolchester", instagram: "https://www.instagram.com/culversquare", parkingSpaces: 0 }, // Uses town parking

    // Batch C Highlights (Search 4 - Final)
    { name: "Kingsgate Shopping Centre", city: "Dunfermline", website: "https://kingsgateshoppingcentre.com", parkingSpaces: 0 }, // APCOA
    { name: "Kingsgate Shopping Centre", city: "Huddersfield", website: "https://kingsgateshoppingcentre.co.uk", parkingSpaces: 650 },
    { name: "Oakmall Shopping Centre", website: "https://oakmall.co.uk", parkingSpaces: 90 },
    { name: "Regent Shopping Centre", city: "Hamilton", website: "https://regentshoppingcentre.com", parkingSpaces: 750 },
    { name: "Quedam Shopping Centre", website: "https://quedamshopping.co.uk", parkingSpaces: 650 }
];

async function main() {
    console.log(`Applying Deep Enrichment for ${enrichmentData.length} Managed Assets (Batch C)...`);

    for (const data of enrichmentData) {
        let whereClause: any = { name: { contains: data.name } };
        if (data.city) whereClause.city = { contains: data.city };

        // Handle rename specially (N1 -> Angel)
        if (data.nameUpdate) {
            const oldRec = await prisma.location.findFirst({ where: whereClause });
            if (oldRec) {
                await prisma.location.update({
                    where: { id: oldRec.id },
                    data: {
                        name: data.nameUpdate,
                        website: data.website,
                        instagram: data.instagram,
                        facebook: data.facebook,
                        parkingSpaces: data.parkingSpaces
                    }
                });
                console.log(`✅ Renamed & Enriched ${oldRec.name} -> ${data.nameUpdate}`);
                continue;
            }
        }

        const records = await prisma.location.findMany({ where: whereClause });
        if (records.length === 0) {
            console.log(`❌ Not Found: ${data.name}`);
            continue;
        }

        for (const loc of records) {
            let updateData: any = {};
            if (data.website) updateData.website = data.website;
            if (data.instagram) updateData.instagram = data.instagram;
            if (data.facebook) updateData.facebook = data.facebook;
            if (data.parkingSpaces !== undefined) updateData.parkingSpaces = data.parkingSpaces;

            await prisma.location.update({
                where: { id: loc.id },
                data: updateData
            });
            console.log(`✅ Enriched ${loc.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
