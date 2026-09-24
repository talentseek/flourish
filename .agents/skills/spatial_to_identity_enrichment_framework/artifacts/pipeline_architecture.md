# Pipeline Architecture: Spatial-to-Identity

The enrichment pipeline is implemented as a sequential orchestrator that processes establishments through several specialized modules.

## 1. Classification (The Gatekeeper)
The pipeline first classifies the business as a `national_chain`, `local_group`, or `independent`.
- **Reasoning**: Searching Companies House for "Travelodge" is useless (returns HQ directors). Searching Apollo for "Travelodge" without a city filter is useless (returns 1000+ employees).

## 2. Scraping Infrastructure
- **Layer 1: Crawl4AI (Docker)**: High-performance scraper.
- **Layer 2: Firecrawl (Cloud API)**: Fallback for when local scraping is blocked or yields 0 content.
- **Layer 3: Raw Fetch**: Lightweight `fetch` for raw HTML parsing (specifically for `mailto:` links).

## 3. The Identities Layer (LLM)
Uses `gpt-4o-mini` to parse raw Markdown content.
- **Schema**: `ExtractedIdentity` includes ownerName, role, emails, companyRegistration, and vatNumber.
- **Fuzzy Matching**: Overcomes the "Boilerplate Problem" where manager names are buried in team descriptions or news carousels.

## 4. Chain branch Manager Strategy
For businesses flagged as chains:
1. **Scrape Branch Page**: Extract manager from the location-specific URL (e.g., `.../hotels/birmingham`).
2. **Apollo Search**: Query Apollo specifically for `Title: (Manager OR General Manager) AND Company: [ChainName] AND City: [BusinessCity]`.
3. **Derived Patterns**: Generate emails using chain-specific constants:
   - **Accor**: `h{code}@accor.com`
   - **Radisson**: `info.{city}@radissonblu.com`
   - **Leonardo**: `{City}{Property}@leonardohotels.com`

## 5. Verification & Confidence
Every email found is verified via Reoon.
- **High Confidence**: Named contact + Deliverable email.
- **Medium Confidence**: General branch email found via chain pattern/regex.
- **Low Confidence**: Company info found but no direct contact email.

### Acceptance Criteria for "Unknown"
While most emails require `deliverable` status, **Chain-Derived Patterns** accept an `unknown` status (catch-all domains). Because these patterns are derived from known brand standards, an "unknown" response from the mail server is treated as a high-probability "Partial" result.
