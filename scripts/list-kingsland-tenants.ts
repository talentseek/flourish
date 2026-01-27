
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const LOCATION_ID = "cmicxw4gi000m13hx9mghuxqm";

async function main() {
    const tenants = await prisma.tenant.findMany({
        where: { locationId: LOCATION_ID },
        select: { name: true, category: true }
    });
    console.log(`Found ${tenants.length} tenants:`);
    console.table(tenants);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
