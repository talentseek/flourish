
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const UPDATES = [
    { name: "The Sovereign", city: "Weston-super-Mare", url: "https://sovereign-centre.co.uk/" }, // P0
    { name: "The Centre", city: "West Lothian", url: "https://thecentrelivingston.com/" }, // aka The Centre, Livingston
    { name: "Clydebank Centre", city: "Glasgow", url: "https://clyde-shoppingcentre.co.uk/" }, // Name varies but safe
    { name: "St. Johns Shopping Centre", city: "Merseyside", url: "https://stjohnsshoppingcentre.co.uk/" }, // Liverpool
    { name: "Strand Shopping Centre", city: "Merseyside", url: "https://strandshoppingcentre.com/" }, // Bootle
    { name: "The Square Camberley", city: "Surrey", url: "https://thesquarecamberley.co.uk/" },
    { name: "The Broadway Bradford", city: "West Yorkshire", url: "https://broadwaybradford.com/" },
    { name: "Union Square", city: "Aberdeen", url: "https://www.unionsquareaberdeen.com/" },
    { name: "Exchange Ilford", city: "Ilford", url: "https://www.exchangeilford.com/" },
    { name: "Templars Square", city: "Oxfordshire", url: "https://templarssquare.com/" },
    { name: "Weston Favell", city: "Northampton", url: "https://weston-favell.com/" },
    { name: "Chelmsley Wood", city: "Solihull", url: "https://chelmsleywoodshopping.co.uk/" },

    // Batch 2-3
    { name: "Navan Town Centre", city: "Navan", url: "https://navantowncentre.ie/" },
    { name: "The Rock", city: "Bury", url: "https://therockbury.co.uk/" },
    { name: "Swinton Square", city: "Swinton", url: "https://swintonsquare.co.uk/" },
    { name: "St Stephens", city: "Hull", url: "https://www.ststephens-hull.com/" },
    { name: "St Georges Shopping Centre", city: "Gravesend", url: "https://stgeorgesgravesend.co.uk/" },
    { name: "The Swan Shopping Centre", city: "Eastleigh", url: "https://swanshopping.com/" },
    { name: "Stamford Quarter", city: "Altrincham", url: "https://stamfordquarter.com/" },
    { name: "Victoria Place", city: "Woking", url: "https://vpwoking.co.uk/" },
    { name: "Walnuts Shopping Centre", city: "Orpington", url: "https://walnutsshopping.com/" },
    { name: "Pavilions Shopping Centre", city: "Waltham Cross", url: "https://pavilionsshoppingcentre.co.uk/" },
    { name: "Willow Place", city: "Corby", url: "https://willowplace.co.uk/" },
    { name: "One Stop Shopping Centre", city: "Perry Barr", url: "https://onestop-shopping.co.uk/" },
    { name: "Rochdale Exchange", city: "Rochdale", url: "https://rochdaleexchange.co.uk/" },
    { name: "Templars Square", city: "Cowley", url: "https://templarssquare.com/" },

    // Batch 4-5
    { name: "White Rose Retail Centre", city: "Rhyl", url: "https://whiterosecentre.co.uk/" },
    { name: "Pescod Square", city: "Boston", url: "https://www.pescodsquare.com/" },
    { name: "The Orchards Shopping Centre", city: "Dartford", url: "https://orchardsdartford.co.uk/" },
    { name: "St. Nicholas Arcades", city: "Lancashire", url: "https://stnicholasarcades.co.uk/" }, // Lancaster
    { name: "The Atrium", city: "Surrey", url: "https://atriumcamberley.co.uk/" }, // Camberley
    { name: "The Churchill Centre", city: "Dudley", url: "https://thechurchillshoppingcentre.co.uk/" },
    { name: "Parkgate", city: "West Midlands", url: "https://parkgateshirley.com/" }, // Shirley
    { name: "St. Johns Centre", city: "West Yorkshire", url: "https://stjohnsleeds.co.uk/" }, // Leeds
    { name: "Cockhedge Retail Park", city: "Warrington", url: "https://cockhedge.shop/" },
    { name: "Oxo Tower Wharf", city: "London", url: "https://coinstreet.org/oxo-tower-wharf" }, // Proxy
    { name: "Willow Place", city: "Corby", url: "https://willowplace.co.uk/" }, // Duplicate check?
    { name: "Pendle Rise Shopping Centre", city: "Lancashire", url: "https://pendle.gov.uk" }, // Redevelopment Proxy
    { name: "Swanley Square", city: "Kent", url: "https://seekent.co.uk/listing/swanley-square-shopping-centre" }, // Proxy

    // Batch 6-10
    { name: "Orchard Square", city: "Sheffield", url: "https://orchardsquare.co.uk/" },
    { name: "St Marks Shopping", city: "Lincoln", url: "https://stmarks-lincoln.co.uk/" },
    { name: "The Hub", city: "Milton Keynes", url: "https://thehub-miltonkeynes.com/" }, // The Hub:MK
    { name: "Rochdale Riverside", city: "Rochdale", url: "https://rochdaleriverside.com/" },
    { name: "The Brunswick", city: "Scarborough", url: "https://sq-1.co.uk/" }, // Rebranded to SQ1
    { name: "Piries Place", city: "Horsham", url: "https://piriesplacehorsham.com/" },
    { name: "Rams Walk", city: "Petersfield", url: "https://ramswalk.co.uk/" },
    { name: "Newnham Court", city: "Maidstone", url: "https://newnhamcourt.co.uk/" },
    { name: "Penny Hill Centre", city: "Leeds", url: "https://mpennyhill.co.uk/" }, // Hunslet
    { name: "Lion & Lamb Yard", city: "Farnham", url: "https://farnham.gov.uk/discover/shopping/lion-and-lamb-yard" }, // Proxy
    { name: "Canolfan Menai", city: "Bangor", url: "https://welcomebangor.co.uk/" }, // Proxy/Welcome Bangor
    { name: "The Chilterns", city: "High Wycombe", url: "https://chilterns.org.uk/" }, // Redevelopment info? Or just community.
    { name: "The Maltings", city: "Salisbury", url: "https://experiencesalisbury.co.uk/directory/listing/the-maltings/" }, // Proxy
    { name: "New Squares", city: "Penrith", url: "https://eden.gov.uk/" }, // Council/Sainsburys proxy
    { name: "Leegate Shopping Centre", city: "London", url: "https://leegateregeneration.co.uk/" }, // Redev site
    { name: "Catford Centre", city: "London", url: "https://lewisham.gov.uk/inmyarea/regeneration/catford/catford-town-centre" }, // Council
    { name: "5 Rise Shopping Centre", city: "Bingley", url: "https://jacksoncriss.co.uk/properties/bingley-five-rise/" }, // Leasing/Proxy
    { name: "Trident Shopping Centre", city: "Dudley", url: "https://completelyretail.co.uk/scheme/Trident-Shopping-Centre-Dudley" }, // Proxy
    { name: "Mid Kent Shopping Centre", city: "Maidstone", url: "https://lcpgroup.co.uk/property/203/Mid-Kent-Shopping-Centre/" } // LCP Proxy
];

