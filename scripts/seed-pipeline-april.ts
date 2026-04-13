/**
 * Seed Paul's Pipeline 2026 April data into the CRM
 * This replaces all existing CRM data with the latest pipeline spreadsheet.
 * Run: npx tsx scripts/seed-pipeline-april.ts
 */
import { PrismaClient, DealStage } from "@prisma/client"
import * as XLSX from "xlsx"

const prisma = new PrismaClient()
const PAUL_EMAIL = "paul@thisisflourish.co.uk"
const FILE_PATH = "/Users/mbeckett/Downloads/Pipeline 2026 April.xlsx"

// ── Contact parser ───────────────────────────────────────
// Handles formats like: "Name  email@domain.com", "Name <email@domain.com>", "email@domain.com"
function parseContact(raw: string | null): { name: string; email: string | null; jobTitle?: string } | null {
    if (!raw || raw.trim() === "" || raw === "Need to get contact") return null

    const s = raw.trim()

    // "Name <email>" format
    const angleBracket = s.match(/^(.+?)\s*<(.+?)>/)
    if (angleBracket) {
        return { name: angleBracket[1].trim(), email: angleBracket[2].trim() }
    }

    // "Name  email@domain" format (2+ spaces or tab between name and email)
    const spaced = s.match(/^(.+?)\s{2,}(\S+@\S+)/)
    if (spaced) {
        return { name: spaced[1].trim(), email: spaced[2].trim() }
    }

    // Just an email
    if (s.includes("@") && !s.includes(" ")) {
        return { name: "Unknown", email: s }
    }

    // Just a name
    return { name: s, email: null }
}

// Parse multiple contacts from a single cell (separated by / or  and)
function parseContacts(raw: string | null): { name: string; email: string | null }[] {
    if (!raw) return []

    // Handle "Name <email>   Name2 <email2>" (multiple angle-bracket contacts)
    const multiAngle = [...raw.matchAll(/([^<>]+?)\s*<([^>]+)>/g)]
    if (multiAngle.length > 1) {
        return multiAngle.map(m => ({ name: m[1].trim(), email: m[2].trim() }))
    }

    // Handle " / " separator
    if (raw.includes(" / ")) {
        return raw.split(" / ").map(s => parseContact(s)).filter(Boolean) as any[]
    }

    const single = parseContact(raw)
    return single ? [single] : []
}

// ── Stage inference ─────────────────────────────────────
function inferStage(status: string | null, followUp: string | null): DealStage {
    if (!status && !followUp) return "LEAD"
    const s = (status || "").toLowerCase()
    const f = (followUp || "").toLowerCase()

    if (s.includes("won") || s === "won") return "WON"
    if (s.includes("lost")) return "LOST"

    if (s.includes("pitch") || s.includes("proposal") || s.includes("tender")) return "PROPOSAL_SENT"
    if (s.includes("green light") || s.includes("agreed") || s.includes("completing") || s.includes("completion")) return "NEGOTIATION"

    if (s.includes("visit") || s.includes("meeting") || s.includes("met ") || s.includes("onsite") || s.includes("call on") || s.includes("coffee")) return "MEETING_SCHEDULED"

    if (s.includes("emailed") || s.includes("email") || s.includes("sent") || s.includes("message sent") || s.includes("awaiting") || s.includes("feedback") || s.includes("submitted") || s.includes("express interest") || s.includes("reached out") || s.includes("follow up") || s.includes("review")) return "CONTACTED"

    if (s.includes("contact") || s.includes("need to") || s.includes("new agent")) return "LEAD"

    return "LEAD"
}

