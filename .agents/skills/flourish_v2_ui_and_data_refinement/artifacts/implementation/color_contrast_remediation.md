# Color Contrast Remediation Implementation (Feb 2026)

## 1. Overview
Following a visual audit that revealed critical contrast issues (1.3:1 ratio), a systematic remediation was performed to replace hardcoded Lime Green (`#E6FB60`) text with Fossil Grey (`#4D4A46`) on all light backgrounds across the V2 homepage components.

## 2. Completed Transformations

- **Card Titles**: Replaced with Fossil Grey.
- **Team Names/Roles**: Replaced with Fossil Grey after forcing the homepage to light mode.
- **Strategy**: Initially, system dark mode caused Fossil Grey text to disappear on dark grey cards. The first attempt to fix this was forcing the `light` theme via `useEffect` in `page.tsx`. However, this was found to be unreliable (causing a "flash of dark theme" and race conditions with the ThemeProvider). The final, robust resolution was to force the `light` theme at the `ThemeProvider` level in `layout.tsx`. This guarantees light beige backgrounds for all cards before rendering, allowing Fossil Grey to provide the required 7.4:1 contrast ratio.

### 2.2 NMTF Section (`V2NMTFSection.tsx`)
- **Verified Exception**: An audit revealed that NMTF cards use a dark background (`bg-[#4D4A46]`). In this specific context, Lime Green text (`#E6FB60`) provides high contrast and is visually correct. Any attempts to change these to Fossil Grey were reverted.

### 2.3 Podcast Section (`V2PodcastSection.tsx`)
- **Icons**: Changed the headphones icon from `text-[#E6FB60]` to `text-[#4D4A46]`. This ensures the primary visual anchor for the section is visible on light backgrounds.

### 2.4 Trader Stories (`V2TraderStoriesSection.tsx`)
- **Attributions**: Replaced `text-[#E6FB60]` with `text-[#4D4A46]` for all quote attributions (e.g., Ayush Kundaria, Michelle Clark, Sarah M., etc.).

### 2.5 Contact Section (`V2ContactSection.tsx`)
- **Card Titles**: All section card titles ("New Traders", "Landlords", "General Enquiries", "Get in Touch") were switched to Fossil Grey.
- **Form Labels**: Labels for Name, Email, Phone, Enquiry Type, Message, and File upload were switched to Fossil Grey to ensure legibility during data entry.

## 3. Technical Patterns Applied

### Before (Accessibility Failure)
```tsx
<CardTitle className="text-xl text-[#E6FB60] mb-1">{member.name}</CardTitle>
```

### After (Verified Accessibility)
```tsx
<CardTitle className="text-xl text-[#4D4A46] mb-1">{member.name}</CardTitle>
```

## 4. Key Lessons
1. **Developer Monitor Bias**: High-end monitors (Retina, OLED) can make low-contrast text look acceptable while it remains invisible on standard business displays.
2. **Hardcoded Hex Hazards**: Using hardcoded hex strings (`text-[#E6FB60]`) bypasses theme variables and makes global accessibility updates difficult. 
3. **Semantic Inversion & Theme Context**: Lime Green should strictly be treated as a **background-only** color for light themes, but is the **primary choice for text** on any dark background (including Dark Mode card states).
4. **Dynamic Background Hazards**: Static color fixes (changing X hex to Y hex) break if the underlying component (like shadcn `Card`) has dynamic background colors that adapt to system themes.

## 5. Verification & Validation

### 5.1 Build Verification
- **Date**: Feb 2026
- **Status**: PASSED
- **Command**: `npm run build`
- **Results**: Optimized production build completed successfully with all color remediation changes.

### 5.2 Local Environment Testing
- **Status**: Verified
- **Tool**: `npm run dev` (Localhost:3000)
- **Visuals**: Confirmed that Team, Podcast, Trader Stories, and Contact sections now exhibit high contrast and readability across standard desktop and mobile viewports.
- **Final Fix Commit(s)**: 
  1. `fix: improve colour contrast for accessibility - change lime green text to fossil grey on light backgrounds`
  2. `ea24faa fix: force light theme at ThemeProvider level for reliable rendering`
- **Cleanup**: Successfully removed redundant client-side `useEffect` DOM manipulation in `src/app/page.tsx` as it was rendered obsolete by the `ThemeProvider` change.
- **Persistence**: Forced `light` mode at the `ThemeProvider` level in `src/app/layout.tsx` (setting `defaultTheme="light"` and removing `enableSystem`). This is more reliable than the previous client-side DOM manipulation in `page.tsx`, as it prevents "Dark Mode Theme Collision" before any client-side rendering occurs. Verified accessibility across both light and system-dark preference environments.
