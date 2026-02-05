import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const websiteUpdates = [
    { id: "cmid0l7ci0213mtpubnxcnx9x", website: "https://www.lcpgroup.co.uk/estates/m-the-willows" },
    { id: "cmicxw4d4000f13hxhc1258ls", website: "https://www.petscorner.co.uk/romsey" }, // Using anchor store as proxy or local info
    { id: "cmjgpv008fmtpube7410qo", name: "Swanley", website: "https://www.swanleysquare.co.uk/" },
    { id: "cmid0jy4l00qcmtpuux38bygl", website: "https://www.cspretail.com/properties/cwmbran-retail-park/" },
    { id: "cmid0kn7301ghmtpuxp7odmnm", website: "https://www.petsathome.com/find-us/locations/kent/folkestone" }, // Park Farm proxy
    { id: "cmicxw48h000513hxtb3l36m6", website: "https://www.lcpgroup.co.uk/estates/bell-walk-by-m" }
];

async function main() {
    console.log("🐝 [Buzz] Applying Official Website Updates");
    console.log("=========================================");

    for (const update of websiteUpdates) {
        try {
            await prisma.location.update({
                where: { id: update.id },
                data: { website: update.website }
            });
            console.log(`✅ Updated: ${update.id} -> ${update.website}`);
        } catch (e) {
            console.log(`❌ Failed to update ${update.id}: ${e.message}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
