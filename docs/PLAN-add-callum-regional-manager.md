# Add Callum Clifford as Regional Manager

Assign `REGIONAL_MANAGER` role to `callum@thisisflourish.co.uk` so he can access the Regional Dashboard.

## Context

Callum Clifford is already fully set up in the Flourish system:
- ✅ Team section entry with bio and profile image (`/callumnew.webp`)
- ✅ Entry in `location-managers.json`
- ✅ 15+ managed locations in database with `regionalManager: "Callum Clifford"`
- ❌ **Missing:** User record in database with `REGIONAL_MANAGER` role

---

## Proposed Changes

### Database Operations

#### [NEW] [add-callum-rm.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/scripts/add-callum-rm.ts)

Create script using upsert pattern (same as Amanda/Paula):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addCallumRM() {
    const email = 'callum@thisisflourish.co.uk';
    console.log(`🔍 Adding REGIONAL_MANAGER: ${email}...`);

    const user = await prisma.user.upsert({
        where: { email },
        update: { role: 'REGIONAL_MANAGER', name: 'Callum Clifford' },
        create: {
            id: 'callum-rm-' + Date.now(),
            email,
            name: 'Callum Clifford',
            role: 'REGIONAL_MANAGER',
            emailVerified: true
        }
    });

    console.log(`✅ User ready: ${user.name} (${user.email}) - Role: ${user.role}`);
}

addCallumRM()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
```

---

## Verification Plan

1. Run the script: `npx tsx scripts/add-callum-rm.ts`
2. Confirm output shows `Role: REGIONAL_MANAGER`
3. Callum logs in and navigates to `/dashboard/regional`
4. Confirm he sees his 15+ managed locations
