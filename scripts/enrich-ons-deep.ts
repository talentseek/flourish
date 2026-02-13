/**
 * ONS Deep Enrichment — Fill demographic gaps for all 3 Landsec locations
 *
 * Sources:
 * - ONS Census 2021 (population, median age, homeownership, car ownership)
 * - Cardiff Council ward-level income data
 * - UK National median household income FYE 2024: £36,700 (ONS)
 * - Car park prices from official websites
 * - Public transit from each centre's "Getting Here" pages
 *
 * Run: npx tsx scripts/enrich-ons-deep.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UK national benchmarks (ONS FYE 2024)
const UK_AVG_INCOME = 36700;
const UK_AVG_HOMEOWNERSHIP = 63.0; // England & Wales Census 2021
const UK_AVG_CAR_OWNERSHIP = 77.0; // England & Wales Census 2021

async function main() {
    console.log("═══════════════════════════════════════════════");
    console.log("  ONS Deep Enrichment — Feb 2026");
    console.log("  Filling demographic gaps for Landsec Trio");
    console.log("═══════════════════════════════════════════════\n");

    // ─── St David's Cardiff ──────────────────────────────────
    console.log("🔄 St David's Dewi Sant — Cardiff demographics...");

    const cardiffIncome = 27000;
    const cardiffHomeownership = 58.3;
    const cardiffCarOwnership = 77.8; // 100 - 22.2% no-car

    await prisma.location.update({
        where: { id: "cmks95l980005fajkx22y1ctx" },
        data: {
            // ONS Census 2021 — Cardiff Local Authority
            medianAge: 34,
            familiesPercent: "17.5",       // couples with dependent children
            seniorsPercent: "17.3",         // 65+ (Cardiff Census 2021)
            avgHouseholdIncome: String(cardiffIncome),
            incomeVsNational: String(((cardiffIncome / UK_AVG_INCOME - 1) * 100).toFixed(1)),
            homeownership: String(cardiffHomeownership),
            homeownershipVsNational: String((cardiffHomeownership - UK_AVG_HOMEOWNERSHIP).toFixed(1)),
            carOwnership: String(cardiffCarOwnership),
            carOwnershipVsNational: String((cardiffCarOwnership - UK_AVG_CAR_OWNERSHIP).toFixed(1)),

            // Car park (from qwikpark.co.uk / visitcardiff.com)
            carParkPrice: 2.70,  // weekday hourly rate; weekend £3.00
            parkingSpaces: 2550,  // 2000 main + 550 under John Lewis

            // Public transit
            publicTransit: "Cardiff Central & Cardiff Queen Street stations (5 min walk). Cardiff Bus hub adjacent. Capital Link, Cardiff Bay line.",

            // Number of floors
            numberOfFloors: 3,

            // Street address fix
            street: "Bridge Street",
        },
    });
    console.log("  ✅ St David's demographics enriched");

    // ─── Clarks Village ──────────────────────────────────────
    console.log("🔄 Clarks Village — filling remaining gaps...");

    const clarksIncome = 30294;
    const clarksHomeownership = 65.3; // already in DB
    const clarksCarOwnership = 80.1; // already in DB

    await prisma.location.update({
        where: { id: "cmid0jnny00fimtpupmc75o4u" },
        data: {
            // Fill missing demographic fields
            familiesPercent: "29.0",       // Somerset Census 2021 estimate
            incomeVsNational: String(((clarksIncome / UK_AVG_INCOME - 1) * 100).toFixed(1)),
            homeownershipVsNational: String((clarksHomeownership - UK_AVG_HOMEOWNERSHIP).toFixed(1)),
            carOwnershipVsNational: String((clarksCarOwnership - UK_AVG_CAR_OWNERSHIP).toFixed(1)),

            // Car park (from somerset.gov.uk / clarksvillage site)
            carParkPrice: 1.00,  // on-site; council car parks £1.20/hr
            parkingSpaces: 1400,

            // Public transit
            publicTransit: "Castle Cary station (8 miles). First Bus 376/377 Bristol-Street. Limited rural bus service.",

            // Fill social media gaps
            youtube: "https://www.youtube.com/@clarksvillage",
            tiktok: "https://www.tiktok.com/@clarksvillage",

            // Floor count
            numberOfFloors: 1, // open-air outlet village
        },
    });
    console.log("  ✅ Clarks Village demographics enriched");

    // ─── Xscape Milton Keynes ────────────────────────────────
    console.log("🔄 Xscape Milton Keynes — MK demographics...");

    const mkIncome = 32000;
    const mkHomeownership = 54.8;
    const mkCarOwnership = 84.3; // 100 - 15.7% no-car

    await prisma.location.update({
        where: { id: "cmksemajw000boqpn46fxb97w" },
        data: {
            // ONS Census 2021 — Milton Keynes
            familiesPercent: "35.3",        // couples + lone parents with children
            seniorsPercent: "14.2",          // 65+ (MK Census 2021)
            incomeVsNational: String(((mkIncome / UK_AVG_INCOME - 1) * 100).toFixed(1)),
            homeownership: String(mkHomeownership),
            homeownershipVsNational: String((mkHomeownership - UK_AVG_HOMEOWNERSHIP).toFixed(1)),
            carOwnership: String(mkCarOwnership),
            carOwnershipVsNational: String((mkCarOwnership - UK_AVG_CAR_OWNERSHIP).toFixed(1)),

            // Car park (from xscapemiltonkeynes.co.uk / saba parking)
            carParkPrice: 0.80,  // Blue Bays (Saba); Council Purple Bays: £2/2hr then £0.50/hr
            parkingSpaces: 1000,

            // Public transit
            publicTransit: "Milton Keynes Central station (1 mile, 5 min drive). Arriva Bus 4/5/X5. Redway cycle network.",

            // Street address fix
            street: "602 Marlborough Gate",

            // Social media
            youtube: "https://www.youtube.com/@XscapeMK",
            tiktok: "https://www.tiktok.com/@xscapemk",

            // Floor count
            numberOfFloors: 2,
        },
    });
    console.log("  ✅ Xscape MK demographics enriched");

    // ═══ Verification ═══
    console.log("\n═══════════════════════════════════════════════");
    console.log("  Verification — Key Demographics");
    console.log("═══════════════════════════════════════════════\n");

    const ids = [
        "cmks95l980005fajkx22y1ctx",
        "cmid0jnny00fimtpupmc75o4u",
        "cmksemajw000boqpn46fxb97w",
    ];

    for (const id of ids) {
        const loc = await prisma.location.findUnique({ where: { id } });
        if (!loc) continue;

        console.log(`📍 ${loc.name} (${loc.postcode})`);
        console.log(`   Population: ${loc.population?.toLocaleString()} | Median Age: ${loc.medianAge}`);
        console.log(`   Families: ${loc.familiesPercent}% | Seniors: ${loc.seniorsPercent}%`);
        console.log(`   Income: £${loc.avgHouseholdIncome} (${loc.incomeVsNational}% vs UK)`);
        console.log(`   Homeownership: ${loc.homeownership}% (${loc.homeownershipVsNational}% vs UK)`);
        console.log(`   Car Ownership: ${loc.carOwnership}% (${loc.carOwnershipVsNational}% vs UK)`);
        console.log(`   Parking: ${loc.parkingSpaces} spaces — ${loc.carParkPrice}`);
        console.log(`   Transit: ${loc.publicTransit?.slice(0, 60)}...`);
        console.log(`   Floors: ${loc.numberOfFloors} | Stores: ${loc.numberOfStores}`);
        console.log();
    }

    // Field coverage check
    const demoFields = [
        "population", "medianAge", "familiesPercent", "seniorsPercent",
        "avgHouseholdIncome", "incomeVsNational",
        "homeownership", "homeownershipVsNational",
        "carOwnership", "carOwnershipVsNational",
        "carParkPrice", "publicTransit", "numberOfFloors",
    ];

    console.log("═══ Field Coverage ═══");
    for (const id of ids) {
        const loc = await prisma.location.findUnique({ where: { id } });
        if (!loc) continue;
        const filled = demoFields.filter((f) => (loc as any)[f] !== null && (loc as any)[f] !== undefined).length;
        console.log(`${loc.name}: ${filled}/${demoFields.length} demographic fields filled`);
    }

    console.log("\n✅ ONS deep enrichment complete!");
    await prisma.$disconnect();
}

main().catch((err) => {
    console.error("❌ Enrichment failed:", err);
    prisma.$disconnect();
    process.exit(1);
});
