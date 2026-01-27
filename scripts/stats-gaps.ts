
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("📊 Analyzing Data Gaps for Verified Locations...\n");

    const locations = await prisma.location.findMany({
        where: {
            // Target: Verified websites only
            website: { not: null, not: '' }
        }
    });

    const total = locations.length;
    console.log(`Target Set: ${total} locations with websites.\n`);

    const stats = {
        // P3 Digital
        missingFacebook: 0,
        missingInstagram: 0,
        missingTwitter: 0,
        // P1 Operational
        missingPhone: 0,
        missingHours: 0,
        missingParking: 0,
        missingStores: 0,
        // P2 Commercial
        missingOwner: 0,
        missingManagement: 0,
        missingOpenedYear: 0
    };

    for (const loc of locations) {
        if (!loc.facebook) stats.missingFacebook++;
        if (!loc.instagram) stats.missingInstagram++;
        if (!loc.twitter) stats.missingTwitter++;

        if (!loc.phone) stats.missingPhone++;
        if (!loc.openingHours) stats.missingHours++;
        if (!loc.parkingSpaces) stats.missingParking++;
        if (!loc.numberOfStores) stats.missingStores++;

        if (!loc.owner) stats.missingOwner++;
        if (!loc.management) stats.missingManagement++;
        if (!loc.openedYear) stats.missingOpenedYear++;
    }

    console.log("| Field | Missing Count | Missing % | Priority |");
    console.log("| :--- | :--- | :--- | :--- |");
    console.log(`| **Social: Facebook** | ${stats.missingFacebook} | ${((stats.missingFacebook / total) * 100).toFixed(1)}% | High |`);
    console.log(`| **Social: Instagram** | ${stats.missingInstagram} | ${((stats.missingInstagram / total) * 100).toFixed(1)}% | High |`);
    console.log(`| **Social: Twitter** | ${stats.missingTwitter} | ${((stats.missingTwitter / total) * 100).toFixed(1)}% | Medium |`);
    console.log(`| **Ops: Phone** | ${stats.missingPhone} | ${((stats.missingPhone / total) * 100).toFixed(1)}% | High |`);
    console.log(`| **Ops: Hours** | ${stats.missingHours} | ${((stats.missingHours / total) * 100).toFixed(1)}% | High |`);
    console.log(`| **Ops: Parking** | ${stats.missingParking} | ${((stats.missingParking / total) * 100).toFixed(1)}% | Med |`);
    console.log(`| **Ops: Store Count** | ${stats.missingStores} | ${((stats.missingStores / total) * 100).toFixed(1)}% | Med |`);
    console.log(`| **Comm: Owner** | ${stats.missingOwner} | ${((stats.missingOwner / total) * 100).toFixed(1)}% | Low (Search Req) |`);
    console.log(`| **Comm: Management** | ${stats.missingManagement} | ${((stats.missingManagement / total) * 100).toFixed(1)}% | Low (Search Req) |`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
