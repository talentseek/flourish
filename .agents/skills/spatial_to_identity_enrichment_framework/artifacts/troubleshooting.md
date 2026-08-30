# Troubleshooting & Implementation Lessons

Enriching business data at scale reveals several recurring "edge case" hazards.

## 1. The Scraper "Black Hole" (Google Sites / National Chains)
Websites hosted on platforms like **Google Sites** or massive corporate portals (e.g., `accor.com`) often block heavy scrapers or return empty Markdown due to JS-rendering requirements.
- **Solution**: Implement a "Raw HTML Fallback". If the primary scraper returns 0 pages, do a lightweight raw `fetch` to scan for plain-text emails and `mailto:` links. This often catches "Get in touch at [email]" sections that sophisticated scrapers miss.

## 2. Mailto Encoding Issues
Emails hidden behind icons in social sections are often:
1. **URL-Encoded**: `@` becomes `%40` (e.g., `rosies%40stonegategroup.co.uk`).
2. **Malformed**: Prefixed with symbols (e.g., `mailto:>example@domain.com`).
- **Fix**: Use a safe `decodeURIComponent` wrapper before regex matching and broaden regex to handle common malformed prefixes like `[>]?`.

## 3. The SSE "Hang"
Sequential enrichment loops can stall if a single API call (Firecrawl or Apollo) hangs indefinitely.
- **Solution**: Implement a per-business **race timeout** (e.g., 90 seconds). If one business fails to resolve within the timeout, mark it as `failed` and move to the next item in the batch to keep the UI progress bar moving.

## 4. Companies House False Positives
Fuzzy matching on business names in Companies House can lead to incorrect identity extraction (e.g., "ZARA" matching "ZARA ALI LIMITED" instead of the Inditex parent).
- **Refinement**: Always filter CH results by city/postcode proximity and prefer exact name matches for high-confidence resolution.

## 5. Junk Email Filtering
Pipeline yield is high, but "identity" quality can be diluted by junk emails found on pages.
- **Filter List**: Always exclude `subjectaccess.request@` (GDPR), `sentry.io`, `wixpress.com`, `noreply@`, and `privacy@` from "Resolved" status.
