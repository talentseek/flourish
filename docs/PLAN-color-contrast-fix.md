# Fix Critical Colour Contrast Issues on Flourish Website

## Problem Statement

Users on various devices are reporting that the website is **not rendering correctly**, specifically the team section and other areas. The root cause is a severe **colour contrast failure** where the brand Lime Green (`#E6FB60`) is being used as text colour on light backgrounds (`#F7F4F2`).

> [!CAUTION]
> The contrast ratio between Lime Green and White Beige is approximately **1.3:1** - failing WCAG AA requirements (minimum 4.5:1 for normal text).

## Evidence

### Browser Screenshots

````carousel
![Team Section showing poor contrast on "About Flourish" title](/Users/mbeckett/.gemini/antigravity/brain/01ce6b04-571f-41b9-a03e-3f28d6936856/team_section_contrast_1770305262399.png)
<!-- slide -->
![Team member cards with nearly invisible names and roles](/Users/mbeckett/.gemini/antigravity/brain/01ce6b04-571f-41b9-a03e-3f28d6936856/team_members_and_podcast_1770305282020.png)
<!-- slide -->
![Podcast section with faint headphones icon](/Users/mbeckett/.gemini/antigravity/brain/01ce6b04-571f-41b9-a03e-3f28d6936856/podcast_section_headphones_1770305298865.png)
````

### Colour Analysis

| Colour | Hex | Usage |
|--------|-----|-------|
| Lime Green | `#E6FB60` | Primary brand accent, currently misused as text |
| White Beige | `#F7F4F2` | Section backgrounds, card backgrounds |
| Fossil Grey | `#4D4A46` | Correct text colour with good contrast |

**Contrast Ratios:**
- ❌ Lime Green on White Beige: **~1.3:1** (FAIL)
- ✅ Fossil Grey on White Beige: **~7.4:1** (PASS)
- ✅ Fossil Grey on Lime Green: **~10.1:1** (PASS)

---

## User Review Required

> [!IMPORTANT]
> The brand Lime Green (`#E6FB60`) should **never be used as text colour on light backgrounds**. It should be reserved for:
> - Background accents (buttons, badges, highlight boxes)
> - Decorative elements on dark backgrounds
> - Focus rings and borders

**Design decision needed:** For card titles and team names on light backgrounds, should we:
1. **Option A (Recommended):** Use Fossil Grey (`#4D4A46`) for text, with Lime Green accent on backgrounds
2. **Option B:** Add a dark pill/badge behind Lime Green text
3. **Option C:** Create a darker variant of the brand green for text use

---

## Proposed Changes

### 1. Team Section

#### [MODIFY] [v2-team-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-team-section.tsx)

**Changes:**
- Line 95: Change `text-[#E6FB60]` → `text-[#4D4A46]` for "About Flourish" title
- Line 138-139: Change team member names and roles from `text-[#E6FB60]` → `text-[#4D4A46]`
- Line 147: Change "Fun fact:" label from `text-[#E6FB60]` → `text-[#4D4A46] font-semibold`

**Alternative approach:** Add Lime Green underline or left border accent instead of text colour.

---

### 2. NMTF Section

#### [MODIFY] [v2-nmtf-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-nmtf-section.tsx)

**Changes:**
- Lines 46, 66, 89: Change card titles from `text-[#E6FB60]` → `text-[#4D4A46]`
- Lines 97, 106, 115, 124, 133, 142: Change CheckCircle icons from `text-[#E6FB60]` → keep as is OR use darker accent (icons are smaller, may be acceptable)

> [!NOTE]
> Icons at 24x24px may be acceptable with lower contrast as they are decorative. Recommend keeping Lime Green for icons but changing text.

---

### 3. Podcast Section

#### [MODIFY] [v2-podcast-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-podcast-section.tsx)

**Changes:**
- Line 11: Headphones icon `text-[#E6FB60]` → change background to dark OR use Fossil Grey icon
- Lines 38: Quote icons `text-[#E6FB60]` → acceptable as decorative

---

### 4. Trader Stories Section

#### [MODIFY] [v2-trader-stories-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-trader-stories-section.tsx)

**Changes:**
- Lines 49, 74, 131, 145, 159: Attribution names `text-[#E6FB60]` → `text-[#4D4A46]`
- Lines 44, 69, 124, 138, 152: Quote icons - keep Lime Green (decorative)
- Line 89: This one is correct - Lime Green on Fossil Grey background ✅

---

### 5. Contact Section

#### [MODIFY] [v2-contact-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-contact-section.tsx)

**Changes:**
- Lines 57, 75, 93, 114: Card titles `text-[#E6FB60]` → `text-[#4D4A46]`
- Lines 132, 142, 155, 166: Form labels on dark background - **these may be correct** if on dark card
- Line 122: CheckCircle icon - acceptable as decorative

---

### 6. Locations Section

#### [MODIFY] [v2-locations-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-locations-section.tsx)

**Review needed:**
- Line 135: Badge with `bg-[#E6FB60] text-[#4D4A46]` - ✅ Correct
- Line 144: Hover state `text-[#E6FB60]` on white - needs review

---

## Design Pattern Going Forward

### When to Use Lime Green (`#E6FB60`)

| Use Case | Implementation |
|----------|---------------|
| ✅ Buttons | `bg-[#E6FB60] text-[#4D4A46]` |
| ✅ Badges/Pills | `bg-[#E6FB60] text-[#4D4A46]` |
| ✅ Text on dark backgrounds | `text-[#E6FB60]` on `bg-[#4D4A46]` |
| ✅ Decorative icons | Small icons where colour isn't critical for understanding |
| ✅ Borders/Focus rings | `border-[#E6FB60]`, `ring-[#E6FB60]` |
| ❌ Text on light backgrounds | **NEVER** - use Fossil Grey instead |

---

## Verification Plan

### Automated Tests

```bash
# Build verification - ensure no build errors after changes
cd /Users/mbeckett/Documents/codeprojects/flourish
npm run build
```

### Manual Verification

1. **Local Dev Server Test:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 and verify:
   - Team section: All names/roles are clearly readable in Fossil Grey
   - Podcast section: Headphones icon is now visible
   - NMTF section: Card titles are readable
   - Contact section: Labels are readable

2. **Cross-Browser Test:**
   - Test in Chrome, Safari, Firefox
   - Test on mobile viewport (375px width)

3. **Production Deployment:**
   - Deploy to Vercel/staging
   - Test on multiple devices (iPhone, Android, tablet)
   - Have original reporters verify the fix

### Accessibility Check

```bash
# Lighthouse accessibility audit
npx lighthouse https://thisisflourish.co.uk/ --only-categories=accessibility --output=json
```

---

## Summary

| File | Changes | Priority |
|------|---------|----------|
| `v2-team-section.tsx` | 4 text colour changes | 🔴 Critical |
| `v2-nmtf-section.tsx` | 3 title colour changes | 🟡 High |
| `v2-podcast-section.tsx` | 1 icon change | 🟡 High |
| `v2-trader-stories-section.tsx` | 5 attribution changes | 🟢 Medium |
| `v2-contact-section.tsx` | 4 title/label changes | 🟢 Medium |
| `v2-locations-section.tsx` | Review hover state | 🟢 Low |

**Estimated time:** 30 minutes implementation + 30 minutes testing
