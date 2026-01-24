
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Cribbs Causeway
    // Winner: The Mall at Cribbs Causeway (cmid0l3ob01xbmtpuas19mww5) - Enriched
    // Victim: Cribbs Causeway (The Mall) (cmks95l8h0004fajksfzg7io1) - Empty Seeded
    console.log("Merging Cribbs Causeway...");
    try {
        await prisma.location.delete({ where: { id: 'cmks95l8h0004fajksfzg7io1' } });
        console.log("✅ Deleted empty Seeded Cribbs record.");
    } catch (e) {
        console.log("Cribbs duplicate not found.");
    }

    // 2. Braehead
    // Winner: Braehead Shopping Centre (cmid0kq8y01jkmtpuda2z6obv) - Enriched
    // Victim: Braehead Retail Park (cmid0jsj400khmtpu7c9sri60) - Often confused
    // Actually, "Retail Park" might be a legitimate separate entity next door. 
    // But "Braehead Retail Park" in our DB is often just the shopping centre mislabelled.
    // I won't delete it yet, but I'll check the WINNER's health.

    // Check Winners
    const winners = await prisma.location.findMany({
        where: {
            id: {
                in: [
                    'cmid0l3ob01xbmtpuas19mww5', // Cribbs Winner
                    'cmid0kq8y01jkmtpuda2z6obv', // Braehead Winner
                    'cmks95l980005fajkx22y1ctx', // St David's
                    'cmks95lbi0006fajke474s7kn'  // East Kilbride
                ]
            }
        },
        select: { id: true, name: true, totalFloorArea: true, website: true, population: true }
    });

    console.log("\nVerifying Candidates:");
    winners.forEach(w => {
        console.log(`- ${w.name}: Area=${w.totalFloorArea}, Web=${w.website}, Pop=${w.population}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
