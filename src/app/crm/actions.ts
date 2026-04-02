"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { DealStage, CrmActivityType } from "@prisma/client"

// ── Auth helper ──────────────────────────────────────────
async function verifyCrmAccess() {
    const session = await auth.api.getSession({ headers: await headers() })
    if (!session?.user) throw new Error("Unauthorized")
    // For now, only ADMIN can access CRM. Future: allow REGIONAL_MANAGER
    if ((session.user as any).role !== "ADMIN") throw new Error("CRM access requires Admin role")
    return session.user as { id: string; name: string | null; email: string; role: string }
}

// ── Deals ────────────────────────────────────────────────

export async function getDeals(ownerId?: string) {
    const user = await verifyCrmAccess()
    const where = ownerId ? { ownerId } : { ownerId: user.id }

    return prisma.crmDeal.findMany({
        where,
        include: {
            organisation: { select: { id: true, name: true } },
            locations: { select: { id: true, locationName: true, locationCity: true, locationId: true } },
            contacts: { include: { contact: { select: { id: true, name: true, email: true } } } },
            followUps: { where: { completed: false }, select: { id: true, dueDate: true, description: true } },
            _count: { select: { activities: true } },
        },
        orderBy: { updatedAt: "desc" },
    })
}

export async function getAllDeals() {
    await verifyCrmAccess()
    return prisma.crmDeal.findMany({
        include: {
            organisation: { select: { id: true, name: true } },
            owner: { select: { id: true, name: true } },
            locations: { select: { id: true, locationName: true, locationCity: true, locationId: true } },
            followUps: { where: { completed: false }, select: { id: true, dueDate: true, description: true } },
            _count: { select: { activities: true } },
        },
        orderBy: { updatedAt: "desc" },
    })
}

export async function getDeal(dealId: string) {
    await verifyCrmAccess()
    return prisma.crmDeal.findUnique({
        where: { id: dealId },
        include: {
            organisation: true,
            owner: { select: { id: true, name: true, email: true } },
            locations: {
                include: {
                    location: {
                        select: {
                            id: true, name: true, city: true, type: true,
                            footfall: true, numberOfStores: true, vacancy: true,
                            owner: true, management: true, googleRating: true,
                        },
                    },
                },
            },
            contacts: { include: { contact: true } },
            activities: {
                include: { user: { select: { id: true, name: true } } },
                orderBy: { createdAt: "desc" },
            },
            followUps: { orderBy: { dueDate: "asc" } },
        },
    })
}

export async function createDeal(data: {
    title: string
    stage?: DealStage
    value?: number
    organisationName?: string
    notes?: string
    locations?: { locationId?: string; locationName: string; locationCity?: string }[]
    contacts?: { name: string; email?: string; phone?: string; linkedin?: string; jobTitle?: string }[]
}) {
    const user = await verifyCrmAccess()

    // Find or create organisation
    let organisationId: string | undefined
    if (data.organisationName?.trim()) {
        let org = await prisma.crmOrganisation.findFirst({
            where: { name: { equals: data.organisationName.trim(), mode: "insensitive" } },
        })
        if (!org) {
            org = await prisma.crmOrganisation.create({ data: { name: data.organisationName.trim() } })
        }
        organisationId = org.id
    }

    const deal = await prisma.crmDeal.create({
        data: {
            title: data.title,
            stage: data.stage || "LEAD",
            value: data.value || null,
            organisationId,
            ownerId: user.id,
            notes: data.notes || null,
            locations: data.locations?.length
                ? {
                    create: data.locations.map((loc) => ({
                        locationId: loc.locationId || null,
                        locationName: loc.locationName,
                        locationCity: loc.locationCity || null,
                    })),
                }
                : undefined,
        },
    })

    // Create contacts and link to deal
    if (data.contacts?.length) {
        for (const c of data.contacts) {
            const contact = await prisma.crmContact.create({
                data: {
                    name: c.name,
                    email: c.email || null,
                    phone: c.phone || null,
                    linkedin: c.linkedin || null,
                    jobTitle: c.jobTitle || null,
                    organisationId,
                },
            })
            await prisma.crmDealContact.create({
                data: { dealId: deal.id, contactId: contact.id },
            })
        }
    }

    // Log creation activity
    await prisma.crmActivity.create({
        data: {
            dealId: deal.id,
            userId: user.id,
            type: "NOTE",
            content: `Deal created in ${data.stage || "LEAD"} stage`,
        },
    })

    revalidatePath("/crm")
    return deal
}

