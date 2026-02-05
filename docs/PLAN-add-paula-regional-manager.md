# Add Paula Muers as Regional Manager

Assign `REGIONAL_MANAGER` role to `paula@thisisflourish.co.uk` so she can access the Regional Dashboard.

## Context

Paula Muers is already set up in the Flourish system:
- ✅ User record exists with correct name (`Paula Muers`)
- ✅ 18 entries in `location-managers.json`
- ✅ 13 managed locations in database with `regionalManager: "Paula Muers"`
- ❌ Current role is `USER` - needs `REGIONAL_MANAGER`

---

## Proposed Changes

### Database Operations

#### Update Paula's role to REGIONAL_MANAGER

```bash
npx tsx scripts/add-paula-rm.ts
```

---

## Verification Plan

1. Run the script and confirm output shows `Role: REGIONAL_MANAGER`
2. Paula logs in and navigates to `/dashboard/regional`
3. Confirm she sees her 13+ managed locations
