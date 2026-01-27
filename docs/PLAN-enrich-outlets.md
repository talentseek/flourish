
# Plan: Outlet Centre Enrichment

**Goal**: Achieve "Green" Enrichment Score for all 29 UK Outlet Centres.
**Context**: User identified 29 locations and provided 5 missing website URLs. Diagnosis reveals 100% gap in Ownership data and partial gaps in Parking/Hours.

## 1. Scope & Status
*   **Total Targets**: 29 Outlet Centres
*   **Website Gaps**: 5 (User provided URLs for Peak, Quayside, Sterling Mills, Mill Batley, Trentham)
*   **Ownership Gaps**: 29 (All need research)
*   **Parking/Hours Gaps**: Mixed (needs validation)

## 2. Work Phases

### Phase 1: Immediate Website Fixes (The User 5)
Update the following 5 locations with user-provided `website` URLs. This will likely move them from "Red" to "Amber".
1.  **Peak Shopping Village**: `https://peakvillage.co.uk/`
2.  **Quayside MediaCityUK**: `https://www.mediacityuk.co.uk/quayside/`
3.  **Sterling Mills**: `https://www.sterlingmills.com/`
4.  **The Mill Batley**: `http://www.themillbatley.com/`
5.  **Trentham Shopping Village**: `https://trentham.co.uk/`

*Script*: `scripts/enrich-outlets-websites.ts`

### Phase 2: Ownership & Operational Research (The Major 29)
Research "Owner", "Parking Count", and "Opening Hours" for all 29 locations. Group them geographically or by likely owner (e.g., Landsec, McArthurGlen, Peel L&P) for efficiency.

**Sub-Group A: The Major Chains (McArthurGlen / Landsec / Realm)**
*   Ashford Designer Outlet
*   Bicester Village
*   Braintree Village
*   Bridgend Designer Outlet (Check list presence)
*   Cheshire Oaks
*   East Midlands
*   Gunwharf Quays
*   Livingston
*   Swindon
*   York Designer Outlet (Check list presence)

**Sub-Group B: Independent & Specialized**
*   Affinity (Devon, Lancashire, Staffordshire)
*   Clacton, Dalton Park, Fleetwood (Check list), Gloucester Quays.
*   Hornsea, Junction 32, Lakeside, London Designer Outlet.
*   Springfields, The Galleria.

*Task*: Search agents to confirm current 2025/2026 ownership (e.g., recent sales like Hammerson disposals).

### Phase 3: Execution & Verification
*   Create `scripts/enrich-outlets-batch-1.ts` (Majors)
*   Create `scripts/enrich-outlets-batch-2.ts` (Independents)
*   Run Verification to ensure Health Index Score > 40 (Green).

## 3. Verification Checklist
- [ ] All 29 Outlets have valid `website`.
- [ ] All 29 Outlets have valid `owner`.
- [ ] All 29 Outlets have `parkingSpaces` > 0 (where applicable).
- [ ] All 29 Outlets have structured `openingHours`.
- [ ] **Final Check**: Run `scripts/check-scores.ts` (or equivalent) to confirm Green status.
