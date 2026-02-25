# Space Booking MVP — Implementation Plan

> Replace Spacebook with native space booking within Flourish, integrated into the Regional Manager workflow.

---

## Background

The Flourish team currently uses **Spacebook** — a dated ASP.NET platform — to manage retail space bookings (kiosks, pop-ups, promotions) within their shopping centres. Regional Managers must switch between two systems daily. This plan integrates the core booking functionality directly into Flourish so Regional Managers can manage spaces from their existing dashboard.

### What We're Building (MVP Scope)

| In Scope | Out of Scope (Phase 2+) |
|----------|------------------------|
| Bookable space configuration per location | Xero/accounting integration |
| Diary grid (Gantt-style calendar per location) | Agency/operator compliance registry |
| Booking CRUD (create, edit, cancel) | Mailshot manager |
| Regional dashboard integration | Financial forecasting/budgets |
| Admin space management | Debtor tracking |
| Cross-venue booking overview | CRM features |
| Search/filter bookings | Pricing tier management |

---

## Proposed Changes

### Database Layer

#### [NEW] Prisma Migration — `Space` and `SpaceBooking` Models

Add two new models to [schema.prisma](file:///Users/mbeckett/Documents/codeprojects/flourish/prisma/schema.prisma):

```prisma
enum SpaceType {
  GENERAL
  CHARITY
  PREMIUM
  PROMOTIONAL
}

enum BookingStatus {
  CONFIRMED
  UNCONFIRMED
  CANCELLED
}

enum LicenseType {
  PROMOTION
  TENANCY
}

model Space {
  id              String    @id @default(cuid())
  locationId      String
  name            String        // "Kiosk 1", "Mid Aisle A"
  type            SpaceType     @default(GENERAL)
  width           Decimal?      @db.Decimal(5, 2) // metres
  length          Decimal?      @db.Decimal(5, 2) // metres
  hasPower        Boolean       @default(false)
  defaultDailyRate Decimal?     @db.Decimal(8, 2) // £
  sortOrder       Int           @default(0)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  location        Location      @relation(fields: [locationId], references: [id], onDelete: Cascade)
  bookings        SpaceBooking[]

  @@unique([locationId, name])
  @@map("spaces")
}

model SpaceBooking {
  id              String        @id @default(cuid())
  spaceId         String
  reference       String        @unique // auto-generated: "SB-XXXX"
  startDate       DateTime
  endDate         DateTime
  status          BookingStatus @default(UNCONFIRMED)
  licenseType     LicenseType   @default(PROMOTION)

  // Inline operator/contact (no separate registry in MVP)
  companyName     String
  contactName     String?
  contactEmail    String?
  contactPhone    String?
  brand           String?       // brand being promoted
  setupDetail     String?       // physical setup requirements
  description     String?       // promotion description

  dailyRate       Decimal?      @db.Decimal(8, 2)
  totalValue      Decimal?      @db.Decimal(10, 2) // calculated

  notes           String?
  createdById     String?       // FK to User who created it
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  space           Space         @relation(fields: [spaceId], references: [id], onDelete: Cascade)

  @@index([spaceId, startDate, endDate])
  @@map("space_bookings")
}
```

Also add to the existing `Location` model:

```diff
  // Relations
  tenants Tenant[]
+ spaces  Space[]
```

> [!IMPORTANT]
> The `Location` → `Space[]` relation is the core integration point. Every managed location can have bookable spaces. Regional Managers see spaces for their assigned locations only.

---

### Server Actions & API Layer

#### [NEW] [space-actions.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/actions/space-actions.ts)

Server actions for space and booking CRUD, following the existing pattern in [admin/actions.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/admin/actions.ts).

**Functions:**

| Action | Auth | Purpose |
|--------|------|---------|
| `getSpacesForLocation(locationId)` | RM or ADMIN | Fetch all active spaces for a location |
| `createSpace(data)` | ADMIN only | Create a new bookable space within a location |
| `updateSpace(spaceId, data)` | ADMIN only | Edit space config (name, type, rate, dimensions) |
| `deleteSpace(spaceId)` | ADMIN only | Soft-delete (set `isActive: false`) |
| `getBookingsForLocation(locationId, dateRange?)` | RM or ADMIN | Fetch bookings for diary grid rendering |
| `getBookingsForRegionalManager()` | RM only | Fetch ALL bookings across RM's assigned locations |
| `createBooking(data)` | RM or ADMIN | Create a new booking |
| `updateBooking(bookingId, data)` | RM or ADMIN | Edit booking details |
| `updateBookingStatus(bookingId, status)` | RM or ADMIN | Confirm/cancel a booking |
| `searchBookings(query, filters)` | RM or ADMIN | Search across bookings by company, brand, dates |

**Auth pattern** (reuse existing):
```typescript
async function verifyRMOrAdmin(locationId?: string) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true, name: true }
  });

  if (dbUser?.role === 'ADMIN') return dbUser;

  if (dbUser?.role === 'REGIONAL_MANAGER' && locationId) {
    const location = await prisma.location.findFirst({
      where: { id: locationId, regionalManager: dbUser.name, isManaged: true }
    });
    if (location) return dbUser;
  }

  throw new Error("Unauthorized");
}
```

**Reference auto-generation:**
```typescript
// Generate unique booking reference: "SB-0001", "SB-0002", etc.
const lastBooking = await prisma.spaceBooking.findFirst({
  orderBy: { createdAt: 'desc' },
  select: { reference: true }
});
const nextNum = lastBooking
  ? parseInt(lastBooking.reference.split('-')[1]) + 1
  : 1;
const reference = `SB-${String(nextNum).padStart(4, '0')}`;
```

---

### UI Components

#### Regional Dashboard Integration

##### [MODIFY] [regional/page.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/dashboard/regional/page.tsx)

Add a **"Space Bookings"** section below the existing map + location cards grid. This section shows:
- An "Upcoming Bookings" summary card (next 7 days across all locations)
- Quick-action button to open the full diary view per location

```
Current layout:
┌─────────────────────┬────────┐
│ Map (2 cols)        │ AI Chat│
│                     │        │
├─────────┬───────────┤        │
│ Loc Card│ Loc Card  │        │
│ Loc Card│ Loc Card  │        │
└─────────┴───────────┴────────┘

Proposed layout:
┌─────────────────────┬────────┐
│ Map (2 cols)        │ AI Chat│
│                     │        │
├─────────┬───────────┤        │
│ Loc Card│ Loc Card  │        │
│ Loc Card│ Loc Card  │        │
├─────────┴───────────┤        │
│ 📅 Upcoming Bookings│        │
│ (next 7 days table) │        │
│ [View Full Diary →] │        │
└─────────────────────┴────────┘
```

##### [NEW] `/dashboard/regional/spaces/[locationId]` route

The **full diary page** for a specific location. This is the primary workspace — the Spacebook replacement.

**Components needed:**

| Component | File | Purpose |
|-----------|------|---------|
| `SpaceDiaryPage` | `src/app/dashboard/regional/spaces/[locationId]/page.tsx` | Server page: auth + data fetch |
| `SpaceDiaryGrid` | `src/components/spaces/space-diary-grid.tsx` | Gantt-style grid (rows=spaces, cols=dates) |
| `BookingModal` | `src/components/spaces/booking-modal.tsx` | Create/edit booking form (shadcn Dialog) |
| `BookingCard` | `src/components/spaces/booking-card.tsx` | Individual booking bar in the grid |
| `SpaceDiaryToolbar` | `src/components/spaces/space-diary-toolbar.tsx` | Filter buttons: All, Confirmed, Unconfirmed, Cancelled |
| `UpcomingBookingsWidget` | `src/components/spaces/upcoming-bookings-widget.tsx` | Regional dashboard summary widget |

##### SpaceDiaryGrid Architecture

```
┌──────────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Space        │ Mon 24  │ Tue 25  │ Wed 26  │ Thu 27  │ Fri 28  │
├──────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Kiosk 1      │ ████ Scottish Power ████████ │ (empty) │ (empty) │
├──────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Mid Aisle A  │ (empty) │ (empty) │ ████ Blue Cross █████████████│
├──────────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Promo Stand  │ (empty) │ (empty) │ (empty) │ (empty) │ (empty) │
└──────────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

- Click empty cell → opens BookingModal (pre-filled with space + date)
- Click existing booking → opens BookingModal in edit mode
- Navigate dates with ◄ ► buttons (10-day rolling window)
- Color coding: green=confirmed, amber=unconfirmed, red=cancelled
```

**State management:** The grid will be a client component using `useState` for the visible date range. Bookings are fetched server-side and passed as props. Date navigation triggers a re-fetch via server action.

##### BookingModal Fields

Mapping directly from Spacebook's reverse-engineered form:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Space | Select (disabled, pre-filled) | ✅ | From grid cell click |
| Start Date | DatePicker | ✅ | Pre-filled from grid cell |
| End Date | DatePicker | ✅ | |
| Company Name | Text input | ✅ | |
| Contact Name | Text input | | |
| Email | Text input | | |
| Phone | Text input | | |
| License Type | Select: Promotion / Tenancy | ✅ | Default: Promotion |
| Brand | Text input | | |
| Setup Detail | Textarea | | |
| Description | Textarea | | |
| Daily Rate | Number input | | Pre-filled from space default |
| Status | Select: Confirmed / Unconfirmed | | Default: Unconfirmed |

---

#### Admin Panel Integration

##### [NEW] `/admin/spaces` route

For ADMIN users to configure bookable spaces across all managed locations.

| Feature | Detail |
|---------|--------|
| Location picker | Dropdown to select from managed locations |
| Spaces table | List showing name, type, dimensions, rate, active status |
| Add Space form | Name, type, width, length, power, default rate |
| Edit/delete actions | Inline edit or modal, soft-delete toggle |

This follows the same pattern as [/admin/locations](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/admin/locations) — DataTable with server actions.

---

#### Sidebar Navigation

##### [MODIFY] [app-sidebar.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/app-sidebar.tsx)

Add a "Spaces" nav item visible to `REGIONAL_MANAGER` and `ADMIN` users:

```diff
  const navItems = [
    { title: "Dashboard", url: "/dashboard2", icon: LayoutDashboardIcon },
    { title: "Regional", url: "/dashboard/regional", icon: MapPinIcon },
+   // Show Spaces for RM and Admin users
    { title: "Outreach", url: "/outreach", icon: TargetIcon },
    { title: "Reports", url: "/reports", icon: FileTextIcon },
  ];

+ if (userRole === 'REGIONAL_MANAGER' || userRole === 'ADMIN') {
+   navItems.splice(2, 0, {
+     title: "Spaces",
+     url: "/dashboard/regional/spaces",
+     icon: CalendarDaysIcon,
+   });
+ }
```

> [!NOTE]
> The `userRole` prop is already passed to `AppSidebar` from the layout. No new data fetching needed.

---

### Middleware

##### [MODIFY] [middleware.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/middleware.ts)

No changes needed. The new `/dashboard/regional/spaces/*` routes are already covered by the existing `/dashboard` matcher pattern. Auth is handled at the page level, consistent with the current approach.

---

## Implementation Phases

### Phase 1: Database & Core Actions (Day 1-2)
- [ ] Add `Space`, `SpaceBooking` models + enums to `schema.prisma`
- [ ] Add `spaces Space[]` relation to `Location`
- [ ] Run `pnpm db:migrate` to generate migration
- [ ] Create `src/actions/space-actions.ts` with all CRUD functions
- [ ] Add `verifyRMOrAdmin()` auth helper
- [ ] Test actions work via a simple test script

### Phase 2: Diary Grid & Booking Modal (Day 3-5)
- [ ] Create `SpaceDiaryGrid` component
- [ ] Create `BookingModal` component (using shadcn Dialog + Form)
- [ ] Create `BookingCard` component (colored booking bars)
- [ ] Create `SpaceDiaryToolbar` (filter buttons)
- [ ] Create `SpaceDiaryPage` (server page at `/dashboard/regional/spaces/[locationId]`)
- [ ] Wire up booking creation, editing, and status changes

### Phase 3: Regional Dashboard Integration (Day 6-7)
- [ ] Create `UpcomingBookingsWidget` component
- [ ] Add widget to regional dashboard page
- [ ] Add "Spaces" to sidebar navigation
- [ ] Create location selection page at `/dashboard/regional/spaces`
- [ ] Add "Manage Spaces" link from each location card

### Phase 4: Admin Space Config (Day 8-9)
- [ ] Create `/admin/spaces` page with space management
- [ ] Add location picker + spaces table
- [ ] Add create/edit/delete space forms
- [ ] Add "Spaces" to admin sidebar section

---

## File Summary

| Action | Path |
|--------|------|
| MODIFY | `prisma/schema.prisma` |
| NEW | `src/actions/space-actions.ts` |
| NEW | `src/app/dashboard/regional/spaces/page.tsx` |
| NEW | `src/app/dashboard/regional/spaces/[locationId]/page.tsx` |
| NEW | `src/components/spaces/space-diary-grid.tsx` |
| NEW | `src/components/spaces/booking-modal.tsx` |
| NEW | `src/components/spaces/booking-card.tsx` |
| NEW | `src/components/spaces/space-diary-toolbar.tsx` |
| NEW | `src/components/spaces/upcoming-bookings-widget.tsx` |
| NEW | `src/app/admin/spaces/page.tsx` |
| MODIFY | `src/app/dashboard/regional/page.tsx` |
| MODIFY | `src/components/app-sidebar.tsx` |

---

## Verification Plan

### Automated Checks

1. **Build validation** — Confirm `pnpm build` succeeds with all new models, routes, and components:
   ```bash
   pnpm build
   ```

2. **Prisma migration** — Confirm migration applies cleanly:
   ```bash
   npx prisma migrate dev --name add-space-booking
   npx prisma generate
   ```

3. **TypeScript type check** — Confirm no type errors:
   ```bash
   npx tsc --noEmit
   ```

### Browser-Based Testing

4. **Diary grid renders** — Navigate to `/dashboard/regional/spaces/[locationId]` and verify:
   - Grid shows spaces as rows, dates as columns
   - Date navigation (◄ ►) works
   - Empty cells are clickable

5. **Booking creation** — Click an empty diary cell and verify:
   - Modal opens with space + date pre-filled
   - Fill required fields (company, dates) → Submit
   - Booking appears as colored bar in grid
   - Booking reference auto-generated

6. **Booking status** — Click existing booking → change status to Cancelled → verify color changes to red

7. **Regional dashboard widget** — Visit `/dashboard/regional` and verify:
   - "Upcoming Bookings" section appears below location cards
   - Shows next 7 days of bookings across assigned locations

8. **Admin space config** — Visit `/admin/spaces` and verify:
   - Can select a location
   - Can add a new space (name, type, rate)
   - Space appears in the diary grid for that location

### Manual QA (User Testing)

9. **Regional Manager workflow** — Log in as a Regional Manager and:
   - Navigate to Regional Dashboard → see your locations
   - Click "View Spaces" on a location → see the diary grid
   - Create a test booking → confirm it appears
   - Verify this replaces the need to open Spacebook for daily booking tasks
