# Operator Registry — Implementation Plan

> Add a proper Operator entity to Flourish so every space booking links to a pre-registered, compliance-tracked operator.

---

## Background

Currently `SpaceBooking` stores company/contact info inline (`companyName`, `contactName`, etc.). This means:
- No centralized operator records across bookings
- No compliance tracking (licenses, insurance, credit checks)
- No way to know if an operator's documents are expired

The Spacebook research showed a dedicated "My Operators" module with Companies House check, Credit Check, and Xero status fields. We're building a richer version.

---

## User Review Required

> [!IMPORTANT]
> **Breaking change to booking flow**: After this change, all new bookings **must** select a pre-registered operator. Existing bookings with inline company data will be preserved as-is (not migrated), but the booking modal will switch to an operator picker.

> [!NOTE]
> **Deferred items** (noted for future phases):
> - Companies House API integration (user has done this before on other projects)
> - Xero integration for operator financial status
> - Automated license expiry email notifications (admin notification UI is in scope, automated emails are not)

---

## Proposed Changes

### Prisma Schema

#### [MODIFY] [schema.prisma](file:///Users/mbeckett/Documents/codeprojects/flourish/prisma/schema.prisma)

**New models:**

```prisma
model Operator {
  id                  String              @id @default(cuid())
  companyName         String
  tradingName         String?
  contactName         String?
  contactEmail        String?
  contactPhone        String?
  address             String?
  website             String?

  // Multi-select types (stored as array)
  types               OperatorType[]

  // Compliance
  companiesHouseCheck ComplianceStatus    @default(NOT_CHECKED)
  companiesHouseDate  DateTime?
  companiesHouseRef   String?             // Company number
  creditCheck         ComplianceStatus    @default(NOT_CHECKED)
  creditCheckDate     DateTime?

  notes               String?
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  licenses            OperatorLicense[]
  bookings            SpaceBooking[]

  @@map("operators")
}

model OperatorLicense {
  id           String              @id @default(cuid())
  operatorId   String
  type         LicenseCategory
  reference    String?             // License/policy number
  startDate    DateTime
  endDate      DateTime
  isVerified   Boolean             @default(false)
  documentUrl  String?             // Future: upload proof
  notes        String?
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt

  operator     Operator            @relation(fields: [operatorId], references: [id], onDelete: Cascade)

  @@index([operatorId])
  @@index([endDate])
  @@map("operator_licenses")
}
```

**New enums:**

```prisma
enum OperatorType {
  GENERAL
  CHARITY
  FOOD_AND_BEVERAGE
  RETAIL
  SERVICES
  PROMOTIONAL
}

enum LicenseCategory {
  PUBLIC_LIABILITY_INSURANCE   // Mandatory for ALL operators
  FOOD_HYGIENE                // Required for F&B operators
  GENERAL_LICENSE
  STREET_TRADING
  ALCOHOL_LICENSE
  FIRE_SAFETY
  OTHER
}

enum ComplianceStatus {
  NOT_CHECKED
  PASSED
  FAILED
  EXPIRED
}
```

**Modify `SpaceBooking`:**

```diff
model SpaceBooking {
+  operatorId    String
-  companyName   String
-  contactName   String?
-  contactEmail  String?
-  contactPhone  String?
+  companyName   String?        // Keep as fallback for legacy bookings
+  brand         String?
   ...
+  operator      Operator  @relation(fields: [operatorId], references: [id])
}
```

- New bookings require `operatorId`
- `companyName` becomes optional (legacy data preserved)
- `contactName`, `contactEmail`, `contactPhone` removed (now on Operator)

**Remove `LicenseType` enum** — replaced by `OperatorType[]` on the Operator and `LicenseCategory` on licenses.

---

### Server Actions

#### [NEW] [operator-actions.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/actions/operator-actions.ts)

| Action | Auth | Description |
|--------|------|-------------|
| `getOperators()` | RM/Admin | List all active operators with license summary |
| `getOperator(id)` | RM/Admin | Single operator with full license detail |
| `createOperator(data)` | Admin | Create operator + initial licenses |
| `updateOperator(id, data)` | Admin | Update operator fields |
| `deleteOperator(id)` | Admin | Soft-delete (set `isActive: false`) |
| `addLicense(operatorId, data)` | Admin | Add a license with dates |
| `updateLicense(id, data)` | Admin | Update license details |
| `removeLicense(id)` | Admin | Hard-delete a license |
| `getExpiringLicenses(days)` | Admin | Licenses expiring within N days |
| `searchOperators(query)` | RM/Admin | Search by company/trading name |
| `getOperatorComplianceSummary()` | Admin | Dashboard: counts by status |

