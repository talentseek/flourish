# Database Deduplication Strategy

## Objective
The goal of this phase is to refine the 370+ newly enriched records by identifying and resolving duplicates that may have been introduced during batch ingestion or regional sweeps. The secondary goal is to merge fragmented data into a single "high-fidelity" record for each unique location.

## Heuristic Matching Logic

To identify potential duplicates, the system uses a tiered comparison strategy:

1.  **Strict Match (Level 1)**:
    *   **Rule**: Same normalized `name` AND same `postcode`.
    *   **Intent**: High-confidence identification of the same physical asset.

2.  **Proximity Match (Level 2)**:
    *   **Rule**: Similar `name` (Levenshtein distance ≤ 3) AND spatial distance < 500 meters (using latitude/longitude).
    *   **Intent**: Catch entries with slight naming variations (e.g., "The Mall" vs "The Mall Shopping Centre") at the same location.

3.  **City Match (Level 3)**:
    *   **Rule**: Similar `name` AND exact match on `city`.
    *   **Intent**: Catch cases where postcode data might be missing or slightly different (e.g., different entrance postcodes).

## Survivor Selection (Enrichment Scoring)

In any group of duplicates, the "Survivor" (the record to be kept) is determined by an enrichment score:

| Feature | Score Weight |
| :--- | :--- |
| **Verified Website** | +10 points |
| **Social Media Link** (IG, FB, TW) | +5 points per platform |
| **Management Details** | +3 points |
| **Operational Specs** (Area, Floors, Stores) | +2 points per field |
| **Basic Fields** (City, County, Type) | +1 point per field |

The record with the highest total score is nominated as the **Survivor**. All remaining records are flagged as **Victims**.

## Merge Protocol

The deduplication process is designed to be additive, ensuring no data is lost during the cleanup:

*   **Attribute Preservation**: The Survivor retains its primary key (`id`).
*   **Gap Filling**: Any `null` or empty fields in the Survivor are populated with the corresponding values from the Victims (ordered by their own enrichment scores).
*   **Conflict Resolution**: If both Survivor and victim have data for the same field, the Survivor's data is maintained by default (under the assumption that the high-score record has the most recently verified data).

## Analysis Phase Results (Jan 25, 2026)
- **Total Records Scanned**: 1034
- **Initial Run**: 111 groups (Candidate for potential false positives).
- **v2 Robust Run**: **165 candidate groups** (Stratified by confidence).
- **Primary Tool**: `scripts/reporting/dedupe-analysis-v2.ts`
- **Output**: `reports/DEDUPE-V2-ROBUST.md`

### Forensic Findings (Phase 55.1)
Forensic sweeps using `scripts/reporting/dedupe-forensics.ts` revealed:
1.  **Coordinate Anomaly Resolution**: The *Touchwood* case was resolved as a "Safe Merge" candidate (240m distance). The suspected "wrong location" was likely a minor coordinate offset between different data sources (Solihull B91 3GJ vs B91 3GZ).
2.  **Distant Twins (>5000km)**: Identified records with extreme spatial drift, confirming coordinate data errors (likely `0,0` placeholder values) for sites like *St. George's Retail Park* and *Riverside Shopping Centre*.
3.  **Generic Name Collisions**: Multiple distinct regional assets sharing names like *Grand Arcade* (Cambridge vs Wigan) were successfully isolated and excluded from merge candidates via Tiered Matching logic.

## Website-Only Logic (v3 Final Protocol)
After reviewing v2 reports, the user opted for a **Website-URL-First** approach to avoid "Name Twin" false positives.

### v3 Logic Rules
1.  **Primary Key**: Normalized Website URL (Strips protocol, `www`, and trailing slashes).
2.  **Exclusion**: Locations without websites are excluded from automated grouping.
3.  **Cross-Check**: If URLs match, records are grouped UNLESS:
    *   **Distance**: They are > 10km apart (Catching "Chain" roots like `westfield.com`).
    *   **Deep Links**: Matching deep links (e.g. `domain.com/london`) bypasses the spatial hurdle.

### Outcomes
*   **Success**: Identified and processed **74 valid duplicate groups**.
*   **Touchwood**: Grouped correctly (shared domain) and merged.
*   **The Mall**: Unrelated "Malls" with different/no websites now correctly ignored.
*   **Database Impact**: Reduced record count to 983 shopping centres.

