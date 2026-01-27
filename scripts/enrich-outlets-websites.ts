
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Applying User Provided Website Fixes for Outlets...');

    const updates = [
        { name: 'Peak Shopping Village', website: 'https://peakvillage.co.uk/' },
        { name: 'Quayside MediaCityUK', website: 'https://www.mediacityuk.co.uk/quayside/' },
        { name: 'Sterling Mills', website: 'https://www.sterlingmills.com/' },
        { name: 'The Mill Batley', website: 'http://www.themillbatley.com/' },
        { name: 'Trentham Shopping Village', website: 'https://trentham.co.uk/' }
    ];

    for (const update of updates) {
        const loc = await prisma.location.findFirst({
            where: { name: update.name }
        });

        if (loc) {
            await prisma.location.update({
                where: { id: loc.id },
                data: {
                    website: update.website,
                    isManaged: true // User verified
                }
            });
            console.log(`✅ Updated ${update.name}`);
        } else {
            console.warn(`⚠️ Could not find location: ${update.name}`);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
