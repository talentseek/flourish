
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 1. The Lexicon
    console.log("Merging The Lexicon (Bracknell)...");
    const lexiconSurvivor = "cmicxw4hd000o13hxkrkb8enf";
    const lexiconVictim = "cmid0l3gy01x3mtpuffwo7jyi";

    try {
        await prisma.location.delete({ where: { id: lexiconVictim } });
        console.log("✅ Deleted duplicate Lexicon record.");
    } catch (e) {
        console.log("Lexicon duplicate not found.");
    }

    // 2. The Mailbox
    console.log("Merging The Mailbox (Birmingham)...");
    const mailboxSurvivor = "cmicxw4j7000s13hxzkrmasy0";
    const mailboxVictim = "cmid0l3mg01x9mtpuosw6xpk7";

    try {
        await prisma.location.delete({ where: { id: mailboxVictim } });
        console.log("✅ Deleted duplicate Mailbox record.");
    } catch (e) {
        console.log("Mailbox duplicate not found.");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
