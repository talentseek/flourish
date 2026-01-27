
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Enriching The Lexicon...');

    // Target: The Lexicon (Bracknell)
    // ID: cmicxw4hd000o13hxkrkb8enf
    const updatedLocation = await prisma.location.update({
        where: {
            id: 'cmicxw4hd000o13hxkrkb8enf'
        },
        data: {
            website: 'https://thelexiconbracknell.com',
            openingHours: {
                "Mon-Sat": "09:00-18:00", // Core hours
                "Sun": "11:00-17:00"
            },
            parkingSpaces: 3800, // Combined capacity of Avenue, Braccan, Princess, etc.
            carParkPrice: null, // Paid
            owner: 'Schroders / Legal & General (Bracknell Regeneration Partnership)', // JV commonly known
            management: 'Savills',

            facebook: 'https://www.facebook.com/TheLexiconBracknell/',
            instagram: 'https://www.instagram.com/thelexiconbracknell/',

            isManaged: true
        }
    });

    console.log('✅ Successfully updated', updatedLocation.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
