
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Auditing Batch 19 Victims...");

    // Eastgate Ipswich (Winner from Batch 12)
    // ID: cmicxw4dl000g13hx18q88n63
    const eastgate = await prisma.location.findUnique({ where: { id: 'cmicxw4dl000g13hx18q88n63' } });
    console.log(`Eastgate ID: ${eastgate?.name} (${eastgate?.city}) - Postcode: ${eastgate?.postcode}`);

    // Icon Outlet
    // ID: cmid0jnub00fpmtpuvwl5o66k
    const icon = await prisma.location.findUnique({ where: { id: 'cmid0jnub00fpmtpuvwl5o66k' } });
    console.log(`Icon ID: ${icon?.name} (${icon?.city}) - Postcode: ${icon?.postcode}`);

    // Stockport Exchange
    // ID: cmid0ki7001bcmtpuomwmx6v7
    const stockport = await prisma.location.findUnique({ where: { id: 'cmid0ki7001bcmtpuomwmx6v7' } });
    console.log(`Stockport ID: ${stockport?.name} (${stockport?.city}) - Postcode: ${stockport?.postcode}`);

    // White Lion Walk
    // ID: cmid0l71h020tmtpukpy9iqok
    const lion = await prisma.location.findUnique({ where: { id: 'cmid0l71h020tmtpukpy9iqok' } });
    console.log(`Lion Walk ID: ${lion?.name} (${lion?.city}) - Postcode: ${lion?.postcode}`);

    // Broadway Bexleyheath
    // ID: cmid0kqn101jzmtpuf45o33vk
    const broadway = await prisma.location.findUnique({ where: { id: 'cmid0kqn101jzmtpuf45o33vk' } });
    console.log(`Broadway ID: ${broadway?.name} (${broadway?.city}) - Postcode: ${broadway?.postcode}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