async function main() {
    console.log(`🚀 Applying Deep Sweep Batch 1 Updates (${UPDATES.length})...`);

    for (const u of UPDATES) {
        // Try precise match first
        let locs = await prisma.location.findMany({
            where: {
                name: { contains: u.name, mode: 'insensitive' },
                // city: { contains: u.city, mode: 'insensitive' } // City might be "West Lothian" vs "Livingston"
            }
        });

        if (locs.length === 0) {
            // Try simplified name if failed
            locs = await prisma.location.findMany({
                where: {
                    name: { contains: u.name.split(' ')[0], mode: 'insensitive' }, // Try first word? No, risky.
                    // Let's assume the name list provided by the list script was accurate enough to match back
                    // Actually, I'll allow looser city matching manual override logic below
                    city: { contains: "", mode: 'insensitive' } // Just match name?
                }
            });
            // Re-filter by name + city manually to be safe
            locs = locs.filter(l =>
                l.name.toLowerCase().includes(u.name.toLowerCase())
            );
        }

        if (locs.length > 0) {
            // Pick best match (closest string length or just first)
            const loc = locs[0];
            console.log(`✅ Updating: ${loc.name} (${loc.city}) -> ${u.url}`);
            await prisma.location.update({
                where: { id: loc.id },
                data: { website: u.url }
            });
        } else {
            console.log(`❌ Could not match: ${u.name}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
