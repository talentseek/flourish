# Plan: Regional Manager Dashboard

## Overview
Create a dedicated dashboard for Regional Managers (initially Giorgia) to view their managed properties on an interactive map and query location data + surrounding area info via an AI chat.

## Project Type
**WEB / FULL STACK** (Next.js + Prisma + AI)

## Success Criteria
- [ ] Database Schema updated with `REGIONAL_MANAGER` role.
- [ ] Role-based access control implemented.
- [ ] `/dashboard/regional` page created.
- [ ] Interactive Map displaying only the user's managed locations.
- [ ] AI Chat interface integrated (OpenRouter/OpenAI).
- [ ] AI Service can query:
    - **Database**: Location details, tenants, footfall.
    - **Web**: Live external data (via Perplexity or Search tool).

## Tech Stack
- **Frontend**: Next.js App Router, Leaflet (Map), ShadCN UI.
- **Backend**: Next.js Server Actions, Prisma.
- **Auth**: Better Auth.
- **AI**: Vercel AI SDK + OpenRouter (Model: `google/gemini-2.0-flash-exp:free` or similar).

## File Structure
```
flourish/
├── prisma/
│   └── schema.prisma           # [MODIFY] Add REGIONAL_MANAGER role
├── src/
│   ├── app/
│   │   └── dashboard/
│   │       └── regional/
│   │           └── page.tsx    # [NEW] The dashboard page
│   ├── components/
│   │   ├── regional/
│   │   │   ├── regional-map.tsx # [NEW] Leaflet map for RM
│   │   │   └── ai-chat.tsx      # [NEW] Chat interface
│   ├── lib/
│   │   └── ai/
│   │       └── regional-agent.ts # [NEW] AI logic
│   └── actions/
│       └── regional-data.ts    # [NEW] Fetch locations for RM
```

## Task Breakdown

### 1. Database & Auth Update
- [ ] **Schema Update**: Add `REGIONAL_MANAGER` to `Role` enum in `prisma/schema.prisma`. <!-- id: db-update -->
- [ ] **Migration**: Run `npx prisma migrate dev --name add_rm_role`. <!-- id: db-migrate -->
- [ ] **Assign Role**: Logic/Script to assign `REGIONAL_MANAGER` role to `giorgia@thisisflourish.co.uk`. <!-- id: assign-role -->

### 2. Backend Logic
- [ ] **Data Action**: Create `getRegionalLocations` server action in `src/actions/regional-data.ts`.
    - Fetch locations where `regionalManager` matches the current user's name (or email lookup).

### 3. Frontend - Dashboard Map
- [ ] **Route**: Create `/dashboard/regional/page.tsx` (Protected route).
- [ ] **Component**: Build `RegionalMap` using `react-leaflet`.
    - Display markers for the fetched locations.
    - Click marker -> Show summary card.

### 4. AI Chat Integration
- [ ] **Setup**: Configure OpenRouter client with Vercel AI SDK.
- [ ] **Tools**:
    - `get_location_data`: Tool for AI to query DB details.
    - `search_web`: Tool for AI to search "surrounding area".
- [ ] **UI**: Build `RegionalChat` component.
    - Floating or side-panel chat.
    - Context aware (knows the user's managed locations).

### 5. Integration
- [ ] Combine Map and Chat on the dashboard page.
- [ ] Verify Permissions (Only `REGIONAL_MANAGER` can access).

## Phase X: Verification Checklist
- [ ] Giorgia can log in.
- [ ] Visiting `/dashboard/regional` shows ONLY her 10 locations.
- [ ] Chat can answer "What is the footfall of Pentagon?" (DB data).
- [ ] Chat can answer "What are the coffee shops near Pentagon?" (Web data).
