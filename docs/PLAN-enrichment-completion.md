
# PLAN-enrichment-completion

**Goal:** Achieve "Green" status for all 40+ attributes across 983 Shopping Centres using the established `location-enrichment` skill.

## 1. Skills & Tools
We will utilize the pre-defined Python scripts in `.agent/skills/location-enrichment/scripts/`:
*   `audit_location.py`: Identifies missing fields for a specific location.
*   `generate_enrichment.py`: Performs the research (Tier 1/2) and generates a JSON update.
*   `validate_data.py`: Ensures data quality (UK phone formats, rating ranges, etc.).

## 2. Batch Execution Strategy

Since the scripts are designed for single-location execution, we will create a **Master Orchestrator Script** (`scripts/enrichment-orchestrator.ts`) to:
1.  **Iterate** through all 983 Shopping Centres (from Prisma).
2.  **Filter** for those with <80% completeness (Red/Amber status).
3.  **Execute** `generate_enrichment.py` for each target.
4.  **Parse** the JSON output.
5.  **Write** the enrichment data back to the database.

> [!NOTE]
> We will respect the "Tier 3 Avoidance" rule. The scripts will use `search_web` and `read_url_content` only.

## 3. Data Priority (Per Skill Protocol)
The enrichment will strictly follow the Field Priority Matrix:
1.  **Core:** Website, Phone, Open Hours.
2.  **Operational:** Parking, Stores, EV Charging.
3.  **Commercial:** Owner, Management, Year Opened.
4.  **Digital:** Social & Reviews.
5.  **Demographics:** (Census-based).

## 4. Execution Phases

### Phase 1: Infrastructure
*   Create `scripts/enrichment-orchestrator.ts`.
*   Verify Python environment dependencies for the skill scripts.

### Phase 2: Batch Execution (Top 50 Pilot)
*   Run the orchestrator on the 50 largest "Red" status locations.
*   Review success rate and data quality.

### Phase 3: Full Rollout
*   Run on remaining locations in batches of 100.
*   Monitor for rate limits.

### Phase 4: Final Verification
*   Re-run the Health Index calculation.
*   Confirm "Green" status in the dashboard.