## Execution Implementation (Batch Jan 25, 2026)
The implementation script (`scripts/dedupe-exec.ts`) used the following logic:

### 1. Field Consolidation
We prioritized the "Survivor" (highest enrichment score) but performed "Gap Filling" from victims.
- **Rules**: If a survivor field is `null`, `0`, or `""`, it is updated if the victim has valid data for that field.
- **Fields covered**: Address, Management, Socials, KPIs (Footfall, Floor Area), and SEO data.

### 2. Relation Reassignment (Tenants)
To preserve the complex tenant graphs for centres like *Highcross* (41 tenants) and *The Priory* (72 tenants):
- **Collision Handling**: If both Survivor and Victim have a tenant with the same name, the duplicate tenant record is deleted.
- **Transfer**: Non-colliding tenants are reassigned to the Survivor's `locationId` before the Victim location is deleted.

### 3. Record Deletion
Victims were deleted ONLY after field migration and relationship transfer were verified.

## Robustness Evolution (v2 Implementation)
To handle false positives found in initial reports, the matching logic is evolving toward a **Tiered Confidence System**:

| Tier | Category | Logic | Merge Action |
| :--- | :--- | :--- | :--- |
| 🟢 | **High Confidence** | Exact Postcode + Strong Name Match | Automatic Candidate |
| 🟡 | **Medium Confidence** | Spatial Distance < 500m + Strong Name Match | Manual Verification Required |
| 🔴 | **High Risk / Ignore** | Name match only, Dist > 500m, OR Different Postcode Sector | Flag as Data Integrity Issue |

### Forensic Procedures
Implement `scripts/reporting/dedupe-forensics.ts` to:
1.  **Coordinate Sanity Check**: Flag locations with the same name but coordinates > 1km apart as "Data Error" rather than "Duplicate".
2.  **Website Anti-Collision**: If potential duplicates carry different verified websites, they are treated as distinct assets and collision is halted.

## v4 Final Protocol (Jan 26, 2026)

Following extensive audits, the detection and merging logic was refined to handle name variations with high precision and ensure managed site priority.

### 1. Broad Detection Rule Set
The detection script (`scripts/find_all_duplicates.ts`) implements a three-tier match check:

*   **Tier 1: Website Match (Robust)**
    *   **Logic**: High-confidence match for non-generic domains. 
    *   **Safety Check (v4.1)**: If names have radically different signatures (Similarity < 40%), the merge is halted even if URLs match. This prevents "The Trafford Centre" (Mall) from merging with "Trafford Retail Park" (Adjacent Out-of-town) which often share a marketing domain.
*   **Tier 2: Same Postcode + Name Similarity**
    *   **Rule**: Normalized Postcode Match AND Name Similarity > 75% (increased from 60% to reduce false positives).
    *   **Constraint**: For names < 5 characters, an exact case-insensitive match is required to prevent "Short Name" false positives.
*   **Tier 3: Proximity + Exact Name**
    *   **Rule**: Lat/Long distance < 200m AND Exact Name match.

### 2. Winner Scoring & Tie-Breaks
To automate "Survivor" selection, a weighted scoring system was implemented:

| Feature | Score Weight |
| :--- | :--- |
| **Is Managed Site** | +50 points (Critical preference) |
| **Has Website** | +10 points |
| **Has Phone** | +5 points |
| **Has Postcode** | +5 points |
| **Has Town** | +2 points |

**Tie-Break Logic**: If scores are equal, the record with the higher **Tenant Count** is selected as the winner, as it represents more established historical enrichment.

### 3. Lossless Merge Implementation
The `scripts/merge_duplicates.ts` script performs the merge within a Prisma transaction:
1.  **Relation Reassignment**: Moves all `Tenants` from the loser to the winner.
2.  **Scalar Gap Filling**: Populates `null` or empty fields (`description`, `socials`, `footfall`, etc.) in the winner using data from the loser.
3.  **Cleanup**: Deletes the loser record.

## Verification Workflow
1.  **Analysis**: Run `scripts/merge_duplicates.ts` (dry-run) to preview `merge_log.txt`.
2.  **Review**: Verify candidate pairs and winner/loser assignments.
3.  **Execution**: Run with `--execute` flag to commit changes to the database.

## v5 Post-Merge Audit Analysis (Jan 26, 2026)

Following the initial execution of the merge script, a manual audit identified a subtle collision hazard involving **Adjacent Neighboring Assets**.

