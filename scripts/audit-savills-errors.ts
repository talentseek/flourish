
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Auditing Savills Ingestion Anomalies...");

    // 1. Trafford Mismatch
    // "The Loom" (cmid0kjp101cvmtpu357opsxl) was matched.
    const loom = await prisma.location.findUnique({ where: { id: 'cmid0kjp101cvmtpu357opsxl' } });
    console.log(`\nLoom Record: ${loom?.name}, ${loom?.city} (Managed: ${loom?.management})`);

    const trafford = await prisma.location.findFirst({ where: { name: { contains: 'Trafford Centre' } } });
    console.log(`Trafford Record: ${trafford?.name}, ${trafford?.city} (Managed: ${trafford?.management})`);

    // 2. Victoria Centre Mismatch
    // "Victoria Retail Park" (cmid0km2u01fbmtpuj8w9gbcu) matched.
    const vicPark = await prisma.location.findUnique({ where: { id: 'cmid0km2u01fbmtpuj8w9gbcu' } });
    console.log(`\nVictoria Park Record: ${vicPark?.name}, ${vicPark?.city} (Managed: ${vicPark?.management})`);

    const vicCentre = await prisma.location.findFirst({ where: { name: 'Victoria Centre', city: 'Nottingham' } });
    console.log(`Victoria Centre Record: ${vicCentre?.name}, ${vicCentre?.city} (Managed: ${vicCentre?.management})`);

    // 3. Harlequin / Atria
    const atria = await prisma.location.findFirst({ where: { name: 'Atria Watford' } });
    console.log(`\nAtria Record: ${atria?.name} (Managed: ${atria?.management})`);

    const harlequin = await prisma.location.findFirst({ where: { name: 'Harlequin Watford' } });
    console.log(`Harlequin Record: ${harlequin?.name} (Managed: ${harlequin?.management})`);

    // 4. intu MK
    const mk = await prisma.location.findFirst({ where: { name: { contains: 'intu Milton Keynes' } } });
    console.log(`\nintu MK Record: ${mk?.name} (Managed: ${mk?.management})`);

    const centremk = await prisma.location.findFirst({ where: { name: { contains: 'Centre:MK' } } });
    console.log(`Centre:MK Record: ${centremk?.name} (Managed: ${centremk?.management})`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
