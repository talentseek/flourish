# Spatial-to-Identity Enrichment Framework

The "Spatial-to-Identity" framework is a multi-layered data enrichment pipeline designed to bridge the gap between physical location data (Google Places "Spatial" data) and business owner contact information ("Identity" data).

## Core Philosophy: The Recursive Waterfall

The framework operates on a **waterfall logic**: sequentially attempting increasingly complex (and costly) extraction methods, exiting as soon as a high-confidence resolution is found.

### The 9-Layer Waterfall
1. **Classification**: Distinguish between National Chains and Independent businesses (determines downstream logic).
2. **Website Scraping**: Primary scrape using Crawl4AI with Firecrawl fallback.
3. **LLM Identity Extraction**: Fuzzy extraction of names, roles, and company IDs from raw Markdown.
4. **Regex Extraction Fallback**: Catching specific email patterns missed by the LLM.
5. **Raw HTML Mailto: Extraction**: Dedicated fetch to find emails in `mailto:` hrefs (handles URL encoding and malformed links).
6. **Companies House Trace (Independents)**: Automated lookup for Directors/Owners of local businesses.
7. **Apollo People Search**: Branch/Area manager searches for national chains (specific to city/area).
8. **Email Construction & Verification**: Generating common patterns (e.g., `first.last@domain.com`) and verifying via Reoon.
9. **Chain Email Pattern Fallback**: Using known, predictable email formats for major international chains (Accor, Radisson, Leonardo, etc.).

## Key Innovations

### Chain-Aware Logic
National chains require different strategies than independents. Independent businesses are best solved via Companies House (Directors). National chains (e.g., Travelodge, Starbucks) are best solved via city-specific Apollo searches for Store/General Managers or predictable domain patterns.

### Scrubbing the Scrape
Standard scrapers often convert HTML to Markdown, stripping out `mailto:` links or failing to decode URL-encoded characters (like `%40` for `@`). The framework implements a raw HTML fallback to ensure no discoverable email is left behind.

### Real-Time Pipeline Feedback
Integrated with Server-Sent Events (SSE), the pipeline provides live updates to the UI, allowing users to see progress and specific layer outcomes (e.g., "Found via Apollo") in real-time.
