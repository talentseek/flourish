
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const remediationData = [
    // --- SOUTH WEST ---
    { id: "cmid0l3ob01xbmtpuas19mww5", name: "The Mall at Cribbs Causeway", city: "Patchway", aliases: ["Cribbs Causeway"], website: "https://mallcribbs.com", parkingSpaces: 7000, facebook: "https://www.facebook.com/mallcribbs", instagram: "https://www.instagram.com/mallcribbs", twitter: "https://twitter.com/mallcribbs", create: false },
    { name: "Cabot Circus", city: "Bristol", website: "https://www.cabotcircus.com", parkingSpaces: 2500, facebook: "https://www.facebook.com/cabotcircus", instagram: "https://www.instagram.com/cabotcircus", create: false },
    { name: "Drake Circus", city: "Plymouth", website: "https://www.drakecircus.com", parkingSpaces: 1270, facebook: "https://www.facebook.com/DrakeCircus", instagram: "https://www.instagram.com/drakecircusplym", twitter: "https://twitter.com/DrakeCircus", create: false },
    { name: "Princesshay", city: "Exeter", website: "https://princesshay.co.uk", parkingSpaces: 280, facebook: "https://www.facebook.com/princesshayshopping", instagram: "https://www.instagram.com/princesshayexeter", twitter: "https://twitter.com/princesshay", create: false },
    { name: "Gloucester Quays", city: "Gloucester", website: "https://gloucesterquays.co.uk", parkingSpaces: 1400, facebook: "https://www.facebook.com/GloucesterQuays", instagram: "https://www.instagram.com/gloucesterquays", twitter: "https://twitter.com/GloucesterQuays", create: false },
    { id: "cmid0jo1h00fxmtpumde0mgjp", name: "McArthurGlen Swindon Designer Outlet", city: "Swindon", website: "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-swindon", parkingSpaces: 728, facebook: "https://www.facebook.com/SwindonDesignerOutlet", instagram: "https://www.instagram.com/swindondesigneroutlet", create: false },
    { name: "Clarks Village", city: "Street", website: "https://clarksvillage.co.uk", parkingSpaces: 1400, facebook: "https://www.facebook.com/ClarksVillage", instagram: "https://www.instagram.com/clarksvillageuk", twitter: "https://twitter.com/ClarksVillageUK", create: false },
    { name: "The Galleries", city: "Bristol", website: "https://galleriesbristol.co.uk", parkingSpaces: 1000, facebook: "https://www.facebook.com/galleriesbristol", instagram: "https://www.instagram.com/galleriesbristol", create: false },
    { name: "The Dolphin", city: "Poole", website: "https://www.dolphinshoppingcentre.co.uk", parkingSpaces: 1400, facebook: "https://www.facebook.com/DolphinShoppingCentre", instagram: "https://www.instagram.com/dolphinshoppingcentre", create: false },
    { name: "Guildhall Shopping Centre", city: "Exeter", website: "https://guildhallshoppingexeter.co.uk", parkingSpaces: 438, facebook: "https://www.facebook.com/GuildhallShoppingExeter", instagram: "https://www.instagram.com/guildhallshopping", twitter: "https://twitter.com/GuildhallExeter", create: false },
    { name: "Green Lanes Shopping Centre", city: "Devon", website: "https://greenlanes.co.uk", parkingSpaces: 400, facebook: "https://www.facebook.com/GreenLanesBarnstaple", instagram: "https://www.instagram.com/greenlanesbarnstaple", create: false }, // City in DB is often County for some imports
    { name: "Emery Gate Shopping Centre", city: "Chippenham", website: "https://emerygate.co.uk", parkingSpaces: 342, facebook: "https://www.facebook.com/EmeryGateShoppingCentre", instagram: "https://www.instagram.com/emerygateshoppingcentre", twitter: "https://twitter.com/EmeryGateShop", create: false },
    { name: "Cross Keys Shopping Centre", city: "Wiltshire", website: "https://crosskeyssalisbury.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/CrossKeysSalisbury", instagram: "https://www.instagram.com/crosskeyssalisbury", create: false, description: "No on-site parking. Nearby public car parks apply." },
    { name: "SouthGate", city: "Bath", website: "https://southgatebath.com", parkingSpaces: 876, facebook: "https://www.facebook.com/SouthGateBath", instagram: "https://www.instagram.com/southgate_bath", create: false },
    { name: "The Sovereign", city: "Weston-super-Mare", website: "https://sovereign-centre.co.uk", parkingSpaces: 850, facebook: "https://www.facebook.com/SovereignCentre", instagram: "https://www.instagram.com/sovereigncentre", create: false },
    { name: "Angel Place Shopping Centre", city: "Somerset", website: "https://angel-place.co.uk", parkingSpaces: 380, facebook: "https://www.facebook.com/AngelPlaceShoppingCentre", instagram: "https://www.instagram.com/angelplaceshopping", create: false },
    { name: "Quedam Shopping Centre", city: "Yeovil", website: "https://quedamshopping.co.uk", parkingSpaces: 650, facebook: "https://www.facebook.com/QuedamShopping", instagram: "https://www.instagram.com/quedamshopping", twitter: "https://twitter.com/QuedamShopping", create: false },
    { name: "Orchard Shopping Centre", city: "Taunton", website: "https://orchardtaunton.co.uk", parkingSpaces: 300, facebook: "https://www.facebook.com/OrchardTaunton", instagram: "https://www.instagram.com/orchardtaunton", create: false },

    // --- LONDON ---
    { id: "cmid0jh84008xmtpule7z0gf7", name: "Westfield London", city: "London", website: "https://uk.westfield.com/london", parkingSpaces: 4500, facebook: "https://www.facebook.com/westfieldlondon", instagram: "https://www.instagram.com/westfieldlondon", twitter: "https://twitter.com/westfieldlondon", create: false },
    { name: "Westfield Stratford City", city: "London", website: "https://uk.westfield.com/stratfordcity", parkingSpaces: 5000, facebook: "https://www.facebook.com/westfieldstratfordcity", instagram: "https://www.instagram.com/westfieldstratfordcity", twitter: "https://twitter.com/westfieldstrat", create: false },
    { name: "Brent Cross Shopping Centre", city: "London", website: "https://www.brentcross.co.uk", parkingSpaces: 8000, facebook: "https://www.facebook.com/brentcross", instagram: "https://www.instagram.com/brentcross_sc", twitter: "https://twitter.com/brentcross_sc", create: false },
    { name: "Canary Wharf Shopping", city: "London", website: "https://canarywharf.com/shopping", parkingSpaces: 2500, facebook: "https://www.facebook.com/canarywharf", instagram: "https://www.instagram.com/canarywharflondon", twitter: "https://twitter.com/CanaryWharfGrp", create: false },
    { name: "Battersea Power Station", city: "London", website: "https://batterseapowerstation.co.uk", parkingSpaces: 1000, facebook: "https://www.facebook.com/batterseapwrstn", instagram: "https://www.instagram.com/batterseapwrstn", twitter: "https://twitter.com/BatterseaPwrStn", create: false },
    { name: "One New Change", city: "London", website: "https://onenewchange.com", parkingSpaces: 0, facebook: "https://www.facebook.com/OneNewChange", create: false, description: "Public parking nearby only." },
    { name: "London Designer Outlet", city: "London", website: "https://londondesigneroutlet.com", parkingSpaces: 2500, facebook: "https://www.facebook.com/LondonDesignerOutlet", instagram: "https://www.instagram.com/londondesigneroutlet", twitter: "https://twitter.com/londonoutlet", create: false },
    { name: "ICON Outlet at The O2", city: "London", website: "https://iconattheo2.co.uk", parkingSpaces: 2000, facebook: "https://www.facebook.com/IconOutletTheO2", instagram: "https://www.instagram.com/iconoutletattheo2", twitter: "https://twitter.com/IconOutletO2", create: false },
    { name: "Burlington Arcade", city: "Mayfair", website: "https://www.burlingtonarcade.com", parkingSpaces: 0, instagram: "https://www.instagram.com/burlingtonarcade", create: false, description: "Historic arcade, no parking." },
    { name: "Angel Central", city: "London", website: "https://angelcentral.co.uk", parkingSpaces: 100, facebook: "https://www.facebook.com/AngelCentralIslington", instagram: "https://www.instagram.com/angel_central", twitter: "https://twitter.com/angel_central", create: false },
    { name: "The Brunswick Centre", city: "London", website: "https://brunswick.co.uk", parkingSpaces: 0, facebook: "https://www.facebook.com/BrunswickLondon", instagram: "https://www.instagram.com/brunswicklondon", twitter: "https://twitter.com/BrunswickLondon", create: false },
    { name: "Ealing Broadway", city: "London", website: "https://www.ealingbroadwayshopping.co.uk", parkingSpaces: 600, facebook: "https://www.facebook.com/EalingBroadwayShopping", instagram: "https://www.instagram.com/ealingshopping", twitter: "https://twitter.com/EalingShopping", create: false },
    { name: "The Glades", city: "Bromley", website: "https://theglades.co.uk", parkingSpaces: 1560, facebook: "https://www.facebook.com/TheGladesBromley", instagram: "https://www.instagram.com/thegladesbromley", twitter: "https://twitter.com/TheGladesBromley", create: false },
    { name: "Whitgift Shopping Centre", city: "Croydon", website: "https://centraleandwhitgift.co.uk", parkingSpaces: 1000, facebook: "https://www.facebook.com/CentraleandWhitgift", instagram: "https://www.instagram.com/centralewhitgift", create: false },
    { name: "St Nicholas Centre", city: "Sutton", website: "https://stnicssutton.co.uk", parkingSpaces: 700, facebook: "https://www.facebook.com/StNicholasShoppingCentre", instagram: "https://www.instagram.com/stnicssutton", create: false },
    { name: "The Bentall Centre", city: "Kingston", website: "https://bentallcentre.co.uk", parkingSpaces: 1900, instagram: "https://www.instagram.com/thebentallcentre", create: false },
    { name: "Wimbledon Quarter", city: "London", website: "https://wimbledonquarter.com", parkingSpaces: 390, facebook: "https://www.facebook.com/WimbledonQuarter", instagram: "https://www.instagram.com/wimbledonquarter", create: false },
    { name: "Surrey Quays Shopping Centre", city: "London", website: "https://surreyquays.co.co.uk", parkingSpaces: 1300, facebook: "https://www.facebook.com/SurreyQuays", instagram: "https://www.instagram.com/surreyquays", twitter: "https://twitter.com/SurreyQuays", create: false },
    { id: "cmid0kvuu01p7mtpuuulvazba", name: "Lewisham Shopping Centre", city: "London", website: "https://lewishamshopping.co.uk", parkingSpaces: 840, facebook: "https://www.facebook.com/LewishamShopping", instagram: "https://www.instagram.com/lewishamshopping", twitter: "https://twitter.com/lewishamshop", create: false },
    { name: "The Liberty Shopping Centre", city: "Greater London", website: "https://theliberty.co.uk", parkingSpaces: 800, facebook: "https://www.facebook.com/LibertyRomford", instagram: "https://www.instagram.com/libertyromford", twitter: "https://twitter.com/LibertyRomford", create: false },
    { name: "St George's Shopping Centre", city: "Harrow", website: "https://stgeorgesshopping.co.uk", parkingSpaces: 660, facebook: "https://www.facebook.com/StGeorgesHarrow", instagram: "https://www.instagram.com/stgeorgesharrow", twitter: "https://twitter.com/StGeorgesHarrow", create: false },
    { name: "Treaty Shopping Centre", city: "Greater London", website: "https://treatycentre.co.uk", parkingSpaces: 644, facebook: "https://www.facebook.com/TreatyCentre", instagram: "https://www.instagram.com/treatycentre", create: false },
    { name: "Livat Hammersmith", city: "Hammersmith", website: "https://www.livat.com/hammersmith", parkingSpaces: 600, facebook: "https://www.facebook.com/LivatHammersmith", instagram: "https://www.instagram.com/livathammersmith", twitter: "https://twitter.com/LivatHammersmith", create: false },
    { name: "Merton Abbey Mills", city: "Merton", website: "https://mertonabbeymills.org.uk", parkingSpaces: 0, instagram: "https://www.instagram.com/mertonabbeymills", create: false },
    { name: "Eden Walk Shopping Centre", city: "Greater London", website: "https://edenwalkshopping.co.uk", parkingSpaces: 700, facebook: "https://www.facebook.com/edenwalkkingston", instagram: "https://www.instagram.com/edenwalkkingston", create: false },
    { name: "Southside Wandsworth", city: "Wandsworth", website: "https://southsidewandsworth.com", parkingSpaces: 1100, facebook: "https://www.facebook.com/SouthsideWandsworth", instagram: "https://www.instagram.com/southsidewandsworth", twitter: "https://twitter.com/SouthsideWands", create: false },
    { name: "The Pavilions", city: "Uxbridge", website: "https://www.pavilionsshoppingcentre.co.uk", parkingSpaces: 900, facebook: "https://www.facebook.com/ThePavilions", instagram: "https://www.instagram.com/pavilionsuxbridge", twitter: "https://twitter.com/PavilionsUxbridge", create: false },

    // --- OTHERS / TRAFFORD FIX ---
    { id: "cmid0l57b01yymtpukrln8bvy", name: "The Trafford Centre", city: "Manchester", website: "https://traffordcentre.co.uk", parkingSpaces: 11500, facebook: "https://www.facebook.com/traffordcentre", instagram: "https://www.instagram.com/thetraffordcentre", twitter: "https://twitter.com/traffordcentre", create: false }
];

