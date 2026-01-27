
# Enrichment Gap Report (Final)

**Date:** 2026-01-25
**Scope:** 876 Verified Locations (with websites)

## 1. Methodology
*   **Tier 1 (Crawler):** Automated crawling of homepages to find Social Media links and Phone numbers `scripts/enrich-crawler.ts`.
*   **Tier 2 (Targeted Search):** Specific queries to find "Owner" and "Commercial" data for high-priority sites.

## 2. Results (Full Run)

### Crawler Execution
*   **Processed:** ~730 locations.
*   **Successfully Enriched:** 426 locations.
*   **Success Rate:** ~58%.

### Data Completeness Improvement

| Field | Missing (Pre) | Missing (Post) | Data Added | Final Coverage |
| :--- | :--- | :--- | :--- | :--- |
| **Phone** | 49.3% | 21.1% | **+28.2%** | **78.9%** |
| **Facebook** | 50.5% | 26.5% | **+24.0%** | **73.5%** |
| **Instagram** | 59.8% | 37.0% | **+22.8%** | **63.0%** |
| **Twitter** | 79.0% | 59.5% | +19.5% | 40.5% |

## 3. Commercial Data (Search)
*   **Owner Data:** Remains low coverage (95% missing). This requires manual research or paid datasets (CoStar/PropertyData) as it is rarely listed on homepages.
*   **Opening Hours:** Crawler logic needs refinement to parse unstructured text blocks (currently 0% improvement as we only extracted Regex patterns).

## 4. Conclusion
The automated crawler provided massive ROI, successfully filling contact and social gaps for the majority of the verified sites. The dataset is now robust enough for digital presence scoring.
