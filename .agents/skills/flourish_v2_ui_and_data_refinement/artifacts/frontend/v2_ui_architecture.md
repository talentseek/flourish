# Flourish V2 UI Architecture & Frontend Guide

This guide documents the frontend structure, component design, and specialized user experiences (public vs. authenticated) within Flourish V2.

## 1. UI Organization & Navigation

### 1.1 Root Migration & Layout
- **Pathing**: The Root `/` is the primary entry point.
- **Scoping**: Styles are managed via the `.v2-page` wrapper and `v2-page-active` body class.
- **Navigation**: `V2Navigation` supports `useAbsoluteLinks` for consistency and `forceSolid` for legibility on pages without hero videos. Links are defined in a central `navigationItems` array.

### 1.2 Selective Suppression Pattern
To ensure a polished launch, incomplete sections are "suppressed" rather than deleted:
1. **Nav Suppression**: Comment out the link in `navigationItems`.
2. **Instance Suppression**: Comment out the component import and instance in the parent page.
3. **Reference Preservation**: Keep the code as an inline TODO for future activation.

### 1.3 Key Homepage Sections (Order of Appearance)
- **V2VideoHero**: Auto-playing video header with scroll-down indicator.
- **V2LocationsSection**: Grid of managed properties with status indicators.
- **V2NMTFSection**: Partnership showcase with the National Market Traders Federation.
- **V2LookingForSpaceSection**: CTA for prospective traders.
- **V2JoinPortfolioSection**: CTA for asset managers.
- **V2TraderStoriesSection**: Embedded video testimonials (Oudvana, Kiara Rose).
- **V2TeamSection**: Profiles of the core leadership team.
- **V2PodcastSection**: Featured interview episodes (e.g., Tania Murphy - NMTF interview).
- **V2ContactSection**: Categorized inquiry form.
- **V2Footer**: Navigation and copyright.

---

## 2. Dashboard2: Stage-Based Analytics

The dashboard operates as a 4-stage state machine:
1. **Search**: Real-time filtering of managed locations.
2. **Discovery**: Data-dense preview with hero images and KPIs.
3. **Comparison**: Radius-based competitor selection.
4. **Report**: Final gap analysis and PDF generation.

### 2.1 Server-to-Client Serialization
Next.js Server Components passing data to `Dashboard2Client` must perform explicit serialization to handle Prisma `Decimal` types and `null` values (converting to `number` and `undefined` respectively).

---

## 3. Dual-State Managed Location Experience

Managed locations provide two distinct "states" based on user authentication.

| Route | View | Component | Purpose |
|-------|------|-----------|---------|
| `/locations/[slug]` | **Public** | `PublicLocationPage` | Lead generation, service discovery. |
| `/dashboard2/[slug]` | **Authenticated** | `LocationDiscoveryPage` | Analytics, gap analysis, functional tools. |

### 3.1 Public conversion Path
- **CTA**: Labeled as "Request Access" which triggers a `DemoRequestModal`.
- **Widget**: The **Regional Manager Widget** exists only on public pages to provide a human connection for leads.
- **Support**: If no manager is assigned, the system falls back to a generic AI Assistant.

### 3.2 Authenticated Workflow
- **CTA**: Labeled as "Get Full Analytics" which advances to the comparison stage.
- **Widget**: Uses a functional **Voice AI Widget** instead of the manager profile.

---

## 4. Frontend Best Practices & Lessons

- **Card Visibility**: Explicitly set `bg-white` and `text-[#4D4A46]` on cards to prevent themes from hero sections causing legibility issues in subsequent sections.
- **Lucide Icons**: Not all icons are available in the current project version. Use confirmed replacements (e.g., `HeartHandshake` instead of `Handshake`).
- **Metric Density**: Prioritize distinct metrics (e.g., "Retail Space" vs "Stores") in high-density views to avoid redundancy.
- **Image Whitelisting**: Ensure partner CDNs are in `next.config.js` `remotePatterns`. For critical assets, migrate to the local `/public` folder.

