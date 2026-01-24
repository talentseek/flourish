
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. Eastgate (Ipswich)
    console.log("Merging Eastgate (Ipswich) duplicates...");
    const eastgateSurvivor = "cmicxw4dl000g13hx18q88n63";
    const eastgateVictim = "cmid0ktb101mlmtpuwcvagckg";

    try {
        await prisma.location.delete({ where: { id: eastgateVictim } });
        console.log("✅ Deleted duplicate Eastgate record.");
    } catch (e) {
        console.log("Eastgate duplicate not found.");
    }

    // 2. Balmoral (Scarborough)
    console.log("Merging Balmoral (Scarborough) duplicates...");
    const balmoralSurvivor = "cmicxw47m000313hxvu495jmw";
    const balmoralVictim = "cmid0kpju01itmtpudcep54fe";

    try {
        await prisma.location.delete({ where: { id: balmoralVictim } });
        console.log("✅ Deleted duplicate Balmoral record.");
    } catch (e) {
        console.log("Balmoral duplicate not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
