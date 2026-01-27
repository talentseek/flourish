
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB...");
    const count = await prisma.location.count();
    console.log(`DB Connected. Location count: ${count}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
