# Royal Exchange Video — Update Plan

## Goal
Update the Remotion showcase to accurately reflect the Royal Exchange success story: fix the outreach narrative order (show 79 contacts first), add a Commercial Impact scene (£0 → £22,800/yr), update data accuracy, and close with the Grok phone walkthrough as a standalone final scene.

---

## Scene Map Changes

| # | Scene | Status |
|---|-------|--------|
| S01 | Branded Intro | No change |
| S02 | The Problem | No change |
| S03 | Search | No change |
| S04 | Data Intelligence | ✏️ 5M+ visitors + anchor tenant check |
| S05 | Gap Analysis | No change |
| S06 | Discover Tenant | No change |
| S07 | Outreach | ✏️ Reorder: counter 0→79 first, then email |
| S08 | Reveal | No change |
| S09 | Impact | No change |
| S10 | Commercial Impact (NEW) | 🆕 £0 → £1,900pm / £22,800py |
| S11 | Branded CTA | Renumber only |
| S12 | Grok Walkthrough (NEW) | 🆕 Phone frame + OffthreadVideo |

Total duration: 2100 → 2610 frames (~70s → ~87s)

---

## Tasks

- [ ] Task 1: Copy Grok video → `video/public/jens-walkthrough.mp4`
- [ ] Task 2: Update `royal-exchange.ts` (5M+ visitors, anchor tenants, add commercialImpact block)
- [ ] Task 3: Extend `types.ts` with optional `commercialImpact` field
- [ ] Task 4: Rework `S07_Outreach.tsx` (counter 0→79 first, then email panel)
- [ ] Task 5: Create `S10_CommercialImpact.tsx`
- [ ] Task 6: Create `S12_GrokWalkthrough.tsx` (phone frame)
- [ ] Task 7: Wire `Video.tsx` + `styles.ts` (new sequences, updated total duration)

## Done When
- [ ] 12 scenes in Studio in correct order
- [ ] S07 counter before email
- [ ] S10 commercial impact scene renders
- [ ] S12 Grok video in phone frame after CTA
- [ ] pnpm tsc --noEmit passes
- [ ] npx remotion render RoyalExchangeSuccess out/royal-exchange-v2.mp4 completes
