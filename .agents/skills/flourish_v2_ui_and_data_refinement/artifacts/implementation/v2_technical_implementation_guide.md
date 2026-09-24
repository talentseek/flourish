# Flourish V2 Technical Implementation Guide

This guide centralizes technical documentation for the core V2 features of the Flourish platform, including mapping, AI integrations, and dashboard architecture.

## 1. Enrichment Map & Spatial Strategy

The **Enrichment Map** (`/enrichmentmap`) is a strategic visualization tool used to monitor data saturation and "health" across the Flourish database.

### 1.1 Implementation (Leaflet JS)
- **Engine**: React-Leaflet v4.2.1 (pinned for React 18 compatibility).
- **Marker Logic**: Uses `CircleMarker` for high-density performance (2,500+ locations).
- **SSR Handling**: Dynamic import with `{ ssr: false }` to prevent hydration mismatches.
- **Icon Remediation**: Explicit `L.icon` objects are used to sidestep the Leaflet default icon bug.

### 1.2 Scoring Methodology
Locations are scored on a 100-point weighted system:
- **Social (20)**: Instagram/Facebook presence.
- **Operational (20)**: Parking/EV data.
- **Reviews (15)**: Google Ratings.
- **Demographics (15)**: Census proxy data.
- **History (10)**: Opened Year.
- **Contact (10)**: Website/Phone.
- **Base (10)**: Floor area/Store counts.

### 1.3 Troubleshooting: The Geocoding Hazard
A "Geocoding Hazard" exists where locations may be imported with "placeholder" coordinates (0,0). The Map API filters these out. Targeted geocoding sweeps (Postcodes.io) are used to remediate zero-value coordinates globally.

---

## 2. Regional Manager Dashboard

The Regional Manager Dashboard provide personalized oversight for Flourish Regional Managers.

### 2.1 Role-Based Access Control (RBAC)
- **Role**: `REGIONAL_MANAGER` enum value in Prisma.
- **Authorization**: Uses the **Delegation Pattern** where the page component handles session verification and role checks via `getSessionUser()` + a DB lookup.
- **Navigation**: Simplified access via a standard link in the `AppSidebar` for all authenticated users to bypass complex layout prop-drilling.

### 2.2 Portfolio Data Fetching
- **Server Action**: `getRegionalLocations` filters `prisma.location.findMany` where `regionalManager` matches the user's name.
- **Requirement**: The name in the database `Location` record must exactly match the `User` profile name for the filter to succeed.

---

## 3. AI Assistant & OpenRouter Integration

The "Regional Assistant" provides a bridge between structured database data and unstructured web intelligence.

### 3.1 AI SDK v6 Hazards
Integrating Vercel AI SDK v6 with OpenRouter can trigger `400 Bad Request` (ZodError) due to non-standard message schemas (reasoning fields, multi-part content).

### 3.2 Direct SDK Fallback Pattern
To ensure 100% reliability, the chat API uses the **OpenAI SDK directly**:
- **Pattern**: `openai` package + manual `ReadableStream` + frontend `getReader()` loop.
- **Context Injection**: Portfolio data is retrieved in the API route and injected into the system prompt.
- **Prisma Property Drift**: Extreme care must be taken to ensure `select` fields match `schema.prisma` exactly (e.g., `tenant.name` vs `tenant.tenantName`).

---

## 4. UI Refinements (Homepage & Contact)

### 4.1 Hero Animations (`V2VideoHero`)
- **Logo Reveal**: Horizontal flip reveal after video fade-in.
- **Parallax**: Background scales and shifts positioning based on scroll progress.

### 4.2 Categorized Contact Section (`V2ContactSection`)
- **Segmentation**: Leaders can choose between "New Traders", "Landlords", or "General".
- **Dynamic Type**: A single form updates its enquiry type based on user selection.
- **Route**: `POST /api/contact` handles submission logs.

---

## 5. Deployment & Build Safety
- **Package Manager**: Strictly use **`pnpm`** to prevent module resolution failures in production.
- **Prisma Generation**: Always run `pnpm prisma generate` after schema updates.
- **Static vs Dynamic**: Authenticated dashboards trigger `DYNAMIC_SERVER_USAGE` which is expected and handled by Next.js.