// ── Location search map ─────────────────────────────────
const LOCATION_SEARCHES: Record<string, string[]> = {
    "Fareham": ["Fareham"],
    "Peterborough , Queensgate": ["Queensgate"],
    "Cockhedge - Centre": ["Cockhedge"],
    "Victoria Centre, Harrogate": ["Victoria", "Harrogate"],
    "Walsend": ["Forum"],
    "Festival Place Basingstoke": ["Festival Place"],
    "Grand Arcade, Wigan": ["Grand Arcade"],
    "Sailmaker": ["Sailmaker"],
    "Middleton Grange Hartleypool": ["Middleton Grange"],
    "Stockton, Wellington Square": ["Wellington Square"],
    "Eagles Meadow Wrexham": ["Eagles Meadow"],
    "Burnley": ["Charter Walk"],
    "Richmond Town Centre / Elephant and Castle": ["Richmond"],
    "Touchwood": ["Touchwood"],
    "Braehead, Scotland": ["Braehead"],
    "Dalton Park, Seaham": ["Dalton Park"],
    "Brewery Square": ["Brewery Square"],
    "Mander Centre Wolverhmapton": ["Mander Centre"],
    "St Nicholas, Lancaster": ["St Nicholas"],
    "Dolphin Centre": ["Dolphin"],
    "Guildhall , Exeter": ["Guildhall"],
    "County Mall, Crawley": ["County Mall"],
    "Beacon Place , Eastbourne": ["Beacon"],
    "Ankerside": ["Ankerside"],
    "Ocean Terminal": ["Ocean Terminal"],
}

// Parse follow-up date from text like "April 15th", "May 2nd", "10th April", "APRIL 20TH"
function parseFollowUpDate(text: string | null): Date | null {
    if (!text || typeof text === "number") {
        // Excel serial date
        if (typeof text === "number") {
            const epoch = new Date(1899, 11, 30)
            epoch.setDate(epoch.getDate() + (text as number))
            return epoch
        }
        return null
    }

    const s = text.trim().toLowerCase()
    if (!s) return null

    const months: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
        jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    }

    // "April 15th" / "May 2nd" / "APRIL 20TH"
    const m1 = s.match(/^(\w+)\s+(\d+)(?:st|nd|rd|th)?/)
    if (m1 && months[m1[1]] !== undefined) {
        return new Date(2026, months[m1[1]], parseInt(m1[2]))
    }

    // "10th April" / "8th April"
    const m2 = s.match(/^(\d+)(?:st|nd|rd|th)?\s+(\w+)/)
    if (m2 && months[m2[2]] !== undefined) {
        return new Date(2026, months[m2[2]], parseInt(m2[1]))
    }

    // "Review May 2026" / "Review May"
    const m3 = s.match(/(?:review\s+)?(\w+)\s*(\d{4})?/)
    if (m3 && months[m3[1]] !== undefined) {
        const year = m3[2] ? parseInt(m3[2]) : 2026
        return new Date(year, months[m3[1]], 1)
    }

    return null
}

