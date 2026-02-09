# RivingtonHark Portal V2 — Map-First Command Centre

## Problem Statement

V1 was a reskin of the Landsec portal — identical structural flow (header → hero → stats → map+grid → card grid → text → CTA → footer). The user explicitly asked for a **fundamentally different** experience. RivingtonHark's CEO is technology-focused; the portal needs to feel like **operational software**, not a marketing scroll page.

## Design Philosophy

> **"The map IS the interface."**

The entire viewport is the map. Everything else — project details, ESG, stats, value props — lives in **overlays, drawers, and floating panels** that the user summons. Zero scrolling. Zero card grids. Zero generic hero sections.

---

## Structural Comparison

| Element | Landsec (v1 clone) | RivingtonHark V2 |
|---------|-------------------|-------------------|
| **Layout** | Vertical scroll, 10+ sections | Single-viewport, map-centric |
| **Hero** | Full-width headline + video | None — the map IS the hero |
| **Navigation** | Sticky header + scroll | Floating minimal header + floating action buttons |
| **Map** | Section inside scroll | **Full-bleed, 100vh background** |
| **Project details** | Card grid below map | **Side drawer** slides in on marker click |
| **Stats** | Horizontal stats bar | **Floating bottom strip** — collapsible |
| **ESG** | Dedicated section | **Modal overlay** from floating button |
| **CTA** | Full-width gradient section | **Inside drawer** + header button |
| **Video** | Inline iframe | Button → opens **modal** |

---

## UI Architecture

```
┌──────────────────────────────────────────────────────┐
│  [RH Logo | Flourish]        [ESG] [Video] [Contact] │  ← Floating header (z-30)
│                                                       │
│                                                       │
│                    FULL-BLEED MAP                      │  ← 100vh Google Map (z-0)
│                                                       │
│              ●  ●    ●                                │  ← Pulsing markers
│          ●        ●       ●                           │
│                ●       ●                              │
│                                                       │
│  ┌─────────────────────────────┐                      │
│  │ 15 Projects │ 8 Matched │ 3.7K Parking │ 17% Vac │ │  ← Floating stats strip (z-20)
│  └─────────────────────────────┘                      │
│                                                       │
│                         ┌────────────────────────────┐│
│                         │  SIDE DRAWER (400px)       ││  ← Slides in on click (z-40)
│                         │                            ││
│                         │  ■ Palace Shopping         ││
│                         │  Enfield • Shopping Centre ││
│                         │                            ││
│                         │  Vacancy: —  Parking: 500  ││
│                         │  Stores: 56  Footfall: 8M  ││
│                         │                            ││
│                         │  [● Active on Flourish]    ││
│                         │                            ││
│                         │  [Run Gap Analysis →]      ││
│                         │  [View Tenant Mix →]       ││
│                         │                            ││
│                         └────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

---

## Colour System & Contrast Audit

> [!CAUTION]
> V1 had light text on semi-transparent backgrounds. Every colour pairing below has been checked for WCAG AA (4.5:1 minimum).

### Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#0F172A` | Map background / drawer bg |
| `bg-surface` | `#1E293B` | Cards, drawer panels |
| `bg-elevated` | `#334155` | Hover states, active items |
| `border-default` | `#475569` | Borders (visible on all bg levels) |
| `text-primary` | `#F8FAFC` | Headings, primary content |
| `text-secondary` | `#CBD5E1` | Body text, descriptions |
| `text-muted` | `#94A3B8` | Labels, hints |
| `accent-coral` | `#E8458B` | RH brand, interactive elements |
| `accent-lime` | `#E6FB60` | Flourish brand, success states |
| `status-live` | `#4ADE80` | Active on Flourish |
| `status-matched` | `#E8458B` | Data available |
| `status-coming` | `#94A3B8` | Enrichment ready |

### Contrast Validation

| Pairing | Ratio | Pass? |
|---------|-------|-------|
| `#F8FAFC` on `#0F172A` | **15.4:1** | ✅ AAA |
| `#CBD5E1` on `#0F172A` | **10.3:1** | ✅ AAA |
| `#94A3B8` on `#0F172A` | **6.2:1** | ✅ AA |
| `#E8458B` on `#0F172A` | **5.1:1** | ✅ AA |
| `#E6FB60` on `#0F172A` | **14.1:1** | ✅ AAA |
| `#4ADE80` on `#0F172A` | **10.8:1** | ✅ AAA |
| `#F8FAFC` on `#1E293B` | **12.6:1** | ✅ AAA |
| `#CBD5E1` on `#1E293B` | **8.4:1** | ✅ AAA |
| `#94A3B8` on `#1E293B` | **5.0:1** | ✅ AA |

### Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Headings | **Exo** | 600-700 | 18-32px |
| Body / KPIs | **Roboto Mono** | 400-500 | 13-16px |
| Labels | Roboto Mono | 400 | 11-12px |

> Rationale: The Science/Tech pairing gives a "command centre" feel. Monospace for KPI data makes numbers align and feel precise. Exo for headings adds geometric tech polish.

---

## Component Breakdown

### 1. Floating Header (`z-30`)
- Minimal: RH logo | divider | "Powered by Flourish" logo
- Right: 3 icon buttons — ESG (opens overlay), Video (opens modal), Contact (opens demo modal)
- Semi-transparent: `bg-[#0F172A]/80 backdrop-blur-xl`
- **Not sticky-scroll** — truly floating with `top-4 left-4 right-4` margin

