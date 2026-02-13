# Data Model Reference

## Overview

Prisma ORM 5.x targeting PostgreSQL. Schema at `prisma/schema.prisma` (305 lines, 12 models).

---

## Core Business Models

### Location

The central model. 90+ fields organised into 8 enrichment tiers.

| Tier | Fields | Purpose |
|------|--------|---------|
| **Core** | `name`, `type`, `address`, `city`, `county`, `postcode` | Identity and geography |
| **Geo** | `latitude`, `longitude` (Decimal) | Map positioning |
| **Operational** | `parkingSpaces`, `totalFloorArea`, `numberOfStores`, `numberOfFloors`, `anchorTenants`, `publicTransit`, `openingHours` (JSON) | Physical attributes |
| **Commercial** | `healthIndex`, `vacancy`, `vacancyGrowth`, `persistentVacancy`, `vacantUnits`, `percentMultiple`, `percentIndependent`, `qualityOffer*`, `floorspaceVacancy*` | Market health KPIs |
| **Management** | `owner`, `management`, `managementContact`, `managementEmail`, `managementPhone`, `regionalManager`, `isManaged` | Ownership and management |
| **Digital** | `website`, `phone`, `instagram`, `facebook`, `youtube`, `tiktok`, `twitter` | Online presence |
| **Reviews** | `googleRating`, `googleReviews`, `facebookRating`, `facebookReviews` | Online reputation |
| **Demographic** | `population`, `medianAge`, `familiesPercent`, `seniorsPercent`, `avgHouseholdIncome`, `incomeVsNational`, `homeownership`, `carOwnership` | Catchment area data |

Additional fields: `seoKeywords` (JSON), `topPages` (JSON), `heroImage`, `openedYear`, `evCharging`, `evChargingSpaces`, `footfall`, `retailers`, `carParkPrice`, `retailSpace`.

Standardised address fields: `street`, `town`, `district`, `region`, `country`.

**Enum:** `LocationType` = `SHOPPING_CENTRE` | `RETAIL_PARK` | `OUTLET_CENTRE` | `HIGH_STREET`

**Relations:** Has many `Tenant` (cascade delete)

---

### Tenant

A store/unit within a location.

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Tenant name |
| `category` | String | Raw category string |
| `subcategory` | String? | Optional subcategory |
| `unitNumber` | String? | Physical unit number |
| `floor` | Int? | Floor level |
| `isAnchorTenant` | Boolean | Default false |
| `categoryId` | String? | FK to normalised Category |

**Unique constraint:** `[locationId, name]`
**Relations:** Belongs to `Location`, optionally belongs to `Category`

---

### Category

Normalised taxonomy with self-referencing hierarchy.

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Unique category name |
| `description` | String? | Optional description |
| `parentCategoryId` | String? | Self-referencing FK |

**Relations:** Has many `Tenant`, self-referencing parent/children

---

### EnrichmentSnapshot

Tracks data completeness over time for dashboard reporting.

| Field | Type | Notes |
|-------|------|-------|
| `totalLocations` | Int | Total location count |
| `coreComplete` | Int | Locations with core data |
| `geoComplete` | Int | Locations with valid coordinates |
| `operationalComplete` | Int | Locations with operational data |
| `commercialComplete` | Int | Locations with KPI data |
| `digitalComplete` | Int | Locations with digital presence |
| `demographicComplete` | Int | Locations with demographic data |
| `fieldStats` | Json | Per-field filled/empty counts |

---

## Auth Models (BetterAuth)

### User
`id` (String PK), `email` (unique), `name?`, `role` (Role enum), `emailVerified`, `image?`
**Enum:** `Role` = `USER` | `ADMIN` | `REGIONAL_MANAGER`

### Session
`id`, `userId` (FK→User), `token` (unique), `expiresAt`, `ipAddress?`, `userAgent?`

### Account
`id`, `userId` (FK→User), `providerId`, `accountId`, `accessToken?`, `password?`

### Verification
`id`, `identifier`, `value`, `expiresAt` — For email verification tokens.

### Organization
`id`, `name`, `slug` (unique), `logo?`, `metadata?` — BetterAuth organization plugin.

### Member
`id`, `organizationId` (FK→Organization), `userId` (FK→User), `role`

### Invitation
`id`, `organizationId`, `email`, `role?`, `status`, `expiresAt`, `inviterId` (FK→User)

### ContactSubmission
`id`, `name`, `email`, `phone?`, `enquiryType`, `message` — Contact form entries.

---

## Key Patterns

### Decimal Handling
Prisma returns `Decimal` objects. Convert to `number` before passing to React:
```typescript
Number(location.latitude)
parseFloat(location.healthIndex?.toString() || "0")
```

### JSON Fields
`openingHours`, `seoKeywords`, `topPages`, `fieldStats` are typed as `Json` in Prisma.
Cast to typed interfaces in consuming code.

### Enrichment Tier Logic
Defined in `src/lib/enrichment-metrics.ts`. A location is "tier complete" when all required fields for that tier are non-null and valid (e.g., latitude ≠ 0 for Geo tier).
