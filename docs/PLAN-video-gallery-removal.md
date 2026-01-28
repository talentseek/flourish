# Plan: Comment Out Video Gallery Section

Brief description: The Video Gallery section on the homepage is incomplete and needs to be hidden for the launch. This plan documents the minimal changes required to comment out the Video Gallery from both the homepage rendering and the navigation links.

---

## Proposed Changes

### Component: Homepage

#### [MODIFY] [page.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/page.tsx)

1. **Comment out the import** (line 12):
   ```tsx
   // import { V2VideoGallerySection } from "@/components/v2-video-gallery-section"
   ```

2. **Comment out the section component** (lines 62-63):
   ```tsx
   {/* Video Gallery Section - TEMPORARILY DISABLED FOR LAUNCH */}
   {/* <V2VideoGallerySection /> */}
   ```

---

### Component: Navigation

#### [MODIFY] [v2-navigation.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-navigation.tsx)

1. **Comment out the Video Gallery navigation item** (line 21):
   ```tsx
   // { label: "Video Gallery", href: "#video-gallery" }, // TEMPORARILY DISABLED FOR LAUNCH
   ```

---

## Verification Plan

### Manual Verification

1. **Build Check**: Run `pnpm build` to ensure no TypeScript/build errors from the commented code
2. **Visual Verification**: Visit the deployed site [https://flourish-ai.vercel.app/](https://flourish-ai.vercel.app/) after deployment and confirm:
   - "Video Gallery" link is **not visible** in the navigation (desktop and mobile)
   - The Video Gallery section is **not visible** on the homepage when scrolling
   - All other sections render correctly without layout issues

---

## Summary

| File | Change Type | Lines Affected |
|------|-------------|----------------|
| `src/app/page.tsx` | Comment out | 12, 62-63 |
| `src/components/v2-navigation.tsx` | Comment out | 21 |

**Total files modified:** 2  
**Risk level:** Low (purely additive comments, no logic changes)
