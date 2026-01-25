
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const remediationData = [
    // --- NORTH EAST ---
    { name: "Cleveland Centre", city: "Middlesbrough", website: "https://www.teesvalley-ca.gov.uk", parkingSpaces: 600, create: false },
    { name: "Billingham Shopping Centre", aliases: ["Billingham Town Centre"], city: "Billingham", website: "https://billinghamtowncentre.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/BillinghamTownCentre", create: false, description: "Free off-street parking available nearby." },
    { name: "Hillstreet Centre", city: "Middlesbrough", website: "https://www.hillstreetshopping.com", parkingSpaces: 0, facebook: "https://www.facebook.com/hillstreetcentre", instagram: "https://www.instagram.com/hillstreetcentre", create: false, description: "Parking via APCOA." },
    { name: "Cornmill Centre", city: "Darlington", website: "https://www.cornmillcentre.co.uk", parkingSpaces: 400, facebook: "https://www.facebook.com/CornmillCentre", instagram: "https://www.instagram.com/cornmillcentre", create: false },
    { name: "The Forum Shopping Centre", city: "Wallsend", website: "https://theforumshoppingcentre.co.uk", parkingSpaces: 160, facebook: "https://www.facebook.com/TheForumWallsend", create: false },
    { name: "Beacon Centre", city: "North Shields", website: "https://thebeaconcentre.co.uk", parkingSpaces: 420, facebook: "https://www.facebook.com/BeaconCentreNorthShields", twitter: "https://twitter.com/BeaconCentreNS", create: false },
    { name: "The Riverwalk", city: "Durham", website: "https://theriverwalk.co.uk", parkingSpaces: 0, instagram: "https://www.instagram.com/theriverwalkdurham", create: false, description: "Parking available nearby." },
    { name: "Viking Centre", city: "Jarrow", website: "https://www.southtyneside.gov.uk", parkingSpaces: 400, create: false, description: "Main shopping area in Jarrow." },

    // --- NORTH WEST ---
    { name: "Trafford Centre", city: "Trafford", website: "https://traffordcentre.co.uk", parkingSpaces: 10000, facebook: "https://www.facebook.com/traffordcentre", instagram: "https://www.instagram.com/thetraffordcentre", create: false },
    { name: "The Grange", city: "Birkenhead", website: "https://pyramidsbirkenhead.com", parkingSpaces: 495, facebook: "https://www.facebook.com/PyramidsShoppingCentre", instagram: "https://www.instagram.com/pyramidsbirkenhead", create: false },
    { name: "Spindles Town Square", city: "Oldham", website: "https://spindlestownsquare.com", parkingSpaces: 0, facebook: "https://www.facebook.com/SpindlesTownSquare", instagram: "https://www.instagram.com/spindlestownsquare", create: false, description: "Parking managed by council/ECP." },
    { name: "Mill Gate Shopping Centre", city: "Bury", website: "https://millgatebury.co.uk", parkingSpaces: 520, facebook: "https://www.facebook.com/MillGateBury", instagram: "https://www.instagram.com/millgatebury", create: false },
    { name: "The Lanes Shopping Centre", city: "Carlisle", website: "https://www.lanescarlisle.co.uk", parkingSpaces: 600, facebook: "https://www.facebook.com/thelanescarlisle", instagram: "https://www.instagram.com/thelanesshoppingcentre", create: false },
    { name: "Market Place", city: "Bolton", website: "https://www.marketplacebolton.co.uk", parkingSpaces: 500, facebook: "https://www.facebook.com/MarketPlaceBolton", instagram: "https://www.instagram.com/marketplacebolton", create: false },
    { name: "Charter Walk Shopping Centre", city: "Burnley", website: "https://charterwalk.com", parkingSpaces: 500, facebook: "https://www.facebook.com/CharterWalk", instagram: "https://www.instagram.com/charterwalkburnley", create: false },
    { name: "Fishergate Shopping Centre", city: "Preston", website: "https://www.shopfishergate.co.uk", parkingSpaces: 780, facebook: "https://www.facebook.com/FishergateCentre", instagram: "https://www.instagram.com/FishergateSC", create: false },
    { name: "Middleton Shopping Centre", city: "Middleton", website: "https://middletonshoppingcentre.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/MiddletonShoppingCentre", instagram: "https://www.instagram.com/middletonshoppingcentre", create: false },
    { name: "Merseyway Shopping Centre", city: "Stockport", website: "https://merseyway.com", parkingSpaces: 1175, facebook: "https://www.facebook.com/merseyway", instagram: "https://www.instagram.com/merseyway", create: false },

    // --- YORKSHIRE ---
    { name: "Airedale Shopping Centre", city: "Keighley", website: "https://airedaleshoppingcentre.co.uk", parkingSpaces: 425, facebook: "https://www.facebook.com/AiredaleShoppingCentre", create: false },
    { name: "Prospect Centre", city: "Hull", website: "https://www.prospectshoppingcentre.co.uk", parkingSpaces: 188, facebook: "https://www.facebook.com/Prospectcentre", create: false },
    // SPECIAL: Kirkgate is closing/demolished. Mark as Closed? Or just update what we can. 
    // Decision: Update as "Permanently Closed" in description or just enrich history. 
    // Actually better to keep record but mark status if schema supported it. For now, just add website/history.
    { name: "Kirkgate Shopping Centre", city: "Bradford", website: "https://www.kirkgate.co.uk", parkingSpaces: 650, facebook: "https://www.facebook.com/KirkgateShoppingCentre", description: "Scheduled for redevelopment/closure.", create: false },
    { name: "The Core", city: "Leeds", website: "https://thecoreleeds.co.uk", parkingSpaces: 258, create: false, description: "Under redevelopment for student accommodation." },

    // --- EAST MIDLANDS ---
    { name: "Victoria Centre", city: "Nottingham", website: "https://victoria-centre.com", parkingSpaces: 0, facebook: "https://www.facebook.com/VictoriaCentre", instagram: "https://www.instagram.com/victoriacentre", create: false },
    { name: "Swansgate Shopping Centre", city: "Wellingborough", website: "https://swansgateshoppingcentre.com", parkingSpaces: 974, facebook: "https://www.facebook.com/SwansgateShoppingCentre", instagram: "https://www.instagram.com/swansgateshoppingcentre", create: false },
    { name: "Haymarket Shopping Centre", city: "Leicester", website: "https://haymarketshoppingcentre.com", parkingSpaces: 406, facebook: "https://www.facebook.com/HaymarketShoppingCentre", instagram: "https://www.instagram.com/haymarketleicester", create: false },
    { name: "The Rushes", city: "Loughborough", website: "https://www.therushes.co.uk", parkingSpaces: 400, facebook: "https://www.facebook.com/TheRushesLoughborough", create: false },
    { name: "Vicar Lane Shopping Centre", city: "Chesterfield", website: "https://www.vicarlaneshoppingcentre.co.uk", parkingSpaces: 400, facebook: "https://www.facebook.com/VicarLaneShoppingCentre", create: false },
    { name: "Springfields Outlet", city: "Spalding", website: "https://springfieldsoutlet.co.uk", parkingSpaces: 540, facebook: "https://www.facebook.com/springfieldsoutlet", instagram: "https://www.instagram.com/springfieldsoutlet", create: false },
    { name: "The Pavements", city: "Chesterfield", website: "https://www.chesterfield.gov.uk/pavements", parkingSpaces: 450, facebook: "https://www.facebook.com/ChesterfieldBoroughCouncil", create: false },
    { name: "Idlewells Shopping Centre", city: "Sutton-in-Ashfield", website: "https://www.idlewells.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/Idlewells", create: false },
    { name: "Beaumont Shopping Centre", city: "Leicester", website: "https://beaumontshopping.co.uk", parkingSpaces: 1500, facebook: "https://www.facebook.com/BeaumontShopping", create: false },
    { name: "The Crescent", city: "Hinckley", website: "https://thecrescenthinckley.co.uk", parkingSpaces: 546, facebook: "https://www.facebook.com/TheCrescentHinckley", create: false },
    { name: "Belvoir Shopping Centre", city: "Coalville", website: "https://belvoirshoppingcentre.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/BelvoirShoppingCentre", create: false },

    // --- WEST MIDLANDS ---
    { name: "Grand Central", city: "Birmingham", website: "https://www.bullring.co.uk", parkingSpaces: 450, facebook: "https://www.facebook.com/BullringBirmingham", instagram: "https://www.instagram.com/bullring", create: false },
    { name: "Crowngate Shopping Centre", city: "Worcester", website: "https://crowngate-worcester.co.uk", parkingSpaces: 750, facebook: "https://www.facebook.com/CrowngateShoppingCentre", create: false },
    { name: "West Orchards", city: "Coventry", website: "https://westorchards.co.uk", parkingSpaces: 563, facebook: "https://www.facebook.com/WestOrchardsCoventry", create: false },
    { name: "Wulfrun Centre", city: "Wolverhampton", website: "https://thewulfrunshoppingcentre.co.uk", parkingSpaces: 570, facebook: "https://www.facebook.com/WulfrunShoppingCentre", create: false },
    { name: "Darwin Centre", city: "Shrewsbury", website: "https://www.shrewsbury-shopping.co.uk", parkingSpaces: 920, facebook: "https://www.facebook.com/ShrewsburyShopping", instagram: "https://www.instagram.com/shrewsbury_shopping", create: false },
    { name: "Ropewalk Shopping Centre", city: "Nuneaton", website: "https://www.ropewalknuneaton.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/RopewalkNuneaton", create: false },
    { name: "Three Spires Shopping Centre", city: "Lichfield", website: "https://www.threespireslichfield.com", parkingSpaces: 0, facebook: "https://www.facebook.com/ThreeSpiresShoppingCentre", instagram: "https://www.instagram.com/threespireslichfield", create: false },
    { name: "Cornbow Shopping Centre", city: "Halesowen", website: "https://cornbow.co.uk", parkingSpaces: 600, facebook: "https://www.facebook.com/CornbowShoppingCentre", instagram: "https://www.instagram.com/cornbowsc", create: false },

    // --- EAST OF ENGLAND ---
    { name: "Vancouver Quarter", city: "King's Lynn", website: "https://vancouverquarter.com", parkingSpaces: 397, facebook: "https://www.facebook.com/VancouverQuarter", instagram: "https://www.instagram.com/vancouverquarter", create: false },
    { name: "Castle Quarter", city: "Norwich", website: "https://castlequarternorwich.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/CastleQuarterNorwich", instagram: "https://www.instagram.com/castlequarternorwich", create: false },
    { name: "The Marlowes", city: "Hemel Hempstead", website: "https://themarlowes.co.uk", parkingSpaces: 1200, facebook: "https://www.facebook.com/TheMarlowes", instagram: "https://www.instagram.com/themarlowes", create: false },
    { name: "High Chelmer", city: "Chelmsford", website: "https://highchelmer.com", parkingSpaces: 1012, facebook: "https://www.facebook.com/HighChelmer", instagram: "https://www.instagram.com/high_chelmer", create: false },
    { name: "Serpentine Green", city: "Peterborough", website: "http://www.serpentine-green.com", parkingSpaces: 0, description: "Free parking 4 hours.", create: false },
    { name: "Victoria Shopping Centre", city: "Southend", website: "https://victoriasc.co.uk", parkingSpaces: 500, facebook: "https://www.facebook.com/VictoriaShoppingCentre", instagram: "https://www.instagram.com/victoriasc_southend", create: false },
    { name: "The Galleria", city: "Hatfield", website: "https://thegalleria.co.uk", parkingSpaces: 1700, facebook: "https://www.facebook.com/TheGalleriaHatfield", instagram: "https://www.instagram.com/thegalleriahatfield", create: false },
    { name: "Culver Square", city: "Colchester", website: "https://culversquare.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/CulverSquare", instagram: "https://www.instagram.com/culversquare", create: false },
    { name: "Lion Walk", city: "Colchester", website: "https://lionwalkshopping.com", parkingSpaces: 0, facebook: "https://www.facebook.com/LionWalkShopping", instagram: "https://www.instagram.com/lionwalkshopping", create: false },
    { name: "Buttermarket", city: "Ipswich", website: "https://buttermarketipswich.com", parkingSpaces: 370, facebook: "https://www.facebook.com/ButtermarketIpswich", instagram: "https://www.instagram.com/buttermarketipswich", create: false },

    // --- SOUTH EAST ---
    { name: "Royal Victoria Place", city: "Tunbridge Wells", website: "https://royalvictoriaplace.co.uk", parkingSpaces: 1220, facebook: "https://www.facebook.com/RoyalVictoriaPlace", instagram: "https://www.instagram.com/royalvictoriaplace", create: false },
    { name: "Eden Shopping Centre", city: "High Wycombe", website: "https://edenshopping.co.uk", parkingSpaces: 1600, facebook: "https://www.facebook.com/EdenShoppingCentre", instagram: "https://www.instagram.com/edenshoppingcentre", create: false },
    { name: "Gunwharf Quays", city: "Portsmouth", website: "https://gunwharf-quays.com", parkingSpaces: 1526, facebook: "https://www.facebook.com/GunwharfQuays", instagram: "https://www.instagram.com/gunwharfquays", create: false },
    { name: "Churchill Square", city: "Brighton", website: "https://churchillsquare.com", parkingSpaces: 1600, facebook: "https://www.facebook.com/ChurchillSquare", instagram: "https://www.instagram.com/churchillsquare", create: false },
    { name: "The Beacon", city: "Eastbourne", website: "https://thebeaconeastbourne.com", parkingSpaces: 1000, facebook: "https://www.facebook.com/TheBeaconEastbourne", instagram: "https://www.instagram.com/thebeaconeastbourne", create: false },
    { name: "Pentagon Shopping Centre", city: "Chatham", website: "https://pentagonshoppingcentre.co.uk", parkingSpaces: 433, facebook: "https://www.facebook.com/PentagonShoppingCentre", create: false },
    { name: "Cascades Shopping Centre", city: "Portsmouth", website: "https://cascades-shopping.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/CascadesShopping", create: false },
];