export async function updateDeal(dealId: string, data: {
    title?: string
    value?: number | null
    notes?: string | null
    lostReason?: string | null
}) {
    await verifyCrmAccess()
    await prisma.crmDeal.update({ where: { id: dealId }, data })
    revalidatePath("/crm")
    revalidatePath(`/crm/${dealId}`)
}

export async function updateDealStage(dealId: string, stage: DealStage) {
    const user = await verifyCrmAccess()

    const deal = await prisma.crmDeal.findUnique({ where: { id: dealId } })
    if (!deal) throw new Error("Deal not found")

    const oldStage = deal.stage

    await prisma.crmDeal.update({
        where: { id: dealId },
        data: {
            stage,
            stageChangedAt: new Date(),
            closedAt: stage === "WON" || stage === "LOST" ? new Date() : null,
        },
    })

    // Log stage change
    await prisma.crmActivity.create({
        data: {
            dealId,
            userId: user.id,
            type: "STAGE_CHANGE",
            content: `Stage changed from ${oldStage.replace("_", " ")} to ${stage.replace("_", " ")}`,
        },
    })

    revalidatePath("/crm")
    revalidatePath(`/crm/${dealId}`)
}

export async function deleteDeal(dealId: string) {
    await verifyCrmAccess()
    await prisma.crmDeal.delete({ where: { id: dealId } })
    revalidatePath("/crm")
}

// ── Locations search ─────────────────────────────────────

export async function searchLocations(query: string) {
    if (!query || query.length < 2) return []
    await verifyCrmAccess()

    return prisma.location.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: "insensitive" } },
                { city: { contains: query, mode: "insensitive" } },
                { town: { contains: query, mode: "insensitive" } },
                { postcode: { contains: query, mode: "insensitive" } },
            ],
        },
        select: {
            id: true, name: true, city: true, type: true,
            footfall: true, numberOfStores: true, owner: true, management: true,
        },
        take: 10,
        orderBy: { name: "asc" },
    })
}

// ── Organisation search ──────────────────────────────────

export async function searchOrganisations(query: string) {
    if (!query || query.length < 2) return []
    await verifyCrmAccess()

    // Search CRM organisations
    const crmOrgs = await prisma.crmOrganisation.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 5,
    })

    // Search location owner/management fields for suggestions
    const ownerResults = await prisma.location.findMany({
        where: { owner: { contains: query, mode: "insensitive" } },
        select: { owner: true },
        distinct: ["owner"],
        take: 5,
    })

    const mgmtResults = await prisma.location.findMany({
        where: { management: { contains: query, mode: "insensitive" } },
        select: { management: true },
        distinct: ["management"],
        take: 5,
    })

    // Combine and deduplicate
    const suggestions = new Map<string, { id?: string; name: string; source: string }>()
    crmOrgs.forEach((o) => suggestions.set(o.name.toLowerCase(), { id: o.id, name: o.name, source: "crm" }))
    ownerResults.forEach((o) => {
        if (o.owner && !suggestions.has(o.owner.toLowerCase())) {
            suggestions.set(o.owner.toLowerCase(), { name: o.owner, source: "owner" })
        }
    })
    mgmtResults.forEach((m) => {
        if (m.management && !suggestions.has(m.management.toLowerCase())) {
            suggestions.set(m.management.toLowerCase(), { name: m.management, source: "management" })
        }
    })

    return Array.from(suggestions.values()).slice(0, 10)
}

