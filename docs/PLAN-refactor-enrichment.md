# Refactor Location Enrichment Skill

## Goal
Optimize the `location-enrichment` skill to prioritize fast, lightweight research methods (direct web search, URL reading) and strictly limit/deprioritize the use of the slow, heavy `browser_subagent` tool.

## Problem Statement
The current workflow relies too heavily on the `browser_subagent` for "deep research," which proved slow (rate-limiting, page loading times) and unreliable (timeouts). The user preferred the "web search" approach, even though it was temporarily flaky, as the correct *architectural* approach for speed.

## Proposed Strategy: "Lightweight First"
We will rewrite the skill's research protocols to enforce a strict tool hierarchy:

1.  **Tier 1: `search_web`**
    *   Fastest method.
    *   Use for finding "facts" (Opening year, Owner, Reviews).
    *   Example: `search_web(query="Viking Centre Jarrow opening date")`

2.  **Tier 2: `read_url_content`**
    *   Use when a specific URL is known (from Tier 1 or database).
    *   Fast text extraction without rendering overhead.
    *   Example: `read_url_content(url="https://www.thevikingcentre.co.uk/contact")`

3.  **Tier 3: `browser_subagent` (Last Resort/Ban)**
    *   **Explicitly discouraged** in SKILL.md.
    *   Only use if Tier 1 & 2 yield 403/404s or complex SPA (Single Page App) interaction is strictly required.

---

## Detailed Changes

### 1. Update `.agent/skills/location-enrichment/SKILL.md`
-   **Frontmatter**: Add warning "Do not use browser_subagent unless absolutely necessary."
-   **Instructions**: Add a "Tool Usage Strategy" section.
    *   "ALWAYS try `search_web` first."
    *   "NEVER start a task by opening a browser to 'browse' around."
    *   "If you have a URL, use `read_url_content`."

### 2. Update `.agent/skills/location-enrichment/references/research-workflow.md`
-   Rewrite all "Phase" instructions to specify tool usage.
    *   *Old*: "Go to Google Maps..."
    *   *New*: "Run `search_web` query: '[location] opening hours'"
-   Add specific search query templates for each field.

### 3. Update `.agent/skills/location-enrichment/references/data-sources.md`
-   Add a column for "Best Tool" for each source (e.g., Wikipedia -> `read_url_content`, Google Reviews -> `search_web`).

### 4. Verification
-   Run a test enrichment research task (e.g., "Enrich [New Location]") and verify the agent uses `search_web` instead of launching a browser session.

---

## User Review Required
> [!IMPORTANT]
> **Tool Reliability**: The `search_web` tool was failing (500 errors) in the previous session.
> **Question**: Should strictly banning the browser be conditional on `search_web` working? Or do you prefer we `read_url_content` on Google Search results pages (browsing without the subagent) as a middle ground?

## Task Breakdown
- [ ] Modify `SKILL.md` to enforce tool hierarchy.
- [ ] Rewrite `research-workflow.md` with tool-specific instructions.
- [ ] Update `data-sources.md` to map sources to tools.
- [ ] Verify with a dry-run research task.
