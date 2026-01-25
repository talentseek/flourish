
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data Definitions (Normalized)
const regions = {
    "Wales": [
        { name: "St David's Dewi Sant", cityMatch: ["Cardiff"] },
        { name: "Cwmbran Centre", cityMatch: ["Cwmbran"] },
        { name: "The Quadrant", cityMatch: ["Swansea"] },
        { name: "Eagles Meadow", cityMatch: ["Wrexham"] },
        { name: "Friars Walk", cityMatch: ["Newport"] },
        { name: "Aberafan Shopping Centre", cityMatch: ["Port Talbot"] },
        { name: "Kingsway Centre", cityMatch: ["Newport"] },
        { name: "St Catherine's Walk", cityMatch: ["Carmarthen"] },
        { name: "McArthurGlen Designer Outlet Bridgend", cityMatch: ["Bridgend"] },
        { name: "The Capitol", cityMatch: ["Cardiff"] },
        { name: "Queens Arcade", cityMatch: ["Cardiff"] },
        { name: "Victoria Centre", cityMatch: ["Llandudno"] },
        { name: "White Rose Centre", cityMatch: ["Rhyl"] },
        { name: "Daniel Owen Centre", cityMatch: ["Mold"] },
        { name: "Riverside Haverfordwest", cityMatch: ["Haverfordwest"] }
    ],
    "Northern Ireland": [
        { name: "Victoria Square", cityMatch: ["Belfast"] },
        { name: "Foyleside Shopping Centre", cityMatch: ["Derry", "Londonderry"] },
        { name: "Rushmere Shopping Centre", cityMatch: ["Craigavon"] },
        { name: "CastleCourt", cityMatch: ["Belfast"] },
        { name: "Abbey Centre", cityMatch: ["Newtownabbey"] },
        { name: "The Quays", cityMatch: ["Newry"] },
        { name: "Forestside", cityMatch: ["Belfast"] },
        { name: "Bow Street Mall", cityMatch: ["Lisburn"] },
        { name: "Kennedy Centre", cityMatch: ["Belfast"] },
        { name: "Bloomfield Shopping Centre", cityMatch: ["Bangor"] },
        { name: "Fairhill Shopping Centre", cityMatch: ["Ballymena"] },
        { name: "Buttercrane", cityMatch: ["Newry"] },
        { name: "Ards Shopping Centre", cityMatch: ["Newtownards"] },
        { name: "Connswater", cityMatch: ["Belfast"] },
        { name: "Tower Centre", cityMatch: ["Ballymena"] },
        { name: "Erneside", cityMatch: ["Enniskillen"] },
        { name: "Park Centre", cityMatch: ["Belfast"] },
        { name: "Flagship Centre", cityMatch: ["Bangor"] },
        { name: "Meadowlane", cityMatch: ["Magherafelt"] },
        { name: "Richmond Centre", cityMatch: ["Derry", "Londonderry"] }
    ],
    "North East": [
        { name: "Metrocentre", cityMatch: ["Gateshead", "Newcastle"] },
        { name: "Eldon Square", cityMatch: ["Newcastle"] },
        { name: "The Bridges", cityMatch: ["Sunderland"] },
        { name: "The Galleries", cityMatch: ["Washington", "Sunderland"] },
        { name: "Middleton Grange", cityMatch: ["Hartlepool"] },
        { name: "Manor Walks", cityMatch: ["Cramlington"] },
        { name: "Cleveland Centre", cityMatch: ["Middlesbrough"] },
        { name: "Billingham Shopping Centre", cityMatch: ["Billingham"] },
        { name: "Wellington Square", cityMatch: ["Stockton"] },
        { name: "Captain Cook Square", cityMatch: ["Middlesbrough"] },
        { name: "Hillstreet Centre", cityMatch: ["Middlesbrough"] },
        { name: "Cornmill Centre", cityMatch: ["Darlington"] },
        { name: "Parkway Shopping Centre", cityMatch: ["Coulby Newham", "Middlesbrough"] },
        { name: "The Forum", cityMatch: ["Wallsend"] },
        { name: "Beacon Centre", cityMatch: ["North Shields"] },
        { name: "The Riverwalk", cityMatch: ["Durham"] },
        { name: "Viking Centre", cityMatch: ["Jarrow"] },
        { name: "Prince Bishops Place", cityMatch: ["Durham"] },
        { name: "The Gate", cityMatch: ["Newcastle"] },
        { name: "Byron Place", cityMatch: ["Seaham"] }
    ],
    "North West": [
        { name: "Trafford Centre", cityMatch: ["Manchester", "Trafford"] },
        { name: "Liverpool ONE", cityMatch: ["Liverpool"] },
        { name: "Manchester Arndale", cityMatch: ["Manchester"] },
        { name: "Golden Square", cityMatch: ["Warrington"] },
        { name: "The Rock", cityMatch: ["Bury"] },
        { name: "Pyramids", cityMatch: ["Birkenhead"] },
        { name: "The Grange", cityMatch: ["Birkenhead"] },
        { name: "Runcorn Shopping City", cityMatch: ["Runcorn", "Halton"] },
        { name: "Spindles Town Square", cityMatch: ["Oldham"] },
        { name: "Mill Gate", cityMatch: ["Bury"] },
        { name: "Grand Arcade", cityMatch: ["Wigan"] },
        { name: "The Lanes", cityMatch: ["Carlisle"] },
        { name: "Houndshill", cityMatch: ["Blackpool"] },
        { name: "Market Place", cityMatch: ["Bolton"] },
        { name: "The Concourse", cityMatch: ["Skelmersdale"] },
        { name: "St Johns Shopping Centre", cityMatch: ["Liverpool"] },
        { name: "Charter Walk", cityMatch: ["Burnley"] },
        { name: "Fishergate Centre", cityMatch: ["Preston"] },
        { name: "Middleton Shopping Centre", cityMatch: ["Middleton", "Manchester"] },
        { name: "Merseyway", cityMatch: ["Stockport"] },
        { name: "St George's", cityMatch: ["Preston"] }
    ],
    "Yorkshire": [
        { name: "Meadowhall", cityMatch: ["Sheffield"] },
        { name: "Trinity Leeds", cityMatch: ["Leeds"] },
        { name: "Frenchgate", cityMatch: ["Doncaster"] },
        { name: "White Rose Shopping Centre", cityMatch: ["Leeds"] },
        { name: "Victoria Leeds", cityMatch: ["Leeds"] },
        { name: "Crystal Peaks", cityMatch: ["Sheffield"] },
        { name: "The Broadway", cityMatch: ["Bradford"] },
        { name: "Trinity Walk", cityMatch: ["Wakefield"] },
        { name: "St Stephen's", cityMatch: ["Hull"] },
        { name: "Freshney Place", cityMatch: ["Grimsby"] },
        { name: "Merrion Centre", cityMatch: ["Leeds"] },
        { name: "The Ridings", cityMatch: ["Wakefield"] },
        { name: "Princes Quay", cityMatch: ["Hull"] },
        { name: "Kingsgate", cityMatch: ["Huddersfield"] },
        { name: "The Glass Works", cityMatch: ["Barnsley"] },
        { name: "Airedale Shopping Centre", cityMatch: ["Keighley"] },
        { name: "Prospect Centre", cityMatch: ["Hull"] },
        { name: "St Johns Centre", cityMatch: ["Leeds"] },
        { name: "Kirkgate Shopping Centre", cityMatch: ["Bradford"] },
        { name: "The Core", cityMatch: ["Leeds"] }
    ],
    "East Midlands": [
        { name: "Derbion", cityMatch: ["Derby"] },
        { name: "Highcross", cityMatch: ["Leicester"] },
        { name: "Victoria Centre", cityMatch: ["Nottingham"] },
        { name: "St Marks Shopping Centre", cityMatch: ["Lincoln"] },
        { name: "Weston Favell Shopping Centre", cityMatch: ["Northampton"] },
        { name: "Grosvenor Shopping", cityMatch: ["Northampton"] },
        { name: "Four Seasons Shopping Centre", cityMatch: ["Mansfield"] },
        { name: "Newlands Shopping Centre", cityMatch: ["Kettering"] },
        { name: "Swansgate Shopping Centre", cityMatch: ["Wellingborough"] },
        { name: "Haymarket Shopping Centre", cityMatch: ["Leicester"] },
        { name: "The Rushes", cityMatch: ["Loughborough"] },
        { name: "Vicar Lane Shopping Centre", cityMatch: ["Chesterfield"] },
        { name: "Springfields Outlet", cityMatch: ["Spalding"] },
        { name: "The Pavements", cityMatch: ["Chesterfield"] },
        { name: "Willow Place", cityMatch: ["Corby"] },
        { name: "Idlewells Shopping Centre", cityMatch: ["Sutton-in-Ashfield", "Sutton"] },
        { name: "Waterside Shopping Centre", cityMatch: ["Lincoln"] },
        { name: "Beaumont Shopping Centre", cityMatch: ["Leicester"] },
        { name: "The Crescent", cityMatch: ["Hinckley"] },
        { name: "Belvoir Shopping Centre", cityMatch: ["Coalville"] }
    ],
    "West Midlands": [
        { name: "Bullring", cityMatch: ["Birmingham"] },
        { name: "Merry Hill", cityMatch: ["Brierley Hill", "Dudley"] },
        { name: "Telford Centre", cityMatch: ["Telford"] },
        { name: "Kingfisher Shopping Centre", cityMatch: ["Redditch"] },
        { name: "Touchwood", cityMatch: ["Solihull"] },
        { name: "Mander Centre", cityMatch: ["Wolverhampton"] },
        { name: "The Potteries Centre", cityMatch: ["Stoke-on-Trent", "Hanley"] },
        { name: "Gracechurch Centre", cityMatch: ["Sutton Coldfield"] },
        { name: "Grand Central", cityMatch: ["Birmingham"] },
        { name: "New Square", cityMatch: ["West Bromwich"] },
        { name: "Old Market", cityMatch: ["Hereford"] },
        { name: "Crowngate", cityMatch: ["Worcester"] },
        { name: "Lower Precinct", cityMatch: ["Coventry"] },
        { name: "West Orchards", cityMatch: ["Coventry"] },
        { name: "Wulfrun Centre", cityMatch: ["Wolverhampton"] },
        { name: "Darwin Centre", cityMatch: ["Shrewsbury"] },
        { name: "Ankerside", cityMatch: ["Tamworth"] },
        { name: "Ropewalk", cityMatch: ["Nuneaton"] },
        { name: "Three Spires", cityMatch: ["Lichfield"] },
        { name: "Cornbow", cityMatch: ["Halesowen"] }
    ],
    "East of England": [
        { name: "Lakeside Shopping Centre", cityMatch: ["Thurrock", "Grays", "Essex"] },
        { name: "Atria Watford", cityMatch: ["Watford"] },
        { name: "Luton Point", cityMatch: ["Luton", "The Mall"] },
        { name: "Queensgate", cityMatch: ["Peterborough"] },
        { name: "Eastgate", cityMatch: ["Basildon"] },
        { name: "Chantry Place", cityMatch: ["Norwich"] },
        { name: "The Grafton", cityMatch: ["Cambridge"] },
        { name: "Grand Arcade", cityMatch: ["Cambridge"] },
        { name: "Vancouver Quarter", cityMatch: ["King's Lynn", "Kings Lynn"] },
        { name: "Castle Quarter", cityMatch: ["Norwich"] },
        { name: "The Marlowes", cityMatch: ["Hemel Hempstead"] },
        { name: "High Chelmer", cityMatch: ["Chelmsford"] },
        { name: "Serpentine Green", cityMatch: ["Peterborough"] },
        { name: "Victoria Shopping Centre", cityMatch: ["Southend", "Southend-on-Sea"] },
        { name: "The Galleria", cityMatch: ["Hatfield"] },
        { name: "Riverside", cityMatch: ["Hemel Hempstead"] },
        { name: "The Royals", cityMatch: ["Southend", "Southend-on-Sea"] },
        { name: "Culver Square", cityMatch: ["Colchester"] },
        { name: "Lion Walk", cityMatch: ["Colchester"] },
        { name: "Buttermarket", cityMatch: ["Ipswich"] }
    ],
    "South East": [
        { name: "Bluewater", cityMatch: ["Greenhithe", "Dartford", "Kent"] },
        { name: "centre:mk", cityMatch: ["Milton Keynes"] },
        { name: "Festival Place", cityMatch: ["Basingstoke"] },
        { name: "Westquay", cityMatch: ["Southampton"] },
        { name: "The Lexicon", cityMatch: ["Bracknell"] },
        { name: "Royal Victoria Place", cityMatch: ["Tunbridge Wells"] },
        { name: "Eden Shopping Centre", cityMatch: ["High Wycombe"] },
        { name: "Westgate", cityMatch: ["Oxford"] },
        { name: "The Oracle", cityMatch: ["Reading"] },
        { name: "Gunwharf Quays", cityMatch: ["Portsmouth"] },
        { name: "Victoria Place", cityMatch: ["Woking"] },
        { name: "Churchill Square", cityMatch: ["Brighton"] },
        { name: "The Beacon", cityMatch: ["Eastbourne"] },
        { name: "County Mall", cityMatch: ["Crawley"] },
        { name: "Hempstead Valley", cityMatch: ["Gillingham", "Kent"] },
        { name: "Castle Quay", cityMatch: ["Banbury"] },
        { name: "Midsummer Place", cityMatch: ["Milton Keynes"] },
        { name: "The Friary", cityMatch: ["Guildford"] },
        { name: "Cascades", cityMatch: ["Portsmouth"] }
    ],
    "South West": [
        { name: "The Mall at Cribbs Causeway", cityMatch: ["Bristol", "Patchway"] },
        { name: "Cabot Circus", cityMatch: ["Bristol"] },
        { name: "Drake Circus", cityMatch: ["Plymouth"] },
        { name: "SouthGate", cityMatch: ["Bath"] },
        { name: "Princesshay", cityMatch: ["Exeter"] },
        { name: "Gloucester Quays", cityMatch: ["Gloucester"] },
        { name: "McArthurGlen Swindon Designer Outlet", cityMatch: ["Swindon", "Wiltshire"] },
        { name: "Clarks Village", cityMatch: ["Street"] },
        { name: "The Galleries", cityMatch: ["Bristol"] },
        { name: "The Dolphin", cityMatch: ["Poole"] },
        { name: "Guildhall Shopping Centre", cityMatch: ["Exeter"] },
        { name: "Cross Keys Shopping Centre", cityMatch: ["Salisbury", "Wiltshire"] },
        { name: "The Sovereign", cityMatch: ["Weston-super-Mare"] },
        { name: "Angel Place Shopping Centre", cityMatch: ["Bridgwater", "Somerset"] },
        { name: "Quedam Shopping Centre", cityMatch: ["Yeovil"] },
        { name: "Orchard Shopping Centre", cityMatch: ["Taunton"] },
        { name: "Green Lanes Shopping Centre", cityMatch: ["Barnstaple", "Devon"] },
        { name: "Emery Gate Shopping Centre", cityMatch: ["Chippenham"] }
    ],
    "London": [
        { name: "Westfield London", cityMatch: ["Shepherd's Bush", "London"] },
        { name: "Westfield Stratford City", cityMatch: ["Stratford", "London"] },
        { name: "Brent Cross Shopping Centre", cityMatch: ["Brent Cross", "London"] },
        { name: "Canary Wharf Shopping", cityMatch: ["Canary Wharf", "London"] },
        { name: "Battersea Power Station", cityMatch: ["Battersea", "London"] },
        { name: "One New Change", cityMatch: ["London"] },
        { name: "London Designer Outlet", cityMatch: ["Wembley", "London"] },
        { name: "ICON Outlet at The O2", cityMatch: ["Greenwich", "London"] },
        { name: "Burlington Arcade", cityMatch: ["London", "Mayfair"] },
        { name: "Angel Central", cityMatch: ["Islington", "London"] },
        { name: "The Brunswick Centre", cityMatch: ["Bloomsbury", "London"] },
        { name: "Ealing Broadway", cityMatch: ["Ealing", "London"] },
        { name: "The Glades", cityMatch: ["Bromley", "London"] },
        { name: "Whitgift Shopping Centre", cityMatch: ["Croydon", "London"] },
        { name: "Centrale Shopping Centre", cityMatch: ["Croydon", "London"] },
        { name: "St Nicholas Centre", cityMatch: ["Sutton", "London"] },
        { name: "The Bentall Centre", cityMatch: ["Kingston", "London"] },
        { name: "Wimbledon Quarter", cityMatch: ["Wimbledon", "London"] },
        { name: "Surrey Quays Shopping Centre", cityMatch: ["Rotherhithe", "London"] },
        { name: "Lewisham Shopping Centre", cityMatch: ["Lewisham", "London"] },
        { name: "The Exchange", cityMatch: ["Ilford", "London"] },
        { name: "The Liberty Shopping Centre", cityMatch: ["Romford", "London"] },
        { name: "The Mercury", cityMatch: ["Romford", "London"] },
        { name: "St George's Shopping Centre", cityMatch: ["Harrow", "London"] },
        { name: "Treaty Shopping Centre", cityMatch: ["Hounslow", "London"] },
        { name: "Palace Gardens", cityMatch: ["Enfield", "London"] },
        { name: "The Chimes", cityMatch: ["Uxbridge", "London"] },
        { name: "Livat Hammersmith", cityMatch: ["Hammersmith", "London"] },
        { name: "W12 Shopping", cityMatch: ["Shepherd's Bush", "London"] },
        { name: "Putney Exchange", cityMatch: ["Putney", "London"] },
        { name: "Cardinal Place", cityMatch: ["Victoria", "London"] },
        { name: "Hay's Galleria", cityMatch: ["London"] },
        { name: "Leadenhall Market", cityMatch: ["London"] },
        { name: "Merton Abbey Mills", cityMatch: ["Merton", "London"] },
        { name: "Eden Walk Shopping Centre", cityMatch: ["Kingston", "London"] },
        { name: "Southside Wandsworth", cityMatch: ["Wandsworth", "London"] },
        { name: "The Pavilions", cityMatch: ["Uxbridge", "London"] }
    ]
};