### 1. The "Trafford/Metro" Hazard
In major retail destinations, physically distinct assets can share naming conventions, postcodes, and even website domains (if managed by the same entity or part of a unified planning zone).

*   **Identified False Positives**:
    *   **The Trafford Centre** (Indoor Mall) vs. **Trafford Retail Park** (Adjacent Out-of-Town Park).
    *   **Metrocentre** (Indoor Mall) vs. **Metro Retail Park** / **Metro Park West** (Adjacent Clusters).
    *   **White City Retail Park** vs. **Castlemore Retail Park** (Trafford, Manchester).
*   **The Cause**: One record may incorrectly carry the website of the larger flagship (e.g., `traffordcentre.co.uk`), or both share a common management domain, triggering a Tier 1 match.

### 2. Enhanced Guardrails
To prevent future "Inadvertent Merges" of separate assets:
*   **Asset Type Blacklist**: Automated merging is now halted if `name` contains distinguishing keywords like "Retail Park" vs. "Shopping Centre" or "The Centre", even if URLs match.
*   **Tier 1 Safety Check**: A mandatory name similarity threshold (0.4) is now applied to all Website-based matches. If "White City Retail Park" matches "Castlemore Retail Park" via URL but the names are too distinct, the merge is rejected.
*   **Postcode Divergence**: If two candidates for merge have identical websites but different postcodes (e.g., M41 vs M17), they are flagged for manual review rather than auto-merged.
*   **Manual Override**: Assets with high tenant counts (>20) should always require manual verification before a merge is committed, as they represent significant commercial entities.
*   **Research Requirement**: If a "Retail Park" matches a "Centre" or "Mall", the auditor must verify if they are distinct physical entities within a shared destination area.

## v6 Targeted Merge & Restoration (Jan 27, 2026)

Following the stabilization of the global database, specific one-off deduplication and restoration tasks were performed to resolve historic data fragmentation and repair earlier merge errors.

### 1. The "Cockhedge" Consolidation
A targeted merge was executed for **Cockhedge Shopping Park** to resolve a long-standing identity split between a legacy unmanaged record (`cmid...`) and a newly enriched managed record (`cmks...`).
- **Survivor Strategy**: The managed record (ID `cmksfw8ho`) was chosen as the winner to preserve 20+ verified tenants and "Managed" status.
- **Normalization**: The survivor was renamed from "Cockhedge Retail Park" to **Cockhedge Shopping Park** to align with the official destination branding (`cockhedge.co.uk`).
- **Result**: Lossless transfer of tenants and elimination of the redundant unmanaged "ghost" record.

### 2. Manual Restoration Protocol
In cases where automated deduplication caused "Adjacent Asset Collisions" (e.g., Trafford Centre vs. Trafford Retail Park), a specific restoration protocol was established via `scripts/restore_bad_merges.ts`.
- **Primary Method**: Direct Prisma creation using verified "Golden Record" data.
- **Mandatory Fields**: To ensure database integrity, restored records must include `name`, `type`, `address`, `city`, and `county`.
- **Identity Locking**: Restored records are assigned a verified website and postcode to prevent re-collision with the flagship asset's broad naming parameters.

### 3. Targeted Enrichment Scripting
The `scripts/enrich_priority_list.ts` pattern was introduced for high-priority hubs, combining:
1.  **Duplicate Resolution**: Consolidating local clusters.
2.  **Missing Asset Creation**: Programmatic insertion of missing benchmark assets (**Carters Square**, **Middleton M24**).
3.  **Golden Record Hydration**: Manual P0-P2 enrichment for owner, size, and anchor store data.

This tiered approach—targeted merge followed by deep enrichment—is the preferred workflow for high-value regional hubs where automated sweeps lack the required precision.
### 4. Technical Scripting Guardrails
During the Phase 78 execution, several scripts (e.g., `standardise_addresses.ts`) initially failed with `SyntaxError: Cannot use import statement outside a module`.
- **Constraint**: The project's `tsconfig.json` excludes `scripts/**/*.ts` from module resolution, and the runtime environment defaults to CommonJS for script execution.
- **Guideline**: All data enrichment and maintenance scripts in the `scripts/` directory MUST use **CommonJS `require()` syntax** rather than ES `import` statements to ensure compatibility with `ts-node` execution.
- **Remediation**: Replaced `import { PrismaClient } from '@prisma/client'` with `const { PrismaClient } = require('@prisma/client')` across the core utility scripts.