// ── Contacts ─────────────────────────────────────────────

export async function addContactToDeal(dealId: string, data: {
    name: string; email?: string; phone?: string; linkedin?: string; jobTitle?: string
}) {
    const user = await verifyCrmAccess()
    const deal = await prisma.crmDeal.findUnique({ where: { id: dealId }, select: { organisationId: true } })
    if (!deal) throw new Error("Deal not found")

    const contact = await prisma.crmContact.create({
        data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            linkedin: data.linkedin || null,
            jobTitle: data.jobTitle || null,
            organisationId: deal.organisationId,
        },
    })

    await prisma.crmDealContact.create({ data: { dealId, contactId: contact.id } })

    // Log activity
    await prisma.crmActivity.create({
        data: { dealId, userId: user.id, type: "NOTE", content: `Contact added: ${data.name}` },
    })

    revalidatePath(`/crm/${dealId}`)
    return contact
}

// ── Activities ───────────────────────────────────────────

export async function addActivity(dealId: string, type: CrmActivityType, content: string) {
    const user = await verifyCrmAccess()
    const activity = await prisma.crmActivity.create({
        data: { dealId, userId: user.id, type, content },
    })
    revalidatePath(`/crm/${dealId}`)
    return activity
}

// ── Follow-ups ───────────────────────────────────────────

export async function createFollowUp(dealId: string, data: { dueDate: string; description: string }) {
    const user = await verifyCrmAccess()
    const followUp = await prisma.crmFollowUp.create({
        data: {
            dealId,
            userId: user.id,
            dueDate: new Date(data.dueDate),
            description: data.description,
        },
    })
    revalidatePath(`/crm/${dealId}`)
    revalidatePath("/crm")
    return followUp
}

export async function completeFollowUp(followUpId: string) {
    await verifyCrmAccess()
    await prisma.crmFollowUp.update({
        where: { id: followUpId },
        data: { completed: true, completedAt: new Date() },
    })
    revalidatePath("/crm")
}

// ── Notification Settings ────────────────────────────────

export async function getNotificationSettings() {
    const user = await verifyCrmAccess()
    return prisma.crmNotificationSettings.findUnique({ where: { userId: user.id } })
}

export async function updateNotificationSettings(data: { digestEnabled: boolean; digestTime?: string }) {
    const user = await verifyCrmAccess()
    return prisma.crmNotificationSettings.upsert({
        where: { userId: user.id },
        update: { digestEnabled: data.digestEnabled, digestTime: data.digestTime },
        create: { userId: user.id, digestEnabled: data.digestEnabled, digestTime: data.digestTime || "07:00" },
    })
}

// ── Pipeline Stats ───────────────────────────────────────

export async function getPipelineStats(ownerId?: string) {
    const user = await verifyCrmAccess()
    const where = ownerId ? { ownerId } : { ownerId: user.id }

    const deals = await prisma.crmDeal.findMany({
        where,
        select: { stage: true, value: true },
    })

    const stages = Object.values(DealStage)
    const stats = stages.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage)
        return {
            stage,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, d) => sum + (d.value || 0), 0),
        }
    })

    return {
        totalDeals: deals.length,
        totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
        activeValue: deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST").reduce((sum, d) => sum + (d.value || 0), 0),
        stages: stats,
    }
}

// ── Add location to existing deal ────────────────────────

export async function addLocationToDeal(dealId: string, data: {
    locationId?: string; locationName: string; locationCity?: string
}) {
    await verifyCrmAccess()
    await prisma.crmDealLocation.create({
        data: {
            dealId,
            locationId: data.locationId || null,
            locationName: data.locationName,
            locationCity: data.locationCity || null,
        },
    })
    revalidatePath(`/crm/${dealId}`)
    revalidatePath("/crm")
}
