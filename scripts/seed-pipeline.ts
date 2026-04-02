/**
 * Seed Paul's Pipeline 2026 data into the CRM
 * Run: npx tsx scripts/seed-pipeline.ts
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Paul's userId (paul@thisisflourish.co.uk)
const PAUL_EMAIL = "paul@thisisflourish.co.uk"

type PipelineRow = {
    landlord: string | null
    contactDetails: string | null
    centres: string
    contact: string | null
    status: string | null
    value: number
    stage: "LEAD" | "CONTACTED" | "MEETING_SCHEDULED" | "PROPOSAL_SENT" | "NEGOTIATION" | "WON" | "LOST"
}

// Infer stage from status text
function inferStage(status: string | null): PipelineRow["stage"] {
    if (!status) return "LEAD"
    const s = status.toLowerCase()
    if (s.includes("meeting") || s.includes("visiting") || s.includes("visited") || s.includes("met on") || s.includes("onsite") || s.includes("arrange a coffee")) return "MEETING_SCHEDULED"
    if (s.includes("submitted") || s.includes("emailed") || s.includes("express interest") || s.includes("info received")) return "CONTACTED"
    if (s.includes("awaiting feedback") || s.includes("awaiting completion") || s.includes("follow up")) return "CONTACTED"
    if (s.includes("completing") || s.includes("completion")) return "NEGOTIATION"
    if (s.includes("new agent") || s.includes("need to arrange") || s.includes("contact")) return "LEAD"
    return "LEAD"
}

// Paul's pipeline data from the spreadsheet
const PIPELINE: PipelineRow[] = [
    { landlord: "Rivington Hark", contactDetails: null, centres: "Fareham", contact: null, status: "Fareham in Jan 2026 / Sheffield submitted", value: 200000, stage: inferStage("Fareham in Jan 2026 / Sheffield submitted") },
    { landlord: "Savills", contactDetails: null, centres: "Peterborough, Queensgate", contact: null, status: "Awaiting feedback", value: 200000, stage: inferStage("Awaiting feedback") },
    { landlord: "M Core", contactDetails: null, centres: "Cockhedge, Forum SC Walsend", contact: null, status: "Awaiting completion", value: 20000, stage: inferStage("Awaiting completion") },
    { landlord: "Estama", contactDetails: null, centres: "Festival Place Basingstoke", contact: null, status: "Meeting on 23RD 11am", value: 300000, stage: inferStage("Meeting on 23RD 11am") },
    { landlord: "Cited", contactDetails: "Will Ashdown <will@cited.co.uk>", centres: "Sailmaker, Ipswich and Wigan", contact: null, status: "Sailmaker, Ipswich plus other new centres in the new year", value: 300000, stage: inferStage("Sailmaker, Ipswich plus other new centres in the new year") },
    { landlord: "BC Asset Mgt", contactDetails: null, centres: "Eagles Meadow, Burnley and Stockton", contact: null, status: "Info received. Arrange visits", value: 100000, stage: inferStage("Info received. Arrange visits") },
    { landlord: "GM", contactDetails: null, centres: "Middleton Grange Hartlepool", contact: null, status: "Awaiting feedback", value: 80000, stage: inferStage("Awaiting feedback") },
    { landlord: "BNP Paribas", contactDetails: "Thomas Coulson <thomas.coulson@realestate.bnpparibas>", centres: "DSQ London", contact: null, status: "Awaiting a follow up from meeting on the 20th Nov", value: 30000, stage: inferStage("Awaiting a follow up from meeting on the 20th Nov") },
    { landlord: "Council", contactDetails: "victoria.nichol@cbre.com", centres: "Merseyside", contact: null, status: "Arrange a meeting onsite", value: 30000, stage: inferStage("Arrange a meeting onsite") },
    { landlord: "Richmond Council", contactDetails: "Fay Cannings <fay@richmondbid.london>", centres: "Richmond Town Centre / Elephant and Castle", contact: null, status: "Met on the 30th October", value: 30000, stage: inferStage("Met on the 30th October") },
    { landlord: "Global Mutual", contactDetails: null, centres: "Portfolio", contact: null, status: "Need to arrange", value: 0, stage: "LEAD" },
    { landlord: "Real Harbour Capital", contactDetails: null, centres: "Portfolio", contact: null, status: "New Agent", value: 0, stage: "LEAD" },
    { landlord: "Workman", contactDetails: "tony.elvin@touchwoodsolihull.co.uk / Helen Viner <Helen.Viner@touchwoodsolihull.co.uk>", centres: "Touchwood, Solihull", contact: null, status: "Visiting Highcross", value: 50000, stage: inferStage("Visiting Highcross") },
    { landlord: "Savills", contactDetails: null, centres: "Brewery Square", contact: null, status: "Amanda has visited", value: 20000, stage: inferStage("Amanda has visited") },
    { landlord: "Catela APAM", contactDetails: null, centres: "Mander Centre", contact: null, status: "Visited in Feb.", value: 120000, stage: inferStage("Visited in Feb.") },
    { landlord: "Frasers Group", contactDetails: null, centres: "St Nicholas, Lancaster", contact: null, status: "Paula Visiting on the 25th March", value: 30000, stage: inferStage("Paula Visiting on the 25th March") },
    { landlord: "M Core", contactDetails: null, centres: "Victoria Centre, Harrogate", contact: null, status: null, value: 75000, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Dolphin Centre", contact: null, status: "Emailed on the 11/3/26 to express interest in tender", value: 0, stage: inferStage("Emailed on the 11/3/26 to express interest in tender") },
    { landlord: null, contactDetails: null, centres: "Guildhall, Exeter", contact: null, status: "Contact Ginny", value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "County Mall, Crawley", contact: null, status: "Arrange a coffee", value: 0, stage: inferStage("Arrange a coffee") },
    { landlord: null, contactDetails: null, centres: "Beacon Place, Eastbourne", contact: "Mark.powell@thebeaconeastbourne.com", status: null, value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Braehead, Scotland", contact: null, status: null, value: 222000, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Kirkgate, Bradford", contact: null, status: null, value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Clacton Shopping Village", contact: null, status: null, value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "17 and Central, Walthamstow", contact: "gavin.cockayne@17andcentral.co.uk", status: "Gavin Cockayne (Centre Manager)", value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Swan Walk, Horsham", contact: null, status: "Gill Buchanan – Centre Manager", value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Harlequin, Watford", contact: null, status: "Simon Plumb – Centre Director", value: 0, stage: "LEAD" },
    { landlord: null, contactDetails: null, centres: "Southbank Place London and Clacton", contact: "chris@youraletheia.com", status: "Chris", value: 0, stage: "LEAD" },
]

// Location search terms to match against DB
const LOCATION_SEARCHES: Record<string, string> = {
    "Fareham": "Fareham Shopping Centre",
    "Peterborough, Queensgate": "Queensgate",
    "Cockhedge, Forum SC Walsend": "Cockhedge",
    "Festival Place Basingstoke": "Festival Place",
    "Sailmaker, Ipswich and Wigan": "Sailmaker",
    "Eagles Meadow, Burnley and Stockton": "Eagles Meadow",
    "Middleton Grange Hartlepool": "Middleton Grange",
    "DSQ London": "DSQ",
    "Touchwood, Solihull": "Touchwood",
    "Brewery Square": "Brewery Square",
    "Mander Centre": "Mander Centre",
    "St Nicholas, Lancaster": "St Nicholas",
    "Victoria Centre, Harrogate": "Victoria Centre",
    "Guildhall, Exeter": "Guildhall",
    "County Mall, Crawley": "County Mall",
    "Braehead, Scotland": "Braehead",
    "Kirkgate, Bradford": "Kirkgate",
    "Swan Walk, Horsham": "Swan Walk",
}

function parseContact(details: string | null, contactField: string | null): { name: string; email: string } | null {
    // Try contactDetails first: "Name <email>" or just "email"
    if (details) {
        const match = details.match(/^(.+?)\s*<(.+?)>/)
        if (match) return { name: match[1].trim(), email: match[2].trim() }
        if (details.includes("@")) return { name: "Unknown", email: details.trim() }
    }
    if (contactField) {
        if (contactField.includes("@")) return { name: "Unknown", email: contactField.trim() }
    }
    return null
}

async function seed() {
    console.log("🚀 Seeding CRM pipeline data...")

    // Find Paul's user
    const paul = await prisma.user.findUnique({ where: { email: PAUL_EMAIL } })
    if (!paul) {
        console.error("❌ Paul's user not found (paul@thisisflourish.co.uk)")
        process.exit(1)
    }
    console.log(`✅ Found Paul: ${paul.name} (${paul.id})`)

    let dealsCreated = 0
    let locationsLinked = 0
    let contactsCreated = 0
    let orgsCreated = 0

    for (const row of PIPELINE) {
        // 1. Find or create organisation
        let orgId: string | undefined
        if (row.landlord) {
            let org = await prisma.crmOrganisation.findFirst({
                where: { name: { equals: row.landlord, mode: "insensitive" } },
            })
            if (!org) {
                org = await prisma.crmOrganisation.create({ data: { name: row.landlord } })
                orgsCreated++
            }
            orgId = org.id
        }

        // 2. Create deal
        const deal = await prisma.crmDeal.create({
            data: {
                title: row.centres,
                stage: row.stage,
                value: row.value > 0 ? row.value : null,
                organisationId: orgId || null,
                ownerId: paul.id,
                notes: row.status || null,
            },
        })
        dealsCreated++

        // 3. Try to link locations from DB
        const searchTerm = LOCATION_SEARCHES[row.centres]
        if (searchTerm) {
            const locations = await prisma.location.findMany({
                where: { name: { contains: searchTerm, mode: "insensitive" } },
                select: { id: true, name: true, city: true },
                take: 1,
            })
            if (locations.length > 0) {
                await prisma.crmDealLocation.create({
                    data: {
                        dealId: deal.id,
                        locationId: locations[0].id,
                        locationName: locations[0].name,
                        locationCity: locations[0].city,
                    },
                })
                locationsLinked++
            } else {
                // Store as unlinked location
                await prisma.crmDealLocation.create({
                    data: {
                        dealId: deal.id,
                        locationName: row.centres,
                    },
                })
            }
        } else {
            // Store as unlinked location
            await prisma.crmDealLocation.create({
                data: {
                    dealId: deal.id,
                    locationName: row.centres,
                },
            })
        }

        // 4. Parse and create contacts
        const contact = parseContact(row.contactDetails, row.contact)
        if (contact) {
            const created = await prisma.crmContact.create({
                data: {
                    name: contact.name,
                    email: contact.email !== "test@test.com" ? contact.email : contact.email,
                    organisationId: orgId || null,
                },
            })
            await prisma.crmDealContact.create({
                data: { dealId: deal.id, contactId: created.id },
            })
            contactsCreated++
        }

        // 5. Log creation activity
        await prisma.crmActivity.create({
            data: {
                dealId: deal.id,
                userId: paul.id,
                type: "NOTE",
                content: `Deal imported from Pipeline 2026 spreadsheet${row.status ? `: ${row.status}` : ""}`,
            },
        })

        console.log(`  ✅ ${row.centres} → ${row.stage} ${row.value > 0 ? `(£${row.value.toLocaleString()})` : ""}`)
    }

    console.log("\n📊 Summary:")
    console.log(`  Deals: ${dealsCreated}`)
    console.log(`  Organisations: ${orgsCreated}`)
    console.log(`  Locations linked: ${locationsLinked}`)
    console.log(`  Contacts: ${contactsCreated}`)

    await prisma.$disconnect()
}

seed().catch(console.error)
