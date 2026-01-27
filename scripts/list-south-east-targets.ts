
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOUTH_EAST_TERMS = [
    // Counties
    "Kent", "Surrey", "Sussex", "Hampshire", "Berkshire", "Buckinghamshire", "Oxfordshire", "Isle of Wight",
    // Cities/Towns
    "Brighton", "Southampton", "Portsmouth", "Reading", "Milton Keynes", "Oxford", "Slough",
    "Crawley", "Maidstone", "Basingstoke", "Woking", "Guildford", "Chatham", "Gillingham",
    "High Wycombe", "Eastbourne", "Hastings", "Bracknell", "Aylesbury", "Camberley", "Fareham",
    "Ashford", "Canterbury", "Dover", "Folkestone", "Margate", "Ramsgate", "Tunbridge Wells",
    "Sevenoaks", "Dartford", "Gravesend", "Reigate", "Redhill", "Epsom", "Staines", "Walton",
    "Leatherhead", "Dorking", "Farnham", "Horsham", "Worthing", "Bognor Regis", "Chichester",
    "Winchester", "Andover", "Newbury", "Windsor", "Maidenhead", "Banbury", "Didcot", "Witney"
];

async function main() {
    console.log("🔍 Listing South East Targets...\n");

    const locations = await prisma.location.findMany({
        where: {
            isManaged: false,
            type: 'SHOPPING_CENTRE',
            OR: [
                { website: null },
                { website: '' }
            ],
            OR: [
                ...SOUTH_EAST_TERMS.map(t => ({ county: { contains: t, mode: 'insensitive' } })),
                ...SOUTH_EAST_TERMS.map(t => ({ city: { contains: t, mode: 'insensitive' } }))
            ]
        },
        select: {
            name: true,
            city: true,
            county: true
        }
    });

    console.log(`Found ${locations.length} locations.`);
    console.table(locations);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
