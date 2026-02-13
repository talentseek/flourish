# API Surface Reference

All routes under `src/app/api/`. Auth column: 🔒 = requires session, 👑 = requires ADMIN, 🌐 = public.

---

## Auth

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `*` | `/api/auth/[...all]` | 🌐 | BetterAuth catch-all handler (login, register, session, etc.) |

## Locations

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `GET` | `/api/locations` | 🌐 | List all locations (lightweight, for pickers/maps) |
| `GET` | `/api/locations/enriched-map` | 🌐 | Location data optimised for enrichment map visualization |

## Analytics

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `GET` | `/api/analytics/category-distribution` | 🌐 | Category counts within radius of a location |
| `GET` | `/api/analytics/largest-category-within-radius` | 🌐 | Dominant category in a geographic area |
| `GET` | `/api/analytics/gap-analysis` | 🌐 | Gap analysis results for a location |
| `GET` | `/api/analytics/tenant-comparison` | 🌐 | Compare tenant mix between locations |
| `GET` | `/api/analytics/tenant-data-status` | 🌐 | Tenant data completeness stats |

## Admin

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/admin/promote-user` | 👑 | Promote a user's role |
| `GET` | `/api/admin/enrichment/compute` | 👑 | Compute enrichment statistics |
| `GET` | `/api/admin/enrichment/gaps` | 👑 | List locations with enrichment gaps |
| `GET` | `/api/admin/enrichment/gaps/[field]` | 👑 | Drilldown: locations missing a specific field |

## Chat

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/chat` | 🔒 | AI chat (OpenAI) for location insights |
| `POST` | `/api/rh-chat` | 🌐 | RivingtonHark branded AI chat |

## Contact & User Sync

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/contact` | 🌐 | Contact form submission |
| `POST` | `/api/sync-user` | 🔒 | Sync user from auth to database |
| `POST` | `/api/force-refresh` | 🔒 | Force cache refresh |

## VAPI Voice Assistant

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/vapi/location-search` | 🔒 | Search locations by name |
| `POST` | `/api/vapi/location-details` | 🔒 | Get full location details |
| `POST` | `/api/vapi/local-recommendations` | 🔒 | Local area insights |
| `POST` | `/api/vapi/tenant-gap-analysis` | 🔒 | Tenant gap report |
| `POST` | `/api/vapi/nearby-competitors` | 🔒 | Find nearby competing locations |
| `POST` | `/api/vapi/searchLocation` | 🔒 | Alternative location search |
| `POST` | `/api/vapi/getLocationDetails` | 🔒 | Alternative details endpoint |
| `POST` | `/api/vapi/getLocalRecommendations` | 🔒 | Alternative recommendations |
| `POST` | `/api/vapi/analyzeTenantGaps` | 🔒 | Alternative gap analysis |
| `POST` | `/api/vapi/findNearbyCompetitors` | 🔒 | Alternative competitors |
| `POST` | `/api/vapi/create-assistant` | 👑 | Create VAPI assistant programmatically |
| `DELETE` | `/api/vapi/delete-assistant` | 👑 | Delete VAPI assistant |

## Legacy/Utility

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/clerk/webhook` | 🌐 | Legacy Clerk webhook (may be deprecated) |
| `POST` | `/api/test-promote` | 👑 | Test user promotion endpoint |