async function main() {
    console.log("🌍 GLOBAL BULK REMEDIATION (Phase 21)");

    for (const centre of remediationData) {
        console.log(`Processing ${centre.name}...`);

        let location = await prisma.location.findFirst({
            where: {
                name: { contains: centre.name, mode: "insensitive" },
                city: { contains: centre.city, mode: "insensitive" }
            }
        });

        if (!location) {
            // Wider search if specific city match fails (e.g. slight mismatch)
            location = await prisma.location.findFirst({
                where: {
                    name: { contains: centre.name, mode: "insensitive" }
                }
            });
        }

        if (location) {
            console.log(`✅ MATCH: ${location.name} -> ${centre.name}`);
            const updateData: any = {};

            // Aggressive patching of missing data
            if (!location.website && centre.website) updateData.website = centre.website;
            if ((!location.parkingSpaces || location.parkingSpaces === 0) && centre.parkingSpaces > 0) updateData.parkingSpaces = centre.parkingSpaces;
            if (!location.facebook && centre.facebook) updateData.facebook = centre.facebook;
            if (!location.instagram && centre.instagram) updateData.instagram = centre.instagram;
            if (!location.twitter && (centre as any).twitter) updateData.twitter = (centre as any).twitter;
            // Notes: Description field does not exist in schema, skipping.

            if (Object.keys(updateData).length > 0) {
                await prisma.location.update({
                    where: { id: location.id },
                    data: updateData
                });
                console.log(`   - Updated: ${Object.keys(updateData).join(", ")}`);
            } else {
                console.log("   - No updates needed (Data already present)");
            }

        } else {
            console.log(`❌ NOT FOUND: ${centre.name} - Skipping (Script focus is remediation, not creation)`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
