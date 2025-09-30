import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"
import { PrismaClient, LocationType } from "@prisma/client"

const prisma = new PrismaClient()

// Simple alias map to resolve variant names to our canonical Location.name values
const LOCATION_NAME_ALIASES: Record<string, string> = {
  "Fengate Retail Cluster (St David’s Square Trade Park & Adjacent)": "Fengate Retail Park",
  "Fengate Retail Cluster (St David's Square Trade Park & Adjacent)": "Fengate Retail Park",
  "Serpentine Green Shopping Centre": "Serpentine Green",
  "Orton Southgate (no dedicated shopping centre)": "Ortongate Shopping Centre",
}

function resolveAliasedName(raw: string): string {
  const trimmed = (raw || "").trim()
  return LOCATION_NAME_ALIASES[trimmed] || trimmed
}

function num(v: any): number | null {
  if (v === undefined || v === null || v === "") return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

function boolish(v: any): boolean {
  if (typeof v === "boolean") return v
  const s = String(v || "").toLowerCase()
  return s === "true" || s === "yes" || s === "1"
}

function toType(v: string | undefined): LocationType | undefined {
  if (!v) return undefined
  const t = v.toUpperCase().replace(/\s+/g, "_")
  if (t in LocationType) return t as LocationType
  return undefined
}

async function upsertCategory(name: string | undefined | null): Promise<string | null> {
  if (!name) return null
  const clean = String(name).trim()
  if (!clean) return null
  const cat = await prisma.category.upsert({
    where: { name: clean },
    create: { name: clean },
    update: {},
  })
  return cat.id
}

async function importCentres(csvPath: string) {
  const content = fs.readFileSync(csvPath, "utf8")
  const rows = parse(content, { columns: true, skip_empty_lines: true }) as any[]
  let upserts = 0
  for (const r of rows) {
    const type = toType(r.type)
    const lat = num(r.latitude)
    const lon = num(r.longitude)
    let opening: any = undefined
    if (r.openingHours_json) {
      try { opening = JSON.parse(r.openingHours_json) } catch {}
    }

    const existing = await prisma.location.findFirst({ where: { name: r.name } })
    if (existing) {
      await prisma.location.update({
        where: { id: existing.id },
        data: {
          type: type ?? undefined,
          address: r.address || undefined,
          city: r.city || undefined,
          county: r.county || undefined,
          postcode: r.postcode || undefined,
          website: r.website || undefined,
          phone: r.phone || undefined,
          latitude: lat ?? undefined,
          longitude: lon ?? undefined,
          numberOfStores: num(r.numberOfStores_published) ?? undefined,
          parkingSpaces: num(r.parkingSpaces) ?? undefined,
          publicTransit: r.publicTransit || undefined,
          googleRating: num(r.googleRating) ?? undefined,
          googleReviews: num(r.googleReviews) ?? undefined,
          openingHours: opening,
        },
      })
    } else {
      await prisma.location.create({
        data: {
          name: r.name,
          type: type ?? LocationType.RETAIL_PARK,
          address: r.address || "",
          city: r.city || "",
          county: r.county || "",
          postcode: r.postcode || "",
          website: r.website || null,
          phone: r.phone || null,
          latitude: lat ?? 0,
          longitude: lon ?? 0,
          numberOfStores: num(r.numberOfStores_published) ?? undefined,
          parkingSpaces: num(r.parkingSpaces) ?? undefined,
          publicTransit: r.publicTransit || null,
          googleRating: num(r.googleRating) ?? undefined,
          googleReviews: num(r.googleReviews) ?? undefined,
          openingHours: opening,
        },
      })
    }
    upserts++
  }
  console.log(`Centres upserted: ${upserts}`)
}

async function importTenants(csvPath: string) {
  const content = fs.readFileSync(csvPath, "utf8")
  const rows = parse(content, { columns: true, skip_empty_lines: true }) as any[]
  let created = 0
  for (const r of rows) {
    const rawName = r.centre_name || r.centre || r.location || r.centre_name_normalized || r.centreName || ""
    const centreName = resolveAliasedName(rawName)
    if (!centreName) continue
    // Try exact match first
    let loc = await prisma.location.findFirst({ where: { name: { equals: centreName } }, select: { id: true } })
    // If not found, try a few common variants for safety (Shopping Centre / Retail Park suffixes)
    if (!loc) {
      const variants = [
        centreName,
        `${centreName} Shopping Centre`,
        `${centreName} Retail Park`,
      ]
      loc = await prisma.location.findFirst({ where: { name: { in: variants } }, select: { id: true } })
    }
    if (!loc) {
      console.warn(`Skipping tenant for unknown centre: ${centreName} -> ${r.store_name || r.storeName || r.name}`)
      continue
    }

    const normalized = r.normalized_category || r.categoryId || r.category || r.category_raw || r.normalizedCategoryId || r.categoryRaw
    const categoryId = await upsertCategory(normalized)

    await prisma.tenant.create({
      data: {
        locationId: loc.id,
        name: r.store_name || r.name || r.storeName,
        category: r.category_raw || r.categoryRaw || normalized || "Uncategorized",
        subcategory: r.subcategory_raw || r.subcategoryRaw || null,
        unitNumber: r.unit || r.unit_number || r.unitNumber || null,
        floor: num(r.floor) ?? undefined,
        isAnchorTenant: boolish(r.isAnchorTenant),
        categoryId: categoryId ?? undefined,
      },
    })
    created++
  }
  console.log(`Tenants created from ${path.basename(csvPath)}: ${created}`)
}

async function main() {
  const centres = path.resolve("public/peterborough_centres_summary.csv")
  const tenantsA = path.resolve("public/peterborough_tenants_full_first10.csv")
  const tenantsB = path.resolve("public/peterborough_tenants_full_last9.csv")
  const tenantsSubset = path.resolve("public/peterborough_tenants_subset.csv")
  const extra = [
    "boongate_retail_park_tenant_directory.csv",
    "bretton_centre_tenants_full.csv",
    "bretton_centre_full_35stores.csv",
    "brotherhood_retail_park_tenant_directory.csv",
    "deeping_shopping_centre_tenant_directory.csv",
    "discovery_business_park_tenant_directory.csv",
    "fengate_retail_cluster_tenant_directory.csv",
    "hereward_cross_shopping_centre_tenant_directory.csv",
    "maskew_avenue_retail_park_tenant_directory.csv",
    "orton_southgate_shopping_centre_corrected.csv",
    "ortongate_shopping_centre_tenant_directory.csv",
    "peterborough_one_retail_park_tenant_directory.csv",
    "peterborough_trade_centre_retail_park_tenant_directory.csv",
    "pyramid_shopping_centre_tenant_directory.csv",
    "serpentine_green_tenant_directory.csv",
    "serpentine_green_full_40stores.csv",
    "stanground_cardea_tenant_directory.csv",
    "werrington_centre_tenant_directory.csv",
  ]

  console.log("Importing centres…")
  await importCentres(centres)

  console.log("Importing tenants (batch A)…")
  await importTenants(tenantsA)
  console.log("Importing tenants (batch B)…")
  await importTenants(tenantsB)
  console.log("Importing tenants (subset smoke)…")
  await importTenants(tenantsSubset)
  console.log("Importing additional directories…")
  for (const file of extra) {
    const p = path.resolve(`public/${file}`)
    if (fs.existsSync(p)) {
      try {
        await importTenants(p)
      } catch (e) {
        console.warn(`Skipping ${file}:`, (e as Error).message)
      }
    }
  }

  console.log("Done.")
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect() })


