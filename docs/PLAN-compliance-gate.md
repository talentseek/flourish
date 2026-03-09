# Compliance Gate — Implementation Plan

> Prevent booking confirmation unless the operator's paperwork is in order.

---

## Rules (from CEO)

| Rule | Condition | Requirement |
|------|-----------|-------------|
| **PLI Required** | All operators | Valid (non-expired) Public Liability Insurance |
| **PLI Value — Non-Food** | Operator has NO `FOOD_AND_BEVERAGE` type | PLI cover ≥ £5,000,000 |
| **PLI Value — Food** | Operator HAS `FOOD_AND_BEVERAGE` type | PLI cover ≥ £10,000,000 |
| **Food Hygiene Required** | Operator has `FOOD_AND_BEVERAGE` type | Valid Food Hygiene OR Food Safety certificate |

**Lock behaviour**: Bookings can be **created** as UNCONFIRMED without compliance. The **Confirm** button is blocked until all rules pass.

---

## Proposed Changes

### Schema

#### [MODIFY] [schema.prisma](file:///Users/mbeckett/Documents/codeprojects/flourish/prisma/schema.prisma)

Add `coverValue` field to `OperatorLicense`:

```diff
model OperatorLicense {
  ...
+ coverValue   Decimal?    @db.Decimal(12, 2)   // e.g. 5000000.00 or 10000000.00
  ...
}
```

---

### Compliance Logic

#### [NEW] [compliance-utils.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/lib/compliance-utils.ts)

Pure function (shared between server actions + UI):

```typescript
interface ComplianceResult {
  canConfirm: boolean
  issues: string[]   // Human-readable list of blockers
}

function checkBookingCompliance(operator): ComplianceResult
```

Logic:
1. Find valid (non-expired) PLI license → if missing, issue: "No valid PLI on file"
2. Check operator types for `FOOD_AND_BEVERAGE`:
   - If F&B: PLI coverValue must be ≥ £10,000,000 → else issue: "PLI cover must be at least £10m for food operators"
   - If non-F&B: PLI coverValue must be ≥ £5,000,000 → else issue: "PLI cover must be at least £5m"
3. If F&B: check for valid Food Hygiene license → if missing, issue: "Food Hygiene certificate required for F&B operators"
4. Return `{ canConfirm: issues.length === 0, issues }`

---

### Server Actions

#### [MODIFY] [space-actions.ts](file:///Users/mbeckett/Documents/codeprojects/flourish/src/actions/space-actions.ts)

- `updateBookingStatus()` — when status is `CONFIRMED`, run `checkBookingCompliance()` on the operator. If `canConfirm === false`, throw error with issues list.

---

### UI Changes

#### [MODIFY] [booking-modal.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/spaces/booking-modal.tsx)

- After selecting an operator, call compliance check client-side
- If issues exist: show amber warning box listing blockers
- Disable "Confirm" button with tooltip explaining why
- "Create Booking" (as UNCONFIRMED) still works regardless

#### [MODIFY] [admin-operators-client.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/admin/operators/admin-operators-client.tsx)

- Add `coverValue` input (£) when adding/editing a PLI license
- Display cover value in license panel alongside dates

---

## Verification

1. Create non-F&B operator → add PLI with £5m cover → confirm booking → ✅ should work
2. Create F&B operator → add PLI with £5m cover → try confirm → ❌ blocked ("PLI must be £10m")
3. F&B operator with £10m PLI but no Food Hygiene → try confirm → ❌ blocked
4. F&B operator with £10m PLI + valid Food Hygiene → confirm → ✅
5. Any operator with expired PLI → try confirm → ❌ blocked
6. Build passes, push to GitHub