async function seed() {
    console.log("🚀 Seeding CRM pipeline from April 2026 spreadsheet...")

    // Find Paul
    const paul = await prisma.user.findUnique({ where: { email: PAUL_EMAIL } })
    if (!paul) {
        console.error("❌ Paul not found (paul@thisisflourish.co.uk)")
        process.exit(1)
    }
    console.log(`✅ Found Paul: ${paul.name} (${paul.id})`)

    // Read spreadsheet
    const wb = XLSX.readFile(FILE_PATH)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null }) as any[][]

    // Skip header (row 0 = blank, row 1 = headers), data starts row 2
    // Stop at row 34 (total row) or empty centre field
    const dataRows = raw.slice(2).filter(r => r[3] && String(r[3]).trim() !== "")

    console.log(`📄 Found ${dataRows.length} data rows\n`)

    // Clear existing CRM data (cascade handles related records)
    console.log("🧹 Clearing existing CRM data...")
    await prisma.crmActivity.deleteMany({})
    await prisma.crmFollowUp.deleteMany({})
    await prisma.crmDealContact.deleteMany({})
    await prisma.crmDealLocation.deleteMany({})
    await prisma.crmDeal.deleteMany({})
    await prisma.crmContact.deleteMany({})
    await prisma.crmOrganisation.deleteMany({})
    console.log("✅ Cleared\n")

    let stats = { deals: 0, orgs: 0, locations: 0, contacts: 0, followUps: 0 }

    for (const row of dataRows) {
        const landlord = row[1] ? String(row[1]).trim() : null
        const contactDetails = row[2] ? String(row[2]).trim() : null
        const centreName = String(row[3]).trim()
        const contactField = row[4] ? String(row[4]).trim() : null
        const statusNotes = row[5] ? String(row[5]).trim() : null
        const followUpRaw = row[6]
        const value = typeof row[7] === "number" ? row[7] : null

        // Some rows have the email in the centre column (row 28 quirk)
        // Detect: if centreName looks like an email, fix it
        if (centreName.includes("@") && !centreName.includes(" ")) {
            console.log(`  ⚠️ Skipping malformed row (email in centre col): ${centreName}`)
            continue
        }

        const stage = inferStage(statusNotes, typeof followUpRaw === "string" ? followUpRaw : null)

        // 1. Find or create organisation
        let orgId: string | undefined
        if (landlord) {
            let org = await prisma.crmOrganisation.findFirst({
                where: { name: { equals: landlord, mode: "insensitive" } },
            })
            if (!org) {
                org = await prisma.crmOrganisation.create({ data: { name: landlord } })
                stats.orgs++
            }
            orgId = org.id
        }

        // 2. Create deal
        const deal = await prisma.crmDeal.create({
            data: {
                title: centreName,
                stage,
                value: value && value > 0 ? value : null,
                organisationId: orgId || null,
                ownerId: paul.id,
                notes: statusNotes || null,
            },
        })
        stats.deals++

        // 3. Link locations from DB
        const searches = LOCATION_SEARCHES[centreName]
        let linked = false
        if (searches) {
            for (const term of searches) {
                const locations = await prisma.location.findMany({
                    where: { name: { contains: term, mode: "insensitive" } },
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
                    stats.locations++
                    linked = true
                    break
                }
            }
        }
        if (!linked) {
            await prisma.crmDealLocation.create({
                data: { dealId: deal.id, locationName: centreName },
            })
        }

        // 4. Parse contacts (from col 4 primarily, col 2 as fallback)
        const contacts = parseContacts(contactField) || []
        // Also check col 2 for additional contacts not in col 4
        if (contactDetails && contactDetails !== centreName) {
            const extraContacts = parseContacts(contactDetails)
            for (const ec of extraContacts) {
                if (!contacts.some(c => c.email === ec.email && c.name === ec.name)) {
                    contacts.push(ec)
                }
            }
        }

        for (const c of contacts) {
            const existing = c.email
                ? await prisma.crmContact.findFirst({ where: { email: { equals: c.email, mode: "insensitive" } } })
                : null

            const contact = existing || await prisma.crmContact.create({
                data: {
                    name: c.name,
                    email: c.email,
                    organisationId: orgId || null,
                },
            })
            if (!existing) stats.contacts++

            await prisma.crmDealContact.create({
                data: { dealId: deal.id, contactId: contact.id },
            }).catch(() => {}) // Ignore dupe
        }

        // 5. Create follow-up if date exists
        const followUpDate = parseFollowUpDate(followUpRaw)
        if (followUpDate) {
            await prisma.crmFollowUp.create({
                data: {
                    dealId: deal.id,
                    userId: paul.id,
                    dueDate: followUpDate,
                    description: typeof followUpRaw === "string"
                        ? `Follow up: ${followUpRaw.trim()}`
                        : `Follow up: ${followUpDate.toLocaleDateString("en-GB")}`,
                },
            })
            stats.followUps++
        }

        // 6. Log import activity
        await prisma.crmActivity.create({
            data: {
                dealId: deal.id,
                userId: paul.id,
                type: "NOTE",
                content: `Imported from Pipeline 2026 April${statusNotes ? `: ${statusNotes}` : ""}`,
            },
        })

        const stageEmoji = stage === "WON" ? "🏆" : stage === "LOST" ? "❌" : "✅"
        console.log(`  ${stageEmoji} ${centreName} → ${stage}${value ? ` (£${value.toLocaleString()})` : ""}`)
    }

    console.log("\n📊 Import Summary:")
    console.log(`  Deals:      ${stats.deals}`)
    console.log(`  Orgs:       ${stats.orgs}`)
    console.log(`  Locations:  ${stats.locations} linked to DB`)
    console.log(`  Contacts:   ${stats.contacts}`)
    console.log(`  Follow-ups: ${stats.followUps}`)

    await prisma.$disconnect()
}

seed().catch(console.error)
