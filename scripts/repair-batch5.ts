
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("🛠️ Repairing Batch 5 Mismatches...");

    // 1. Arcadian Centre
    const arcadian = await prisma.location.findFirst({ where: { name: 'Arcadian Centre', postcode: { contains: 'B5' } } });
    if (arcadian) {
        await prisma.location.update({
            where: { id: arcadian.id },
            data: {
                name: 'The Arcadian',
                city: 'Birmingham',
                website: "https://thearcadian.co.uk",
                facebook: "https://www.facebook.com/TheArcadianBirmingham",
                instagram: "https://www.instagram.com/thearcadianbirmingham",
                parkingSpaces: 500
            }
        });
        console.log("✅ Repaired The Arcadian (Birmingham)");
    } else console.log("⚠️ Arcadian Centre not found");

    // 2. Bay View Centre -> Bayview Shopping Centre
    const bayview = await prisma.location.findFirst({ where: { name: 'Bay View Centre', postcode: { contains: 'LL29' } } });
    if (bayview) {
        await prisma.location.update({
            where: { id: bayview.id },
            data: {
                name: 'Bayview Shopping Centre',
                city: 'Colwyn Bay',
                website: "https://bayviewshoppingcentre.co.uk",
                facebook: "https://www.facebook.com/BayViewShoppingCentre",
                instagram: "https://www.instagram.com/bayviewshopping",
                parkingSpaces: 500
            }
        });
        console.log("✅ Repaired Bayview Shopping Centre (Colwyn Bay)");
    } else console.log("⚠️ Bay View Centre not found");

    // 3. Cannon Park
    const cannon = await prisma.location.findFirst({ where: { name: 'Cannon Park', postcode: { contains: 'CV4' } } });
    if (cannon) {
        await prisma.location.update({
            where: { id: cannon.id },
            data: {
                name: 'Cannon Park Shopping Centre',
                city: 'Coventry',
                website: "https://cannonparkshopping.co.uk",
                facebook: "https://www.facebook.com/CannonParkShoppingCentre",
                instagram: "https://www.instagram.com/cannonparkshops",
                parkingSpaces: 800
            }
        });
        console.log("✅ Repaired Cannon Park Shopping Centre (Coventry)");
    } else console.log("⚠️ Cannon Park not found");

    // 4. Enterprise Centre
    const enterprise = await prisma.location.findFirst({ where: { name: 'Enterprise Shopping Centre', postcode: { contains: 'BN21' } } });
    if (enterprise) {
        await prisma.location.update({
            where: { id: enterprise.id },
            data: {
                name: 'The Enterprise Centre',
                city: 'Eastbourne',
                website: "https://enterprisecentre.org",
                facebook: "https://www.facebook.com/TheEnterpriseCentre",
                parkingSpaces: 0
            }
        });
        console.log("✅ Repaired The Enterprise Centre (Eastbourne)");
    } else console.log("⚠️ Enterprise Shopping Centre not found");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