#### [MODIFY] [space-actions.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/actions/space-actions.ts)

- `createBooking()` — replace `companyName`/contact fields with `operatorId` (required)
- `updateBooking()` — allow changing `operatorId`
- `getBookingsForDiary()` — include `operator.companyName` in select
- `searchBookings()` — search by operator name

---

### Admin UI

#### [NEW] [/admin/operators/page.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/admin/operators/page.tsx)

Server page that fetches operators and passes to client component.

#### [NEW] [admin-operators-client.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/admin/operators/admin-operators-client.tsx)

| Feature | Detail |
|---------|--------|
| **Operators table** | Company name, types (badges), license count, compliance status, actions |
| **Add/Edit dialog** | Company name, trading name, contact details, types (multi-select checkboxes), compliance fields |
| **License panel** | Expandable section per operator showing licenses with type, dates, verified status, add/remove |
| **Expiry warnings** | Badge on licenses expiring within 30 days |
| **Search + filter** | Filter by type, compliance status |

---

### Booking Modal Changes

#### [MODIFY] [booking-modal.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/spaces/booking-modal.tsx)

- Replace `companyName`, `contactName`, `contactEmail`, `contactPhone`, `licenseType` fields with an **operator picker** (searchable select)
- Show selected operator's compliance summary (green/amber/red indicators)
- Warn if operator has missing or expired PLI
- Keep `brand`, `setupDetail`, `description`, `notes` as booking-specific fields

#### [MODIFY] [booking-card.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/spaces/booking-card.tsx)

- Display `operator.companyName` (or `brand` if set) instead of inline `companyName`

---

### Sidebar

#### [MODIFY] [app-sidebar.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/app-sidebar.tsx)

- No change needed — Operators is admin-only, accessible from `/admin/operators`
- Add link in admin section of sidebar (alongside existing Users, Locations, Spaces)

---

## Implementation Phases

| Phase | Scope | Estimate |
|-------|-------|----------|
| **1** | Prisma schema: Operator, OperatorLicense models + enums, modify SpaceBooking | ~30 min |
| **2** | `operator-actions.ts`: full CRUD + license management + search | ~1 hr |
| **3** | Admin operators page: table, add/edit dialog, license panel | ~1.5 hrs |
| **4** | Booking modal refactor: operator picker replacing inline fields | ~1 hr |
| **5** | Update diary grid, booking card, sidebar admin link | ~30 min |

---

## Verification Plan

### Build Verification
- `pnpm build` must pass with zero errors after each phase

### Manual Testing (user performs on deployed site)
1. **Admin: `/admin/operators`**
   - Create a new operator (e.g. "Sky Promotions", type: PROMOTIONAL, GENERAL)
   - Add Public Liability Insurance with dates → verify it appears in license panel
   - Add Food Hygiene license → verify expiry date shows
   - Edit operator → verify changes save
   - Delete operator → verify it disappears from list

2. **Booking Flow: `/dashboard/regional/spaces/[locationId]`**
   - Click empty cell → verify operator picker appears (not company name input)
   - Search for and select the operator created above
   - Verify operator's compliance indicators show
   - Create booking → verify it appears in diary with operator name
   - Click booking → verify operator is pre-selected in edit mode

3. **Compliance Dashboard: `/admin/operators`**
   - Create operator with license expiring in 15 days → verify amber warning badge
   - Create operator with expired license → verify red warning badge
   - Verify "Expiring Soon" count shows correctly

---

## Future Phases (Noted, Not In Scope)

| Feature | Notes |
|---------|-------|
| **Companies House API** | User has experience with this — auto-verify company registration |
| **Xero Integration** | Link operators to Xero contacts for invoicing |
| **License Expiry Notifications** | Automated email alerts to admins X days before expiry |
| **Document Upload** | Attach license/insurance certificates as files |
