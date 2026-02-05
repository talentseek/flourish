# Add Amanda Bishop as Regional Manager

Add `amanda@thisisflourish.co.uk` as a new Regional Manager user so she can view her locations in the Regional Dashboard.

## Context

Amanda Bishop is already fully integrated into the Flourish system:
- ✅ Listed in `src/components/v2-team-section.tsx` as "Regional Manager (FMCG/Consumer background)"
- ✅ Has entries in `src/data/location-managers.json` with 20+ locations assigned
- ✅ Has profile image at `/amandanew.webp`
- ✅ Locations in database may already have `regionalManager: "Amanda Bishop"` set

The only missing piece is a **User record** in the database with `role: REGIONAL_MANAGER`.

---

## Proposed Changes

### Database Operations

#### [NEW] Script execution: Create Amanda's user record

Run a database script to create/upsert Amanda's user record with the `REGIONAL_MANAGER` role:

**One-time script** (can use existing pattern from `scripts/assign-regional-manager.ts`):

```typescript
// Run with: npx tsx scripts/add-amanda-rm.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addAmandaRM() {
    const email = 'amanda@thisisflourish.co.uk';
    console.log(`🔍 Adding REGIONAL_MANAGER: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'REGIONAL_MANAGER', name: 'Amanda Bishop' },
        create: {
            id: 'amanda-rm-' + Date.now(),
            email,
            name: 'Amanda Bishop',
            role: 'REGIONAL_MANAGER',
            emailVerified: true
        }
    });

    console.log(`✅ User ready: ${user.name} (${user.email}) - Role: ${user.role}`);
}

addAmandaRM()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
```

> [!NOTE]
> The script uses `upsert` to handle both new users and existing users (in case Amanda signed up previously as a regular USER).

---

## Verification Plan

### Manual Verification

1. **Run the script locally**:
   ```bash
   npx tsx scripts/add-amanda-rm.ts
   ```
   - Confirm output shows: `✅ User ready: Amanda Bishop (amanda@thisisflourish.co.uk) - Role: REGIONAL_MANAGER`

2. **Verify database entry**:
   ```bash
   npx prisma studio
   ```
   - Open Prisma Studio and navigate to the `User` table
   - Search for `amanda@thisisflourish.co.uk`
   - Confirm `role` is `REGIONAL_MANAGER`

3. **Verify Regional Dashboard access** (requires user action):
   - Ask Amanda to use "Forgot Password" at `/login` to set her password
   - After password reset, she logs in
   - Navigate to `/dashboard/regional`
   - Confirm: She can see her portfolio of locations (should show 20+ locations)

---

## Alternative: Production Database

If the production database is separate from local, the same script should be run against production:

```bash
# Ensure DATABASE_URL points to production
DATABASE_URL="postgresql://..." npx tsx scripts/add-amanda-rm.ts
```

Or execute directly in production Prisma Studio / database console.