async function main() {
    console.log("🇬🇧 SW & LONDON REMEDIATION (Phase 22)");

    for (const centre of remediationData) {
        console.log(`Processing ${centre.name}...`);

        // Match logic: ID first, then Name+City, then Name
        let location = null;
        if ((centre as any).id) {
            location = await prisma.location.findUnique({ where: { id: (centre as any).id } });
        } else {
            location = await prisma.location.findFirst({
                where: {
                    name: { contains: centre.name, mode: "insensitive" },
                    city: { contains: centre.city, mode: "insensitive" }
                }
            });

            if (!location && centre.aliases) {
                for (const alias of centre.aliases) {
                    location = await prisma.location.findFirst({
                        where: {
                            name: { contains: alias, mode: "insensitive" },
                            city: { contains: centre.city, mode: "insensitive" }
                        }
                    });
                    if (location) break;
                }
            }
        }

        if (location) {
            console.log(`✅ MATCH: ${location.name} -> ${centre.name}`);
            const updateData: any = {};

            if (!location.website && centre.website) updateData.website = centre.website;
            if ((!location.parkingSpaces || location.parkingSpaces === 0) && centre.parkingSpaces > 0) updateData.parkingSpaces = centre.parkingSpaces;
            if (!location.facebook && centre.facebook) updateData.facebook = centre.facebook;
            if (!location.instagram && centre.instagram) updateData.instagram = centre.instagram;
            if (!location.twitter && (centre as any).twitter) updateData.twitter = (centre as any).twitter;

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
            console.log(`❌ NOT FOUND: ${centre.name} - Skipping`);
            // Optional: If we were creating, we'd do it here. But staying strict to remediation for now.
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