---

## 5. Design Tokens (OKLCH)

- **Background (Light)**: `oklch(0.9689 0.0042 56.3749)` (`#F7F4F2` beige transition)
- **Background (Dark)**: `oklch(0.4107 0.0077 75.3282)` (Fossil Grey foundation)
- **Text Forecast**: `#4D4A46` (Fossil Grey)
## 6. Data Normalization & Presentation Safety (Feb 05)

When displaying database fields in the UI, especially for summary metrics, follow these safety patterns:

### 6.1 Percentage Normalization
- **Issue**: Percentage fields (e.g., `largestCategoryPercent`) are stored as raw decimals (0.184) in Prisma.
- **Pattern**: Always multiply by 100 before formatting: `(value * 100).toFixed(1)`.
- **Components**: Applied in `location-commercial-kpis.tsx` and `location-metrics-grid.tsx`.

### 6.2 Selective Suppression of Stale Data
- **Issue**: Some fields (like `Location.phone`) often contain legacy or manually-entered data that differs from verified tenant contact info.
- **Pattern**: If data integrity cannot be guaranteed at the parent record level, suppress the field from display to avoid misleading the user.
- **Components**: Removed `location.phone` from `location-compact-cards.tsx`.

### 6.3 Robust Text Handling (Wrap vs Truncate)
- **Issue**: Detailed operational strings (e.g., `publicTransit` descriptions) are frequently too long for simple cards.
- **Pattern**: Avoid `truncate` on critical information. Use `flex-start` layout with `flex-shrink-0` on icons to allow text to wrap naturally without breaking the card grid.
- **Components**: Updated `LocationParkingCard` in `location-compact-cards.tsx`.

### 6.4 Dynamic JSON Parsing
- **Issue**: JSON fields (e.g., `openingHours`) require consistent transformations to be human-readable.
- **Pattern**: Map JSON keys to localized display strings (e.g., "Mon", "Tue") and filter for null/unavailable values before rendering.
- **Components**: Implemented `formatOpeningHours` helper in `location-compact-cards.tsx`.
### 6.5 Expandable List Pattern
- **Issue**: Large collections (e.g., Tenants) clutter the scroll view if fully rendered, but feel "incomplete" if capped at a low number with no toggle.
- **Pattern**: 
  - Cap initial view (e.g., `slice(0, 20)`).
  - Use `useState(false)` for a `showAll` toggle.
  - Animate/Transition with `max-h-64` to `max-h-96` on a scrollable container.
- **Components**: `location-tenants-section.tsx`.

### 6.6 Unified Comparison Badge Pattern
- **Issue**: Catchment demographics require comparisons against national averages across multiple units (Currency, Percent).
- **Pattern**: Create a `ComparisonBadge` that accepts a `value` and optional `isCurrency` flag. Use conditional logic to handle formatting and sentiment (Green/Positive vs Orange/Negative).
- **Computed Fallback**: When `vsNational` fields are `null` in the database, calculate the delta dynamically against UK constants:
  - **Avg Household Income**: £34,500
  - **Homeownership**: 63.0%
  - **Car Ownership**: 78.0%
  - **Seniors (65+)**: 18.6%
  - **Median Age**: 40.7
- **Constraint**: Ensure the parent component does not pass deprecated props (like `label`) after the badge is modernized.
- **Components**: `location-demographics-section.tsx`.

### 6.7 Redundancy Suppression Pattern
- **Issue**: Displaying multiple similar but technically different area metrics (e.g., `totalFloorArea` vs `retailSpace`) creates user confusion (e.g., 1000K vs 700K).
- **Pattern**: When a specific, high-value metric (`retailSpace`/GLA) is already present in a primary dashboard component (like the Metrics Grid), remove the more generalized/redundant field (`totalFloorArea`) from auxiliary components (like Compact Cards).
- **Components**: Updated `Property Details` card in `location-compact-cards.tsx`.
