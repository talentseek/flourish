
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Repairing M Core Duplicates...");

    // 1. Merge Gyle (Edinburgh)
    const gyleM = await prisma.location.findFirst({ where: { name: 'The Gyle', management: { contains: 'M Core' } } });
    const gyleS = await prisma.location.findFirst({ where: { name: 'Gyle Shopping Centre' } });
    if (gyleM && gyleS) {
        await prisma.location.update({
            where: { id: gyleS.id },
            data: { management: gyleM.management, managementContact: gyleM.managementContact, managementEmail: gyleM.managementEmail, managementPhone: gyleM.managementPhone }
        });
        await prisma.location.delete({ where: { id: gyleM.id } });
        console.log("✅ Merged Gyle into Gyle Shopping Centre (M Core)");
    }

    // 2. Merge The Galleries (Washington)
    const galM = await prisma.location.findFirst({ where: { name: 'The Galleries', city: 'Washington' } });
    const galOld = await prisma.location.findFirst({ where: { name: 'Galleries Shopping Centre', city: { contains: 'Tyne' } } }); // Washington is in Tyne and Wear
    if (galM && galOld) {
        await prisma.location.update({
            where: { id: galOld.id },
            data: { management: galM.management, managementContact: galM.managementContact }
        });
        await prisma.location.delete({ where: { id: galM.id } });
        console.log("✅ Merged The Galleries (Washington)");
    }

    // 3. Merge Three Spires (Lichfield)
    const spiresM = await prisma.location.findFirst({ where: { name: 'Three Spires', city: 'Lichfield' } });
    const spiresOld = await prisma.location.findFirst({ where: { name: 'The Three Spires Shopping Centre' } }); // Staffordshire
    if (spiresM && spiresOld) {
        await prisma.location.update({
            where: { id: spiresOld.id },
            data: { management: spiresM.management, managementContact: spiresM.managementContact }
        });
        await prisma.location.delete({ where: { id: spiresM.id } });
        console.log("✅ Merged Three Spires");
    }

    // 4. Merge Central 12 (Southport)
    const c12M = await prisma.location.findFirst({ where: { name: 'Central 12', management: { contains: 'M Core' } } });
    const c12Old = await prisma.location.findFirst({ where: { name: 'Central 12 Retail Park' } });
    if (c12M && c12Old) {
        await prisma.location.update({
            where: { id: c12Old.id },
            data: { management: c12M.management, managementContact: c12M.managementContact }
        });
        await prisma.location.delete({ where: { id: c12M.id } });
        console.log("✅ Merged Central 12");
    }

    // 5. Piazza (Huddersfield/Paisley duplicate check)
    // Be careful here. M Core said "Piazza Centre (Huddersfield)". 
    // Audit showed: "The Piazza Centre (West Yorkshire)" (likely Huddersfield) and "The Piazza Shopping Centre (Renfrewshire)" (Paisley).
    // M Core ingestion created: "Piazza Centre" (Huddersfield).
    const piazzaM = await prisma.location.findFirst({ where: { name: 'Piazza Centre', city: 'Huddersfield' } });
    const piazzaOld = await prisma.location.findFirst({ where: { name: 'The Piazza Centre', city: { contains: 'West Yorkshire' } } });
    if (piazzaM && piazzaOld) {
        await prisma.location.update({
            where: { id: piazzaOld.id },
            data: { management: piazzaM.management, managementContact: piazzaM.managementContact }
        });
        await prisma.location.delete({ where: { id: piazzaM.id } });
        console.log("✅ Merged Piazza (Huddersfield)");
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
