# Flourish Video — Programmatic Showcase Template

A reusable Remotion video framework for creating polished, cinematic location showcases.

## Quick Start — New Location

1. **Copy the template config:**
   ```bash
   cp src/configs/braehead.ts src/configs/your-location.ts
   ```

2. **Edit the config** — fill in your location's data:
   - `location` — name, address, tagline, CTA text
   - `problem` — headline stats (can reuse defaults)
   - `search` — search bar text + dropdown results
   - `intelligence` — KPIs, anchor tenants
   - `gapAnalysis` — category breakdown, gap details, missing brands
   - `tenant` — discovered company details + match score
   - `outreach` — email subject, bullet points
   - `reveal` — hero media (video or image), placement text, badges
   - `impact` — before/after metrics

3. **Add assets to `public/`:**
   - Kiosk media (`.mp4` or `.png`) for Scene 8
   - Soundtrack (or reuse `soundtrack.mp3`)
   - Flourish logo (already included)

4. **Register in `src/Root.tsx`:**
   ```tsx
   import { yourLocation } from "./configs/your-location";
   
   <Composition
     id={yourLocation.id}
     component={Video}
     defaultProps={{ config: yourLocation }}
     durationInFrames={VIDEO.durationInFrames}
     fps={VIDEO.fps}
     width={VIDEO.width}
     height={VIDEO.height}
   />
   ```

5. **Preview & Render:**
   ```bash
   npm run dev              # Remotion Studio
   npx remotion render YourLocationShowcase out/your-location.mp4
   ```

## Architecture

```
src/
├── types.ts                 # ShowcaseConfig interface
├── styles.ts                # Brand tokens + scene timings
├── configs/                 # Location-specific data
│   └── braehead.ts          # First showcase (template reference)
├── scenes/                  # 10 data-driven scenes
│   ├── S01_BrandedIntro     # Logo + location name
│   ├── S02_TheProblem       # Industry stats
│   ├── S03_Search           # Platform search simulation
│   ├── S04_DataIntelligence # KPI counters + anchor tenants
│   ├── S05_GapAnalysis      # Category bars + GAP DETECTED
│   ├── S06_DiscoverTenant   # Radar scan + match score
│   ├── S07_Outreach         # Email composition mock
│   ├── S08_Reveal           # Hero media (video or image)
│   ├── S09_Impact           # Before/after comparison
│   └── S10_BrandedCTA       # Logo + CTA + URL
├── components/              # Reusable visual components
│   ├── DotGrid.tsx          # Animated background
│   ├── GradientCard.tsx     # Glassmorphism card
│   └── SceneTransition.tsx  # Enter/exit wrapper
├── Video.tsx                # Scene orchestrator
└── Root.tsx                 # Composition registry
```

## Config Type Reference

See `src/types.ts` for the full `ShowcaseConfig` interface with inline documentation.
