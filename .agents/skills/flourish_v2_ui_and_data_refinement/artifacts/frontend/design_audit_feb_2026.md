# Visual Audit & Accessibility Report (Feb 2026)

## 1. Executive Summary
A comprehensive visual audit of `thisisflourish.co.uk` revealed significant legibility and accessibility issues on various devices. The primary cause is the usage of the **Lime Green accent color (`#E6FB60`)** as a text color on **White Beige (`#F7F4F2`)** or light backgrounds. While rendering might appear acceptable on high-contrast/high-brightness development monitors, it fails accessibility standards (WCAG) and renders as "invisible" or "washed out" on many consumer devices and mobile screens.

## 2. Identified Problem Areas

### 2.1 Team Section (V2TeamSection.tsx)
- **ISSUE**: "About Flourish" CardTitle used `text-[#E6FB60]`.
- **ISSUE**: Team member Names and Roles used `text-[#E6FB60]`.
- **ISSUE**: "Fun fact" bold labels used `text-[#E6FB60]`.
- **RESULT**: Unreadable on light card backgrounds.

### 2.2 Podcast Section (V2PodcastSection.tsx)
- **ISSUE**: Headphones icon used `text-[#E6FB60]` on a light background.
- **RESULT**: Icon appears highly transparent or washed out.

### 2.3 Contact & NMTF Sections
- **ISSUE**: Multiple CardTitles and labels used hardcoded lime green text.
- **RESULT**: Poor visual hierarchy and low accessibility.

### 2.4 Navigation Hover States
- **ISSUE**: Hovering over links in the navbar sometimes triggers lime green text that disappears against light backgrounds during scrolling.

## 3. Corrective Standards (The "High-Contrast" Rule)

To ensure Flourish is readable on all devices, the following standards must be applied:

1.  **Text on Light Backgrounds**: Must always be **Fossil Grey (`#4D4A46`)**.
2.  **Lime Green Usage**: Use exclusively for **interactive elements (buttons)**, **status badges (backgrounds)**, or **text on DARK backgrounds**.
3.  **Tailwind Class Hygiene**: Remove all instances of hardcoded `text-[#E6FB60]` from components that render on light backgrounds.
4.  **Dark Mode Awareness**: When using the `Card` component, recognize that the background flips to dark in system dark mode. In these cases, Lime Green (`#E6FB60`) is the correct high-contrast text choice.

## 4. Theme Context Collision (The "Dark on Dark" Regression)
A regression was identified where switching to Fossil Grey (`#4D4A46`) text for accessibility on light backgrounds caused "invisible" text for users with **System Dark Mode** enabled.

- **Cause**: The `ThemeProvider` (defaulting to system) switches the `Card` background to dark grey.
- **Effect**: Fossil Grey text on a Dark Grey card results in a "dark on dark" rendering with near-zero contrast.
- **Resolution**: **Forced Light Mode at Provider Level**. Early attempts to force the light theme via `useEffect` classes in `page.tsx` proved unreliable on mobile devices and slow connections due to race conditions. The final solution implements `defaultTheme="light"` and removes `enableSystem` in `src/app/layout.tsx`. This ensures that the global `ThemeProvider` serves the light theme by default before any client-side logic execution, guaranteeing that `bg-card` always renders as light beige and Fossil Grey remains accessible.

## 4. Verification Checklist for New UI
- [x] Check contrast ratio of all text elements (Target 4.5:1).
- [x] Test on a low-brightness mobile device (Verified via visual audit).
- [x] Verify hover states remain visible against both dark (hero) and light (page) background transitions.
- [x] Ensure "Lime Green" text only appears on dark backgrounds (Fossil Grey/Black).

## 5. Remediation Status (Feb 2026) - SUCCESS

- **Team Section**: **Fixed (Fossil Grey)**. All text switched to Fossil Grey. Readability is guaranteed by forcing the homepage to light mode via `layout.tsx` (ThemeProvider).
- **NMTF Section**: Verified. Cards use dark backgrounds (`bg-[#4D4A46]`) where Lime Green text is high-contrast and appropriate.
- **Podcast Section**: Fixed. Headphones icon switched to Fossil Grey for visibility on light backgrounds.
- **Trader Stories**: Fixed. All attribution names switched to Fossil Grey.
- **Contact Section**: Fixed. All card titles and form labels switched to Fossil Grey.
