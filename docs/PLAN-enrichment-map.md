# Plan: Enrichment Map Visualisation

> **Goal**: specific page at `/enrichmentmap` to visualize location data health and enrichment status.

## 1. Requirements
- **URL**: `/enrichmentmap`
- **Map Engine**: Leaflet (via `react-leaflet`) - Cost efficient ($0).
- **Data Point Features**:
  - Color coded by "Enrichment %" (4 grades).
  - Special visual indicators for "No Website" and "No Tenants".
- **Controls**:
  - **Type Toggle**: Shopping Centres, Retail Parks, Outlets, High Streets.
  - **Managed Toggle**: Filter or highlight "Is Managed" (Flourish) locations.
  - **Major Items**: Filters for critical missing data.

## 2. Technical Approach

### 2.1 Dependencies
- `leaflet`
- `react-leaflet`
- `@types/leaflet`
- `leaflet-defaulticon-compatibility` (optional, or manual CSS fix)

### 2.2 Shared Logic (Scoring)
We need to extract the scoring logic from `scripts/prioritize-deep-enrichment.ts` into a shared utility so it can be used by both the script and the API.
- **Location**: `src/lib/enrichment-scoring.ts`
- **Formula**:
    - Social: 20
    - Operational (Parking): 20
    - Reviews: 15
    - Demographics: 15
    - Year: 10
    - Contact: 10
    - Base: 10
    - **Total**: 100

### 2.3 Backend (API)
- **Endpoint**: `/api/locations/enriched-map`
- **Method**: `GET`
- **Response**: Lightweight JSON array optimized for mapping.
```typescript
interface MapLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  isManaged: boolean;
  score: number; // 0-100
  issues: {
    noWebsite: boolean;
    noTenants: boolean;
  }
}
```

### 2.4 Frontend (Components)
- **Page**: `src/app/enrichmentmap/page.tsx`
- **Map Container**: `src/components/enrichment/EnrichmentMap.tsx` (Client Component)
  - Must use `next/dynamic` with `ssr: false` to avoid window errors.
- **Markers**: Custom CircleMarkers colored by score.
  - Red: 0-25%
  - Orange: 26-50%
  - Yellow: 51-75%
  - Green: 76-100%

## 3. Implementation Steps

### Phase 1: Foundation
1. [ ] Install dependencies (`npm install leaflet react-leaflet @types/leaflet`).
2. [ ] Create shared scoring utility `src/lib/enrichment-scoring.ts`.
3. [ ] Create API endpoint `/api/locations/enriched-map`.

### Phase 2: UI Implementation
4. [ ] Create `EnrichmentMap` component with dynamic import.
5. [ ] Implement Filter/Control Panel (overlay on map).
6. [ ] Implement Markers with color coding and tooltips.

### Phase 3: Verification
7. [ ] Verify map loads explicitly.
8. [ ] Verify filters work (Managed vs All, Types).
9. [ ] Verify scoring matches expected values.
