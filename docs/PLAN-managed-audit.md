# Audit Plan: Managed Locations & Regional Managers

## Overview
This plan outlines the steps to audit the Flourish database for "Managed" locations and ensure they are correctly linked to Regional Managers. We will create a script to automate the detection and remediation of missing links using the backup data in `src/data/location-managers.json`.

## Project Type
**BACKEND / SCRIPTING** (Database Audit)

## Success Criteria
- [ ] automated script `scripts/audit-managed-locations.ts` created.
- [ ] Identify all locations with `isManaged: true`.
- [ ] Fix missing `regionalManager` fields using fuzzy matching against JSON data.
- [ ] Generate a comprehensive report `AUDIT_MANAGED_LOCATIONS.md`.
- [ ] User verifies the report.

## Tech Stack
- **Node.js / TypeScript**: For the script execution.
- **Prisma**: To interact with the database.
- **FS**: To read the JSON source file and write the report.

## File Structure
```
flourish/
├── scripts/
│   └── audit-managed-locations.ts  # [NEW] The audit script
├── docs/
│   └── PLAN-managed-audit.md       # [NEW] This plan file
└── AUDIT_MANAGED_LOCATIONS.md      # [NEW] Output report (generated)
```

## Task Breakdown

### 1. Setup & Discovery
- [x] Analyze `location-managers.json` source data.
- [x] Analyze `findRegionalManager` logic in `page.tsx`.
- [ ] Create script skeleton.

### 2. Implementation
- [ ] **Create Script**: `scripts/audit-managed-locations.ts`
    - Import Prisma and JSON data.
    - Implement `findRegionalManager` logic (Postcode -> Name -> Fuzzy).
    - Fetch `isManaged: true` locations.
    - Iterate and update DB if `regionalManager` is null but match found.
    - Collect stats (Healthy, Fixed, Failed).
    - Write markdown report.

### 3. Verification
- [ ] Run script locally.
- [ ] Inspect `AUDIT_MANAGED_LOCATIONS.md`.
- [ ] Manual spot check in Database (via Prisma Studio).

## Phase X: Verification Checklist
- [ ] Script runs without errors.
- [ ] Database reflects updates for "Fixed" locations.
- [ ] Report accurately lists all managed locations.
