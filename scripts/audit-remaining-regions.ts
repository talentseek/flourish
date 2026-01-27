
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGIONS: Record<string, string[]> = {
    "South West": ["Cornwall", "Devon", "Somerset", "Dorset", "Wiltshire", "Gloucestershire", "Bristol", "Bath"],
    "East of England": ["Essex", "Hertfordshire", "Bedfordshire", "Cambridgeshire", "Norfolk", "Suffolk", "Peterborough", "Luton", "Southend"],
    "West Midlands": ["West Midlands", "Staffordshire", "Warwickshire", "Shropshire", "Worcestershire", "Herefordshire", "Stoke"],
    "East Midlands": ["Derbyshire", "Nottinghamshire", "Leicestershire", "Lincolnshire", "Northamptonshire", "Rutland"],
    "Yorkshire & Humber": ["North Yorkshire", "South Yorkshire", "West Yorkshire", "East Riding", "Hull", "York", "Leeds", "Bradford", "Sheffield"],
    "North West": ["Lancashire", "Greater Manchester", "Merseyside", "Cheshire", "Cumbria", "Liverpool", "Manchester"],
    "North East": ["Tyne And Wear", "County Durham", "Northumberland", "Newcastle", "Sunderland"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Flintshire", "Carmarthenshire", "Pembrokeshire", "Gwynedd", "Conwy", "Denbighshire", "Powys", "Ceredigion", "Monmouthshire", "Vale of Glamorgan", "Bridgend", "Rhondda", "Merthyr", "Caerphilly", "Blaenau Gwent", "Torfaen"],
    "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Highland", "Fife", "Lanarkshire", "Lothian", "Aberdeenshire", "Angus", "Argyll", "Ayrshire", "Clackmannanshire", "Dumfries", "Dunbartonshire", "Falkirk", "Inverclyde", "Moray", "Orkney", "Perth", "Renfrewshire", "Borders", "Shetland", "Stirling", "Hebrides"],
    "Northern Ireland": ["Antrim", "Armagh", "Down", "Fermanagh", "Londonderry", "Tyrone", "Belfast"]
};

// Reverse map for lookup
const COUNTY_TO_REGION: Record<string, string> = {};
for (const [region, counties] of Object.entries(REGIONS)) {
    for (const county of counties) {
        COUNTY_TO_REGION[county.toLowerCase()] = region;
        // Also map "County X"
        COUNTY_TO_REGION[`county ${county.toLowerCase()}`] = region;
    }
}

async function main() {
    console.log("🔍 Auditing Remaining Unmanaged Centres without Websites...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ]
        },
        select: {
            name: true,
            city: true,
            county: true,
            totalFloorArea: true
        }
    });

    const regionCounts: Record<string, any[]> = {};
    const unmapped: any[] = [];

    for (const loc of locations) {
        let county = (loc.county || loc.city || "").toLowerCase();
        let region = "Unknown";

        // Try exact match
        for (const [key, val] of Object.entries(COUNTY_TO_REGION)) {
            if (county.includes(key) || (loc.city && loc.city.toLowerCase().includes(key))) {
                region = val;
                break;
            }
        }

        // Catch London/SE if they slipped through (though clearly handled separately)
        if (county.includes("london")) region = "London";
        if (county.includes("surrey") || county.includes("dorking")) region = "South East";

        if (region !== "Unknown") {
            if (!regionCounts[region]) regionCounts[region] = [];
            regionCounts[region].push(loc);
        } else {
            unmapped.push(loc);
        }
    }

    // Output stats
    for (const [region, locs] of Object.entries(regionCounts)) {
        console.log(`📌 ${region}: ${locs.length} locations`);
    }

    if (unmapped.length > 0) {
        console.log(`\n❓ Mapping Issues (${unmapped.length}):`);
        // Group by county to help debug
        const byCounty: Record<string, number> = {};
        unmapped.forEach(l => {
            const c = l.county || l.city || "NULL";
            byCounty[c] = (byCounty[c] || 0) + 1;
        });
        console.table(Object.entries(byCounty).sort((a, b) => b[1] - a[1]).slice(0, 10));
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