async function main() {
    console.log("🌍 GLOBAL REGIONAL AUDIT (Quality Check)\n");

    const stats = {};

    for (const [region, targets] of Object.entries(regions)) {
        console.log(`\nChecking Region: ${region} (${targets.length} targets)`);

        let found = 0;
        let healthy = 0;
        const missing = [];
        const unhealthy = [];

        for (const target of targets) {
            const cleanName = target.name.replace(/ Shopping Centre| Centre|,/g, "").trim();
            const searchNames = [target.name, cleanName];

            const matches = await prisma.location.findMany({
                where: {
                    OR: searchNames.map(n => ({ name: { contains: n, mode: "insensitive" } }))
                }
            });

            const match = matches.find(m => {
                const locStr = (m.city + " " + (m.address || "") + " " + (m.county || "")).toLowerCase();
                return target.cityMatch.some(c => locStr.includes(c.toLowerCase()));
            });

            if (match) {
                found++;
                const isHealthy = Boolean(
                    match.website &&
                    match.parkingSpaces &&
                    (match.facebook || match.instagram)
                );

                if (isHealthy) {
                    healthy++;
                } else {
                    const gaps = [];
                    if (!match.website) gaps.push("Web");
                    if (!match.parkingSpaces) gaps.push("Park");
                    if (!match.facebook && !match.instagram) gaps.push("Socials");
                    unhealthy.push(`${target.name} [Missing: ${gaps.join(", ")}]`);
                }
            } else {
                missing.push(target.name);
            }
        }

        stats[region] = { found, total: targets.length, healthy, missing, unhealthy };

        console.log(`   Found: ${found}/${targets.length}`);
        console.log(`   Healthy (Web+Park+Soc): ${healthy}/${targets.length}`);
        if (missing.length > 0) console.log(`   ⚠️ MISSING: ${missing.join(", ")}`);
        if (unhealthy.length > 0) {
            console.log(`   ⚠️ GAPS:`);
            unhealthy.forEach(u => console.log(`      - ${u}`));
        }
    }

    console.log("\n\n📊 FINAL AUDIT SUMMARY");
    console.table(Object.keys(stats).map(r => ({
        Region: r,
        Found: `${stats[r].found}/${stats[r].total}`,
        Healthy: `${stats[r].healthy}/${stats[r].total}`,
        Status: stats[r].healthy === stats[r].total ? "✅ PASS" : "❌ FAIL"
    })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