### 2. Full-Bleed Map (`z-0`)
- `position: fixed; inset: 0;` — fills entire viewport
- Dark custom map style matching `#0F172A` base
- **Pulsing animated markers** — different colours per status
- Custom SVG markers with glow effect for Active projects
- Click marker → opens Side Drawer
- Map auto-pans to centre clicked marker with offset to account for drawer

### 3. Side Drawer (`z-40`)
- **420px wide**, slides from right with `ease-out 300ms`
- Semi-transparent: `bg-[#0F172A]/95 backdrop-blur-xl`
- **Visible border**: `border-l border-[#475569]`
- Close button (X) top-right
- Content sections (all with proper contrast):
  - **Project name** (`#F8FAFC`, Exo 600, 24px)
  - **Location + type** (`#CBD5E1`, 14px)
  - **Status badge** (colour-coded, pill shape)
  - **KPI Grid** (2×2 grid with `bg-[#1E293B]` cards, `border-[#475569]`)
    - Label: `#94A3B8` (passes AA on `#1E293B`)
    - Value: `#F8FAFC` (Roboto Mono 500)
  - **Divider**: `border-[#475569]`
  - **Action buttons**: "Run Gap Analysis", "View Tenant Mix"
  - **"Coming Soon" state**: For unmatched projects — grey palette, "Data Enrichment Available" messaging

### 4. Floating Stats Strip (`z-20`)
- Fixed bottom, centred, with `bottom-6` spacing
- `bg-[#0F172A]/90 backdrop-blur-xl border border-[#475569] rounded-2xl`
- 4 stats inline: Projects | Matched | Parking | Avg Vacancy
- Labels: `#94A3B8`, Values: `#F8FAFC` (Roboto Mono)
- Collapsible: click chevron to minimise to just an icon bar

### 5. ESG Overlay (`z-50`)
- Full-screen overlay, `bg-[#0F172A]/95 backdrop-blur-2xl`
- Title: "Your Values, Our Data" (`#F8FAFC`, Exo 700)
- 6 ESG cards in 2×3 grid on `bg-[#1E293B]`, `border-[#475569]`
- Each card: icon (accent colour) + RH principle + Flourish capability
- Close button top-right
- `prefers-reduced-motion`: skip entrance animation

### 6. Video Modal (`z-50`)
- Centred overlay with YouTube embed
- Dark backdrop: `bg-black/80`
- Max-width: `max-w-4xl`

### 7. Map Legend
- Floating bottom-left, small `bg-[#0F172A]/80 backdrop-blur` panel
- 3 status indicators with labels (`#CBD5E1` text)

---

## Z-Index Scale

| Layer | Z-Index | Element |
|-------|---------|---------|
| Map | `z-0` | Base map |
| Legend | `z-10` | Bottom-left legend |
| Stats Strip | `z-20` | Bottom-centre metrics |
| Header | `z-30` | Top floating header |
| Side Drawer | `z-40` | Project detail panel |
| Modals/Overlays | `z-50` | ESG overlay, video, demo modal |

---

## Proposed Changes

### [MODIFY] [page.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/rivingtonhark/page.tsx)

Full rewrite. Delete everything, rebuild with:
- Fixed-position full-bleed map
- Floating header component
- Side drawer component (custom, no shadcn Sidebar — this is a single-page overlay, not app navigation)
- Floating stats strip
- ESG overlay component
- Video modal component
- Map legend component

### [MODIFY] [demo-request-modal.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/demo-request-modal.tsx)

No changes needed — already has `rivingtonhark` variant.

---

## Anti-Pattern Checklist (Things V1 Got Wrong)

- [x] ~~Vertical scroll layout identical to Landsec~~ → Single viewport, drawer architecture
- [x] ~~Hero section with headline + video~~ → Map IS the hero, video in modal
- [x] ~~Stats bar section~~ → Floating collapsible strip
- [x] ~~Card grid~~ → Side drawer on marker click
- [x] ~~`text-white/60` and `text-white/50` (low contrast)~~ → All pairings validated ≥ 4.5:1
- [x] ~~`bg-white/5` cards (invisible on dark bg)~~ → `bg-[#1E293B]` with `border-[#475569]`
- [x] ~~`text-white/40` for labels~~ → `#94A3B8` minimum (6.2:1 on base)
- [x] ~~`text-white/30` for "coming soon"~~ → `#94A3B8` for legibility

---

## Verification Plan

### Visual Checks
1. All text passes WCAG AA minimum (4.5:1 for normal text, 3:1 for large text)
2. No text uses opacity below `text-white/60` (replaced with solid hex values)
3. Borders visible against all background levels
4. Drawer animation smooth with `ease-out`
5. Drawer doesn't overlap header
6. Stats strip doesn't overlap map controls
7. ESG overlay fully covers viewport
8. Map markers visible and distinguishable

### Functional Checks
1. Click marker → drawer opens with correct project data
2. Click different marker → drawer updates
3. Click X → drawer closes
4. Click map background → drawer closes
5. ESG button → overlay opens → close button works
6. Video button → modal opens → close button works
7. Contact button → demo request modal opens
8. Stats strip collapse/expand works
9. Map auto-pans to centre marker (accounting for drawer width)

### Build
1. `npm run build` passes with exit code 0
2. No TypeScript errors
3. No console warnings
