# Brand Profile: Flourish

## 1. Visual Identity Overview
Flourish is a retail intelligence and placemaking platform. Its visual identity is designed to feel professional, data-driven, and slightly edgy (using the high-contrast lime green/fossil grey combination).

## 2. Core Color Palette

| Color Name | Hex Code | Role | Description |
|------------|----------|------|-------------|
| **Fossil Grey** | `#4D4A46` | **Primary Text / Background** | The foundation of the brand. Strong, readable, and professional. |
| **Lime Green** | `#E6FB60` | **Accent / Action** | Used for emphasis, highlights, and backgrounds of dark text. |
| **White Beige** | `#F7F4F2` | **Page Background** | The neutral canvas for the platform. |
| **Stone Grey** | `#A69D94` | **Secondary** | Muted elements, borders, or secondary text. |
| **Pearl Silver** | `#D8D8D6` | **Borders/Dividers** | Subtle structural elements. |

## 3. Color Usage & Accessibility Rules

### 3.1 The "Lime Green" Rule (CRITICAL)
The Lime Green (`#E6FB60`) is an extremely high-luminance color. It has **poor contrast** against light backgrounds.

- **DO NOT** use Lime Green for text (headings, names, subtexts) on White Beige or light layouts.
- **DO NOT** use Lime Green for thin icons on light backgrounds.
- **DO use** Lime Green as a **background** for dark text (Black or Fossil Grey).
- **DO use** Lime Green for **hover states** or **active indicators** only if the underlying element remains legible.
- **DO use** Lime Green for text **on any dark background** (Fossil Grey, Black, or **Dark Mode Cards**).

### 3.3 Theme Preference & Accessibility Guard
The public-facing components (specifically V2 sections) are designed for a **Light Theme** (White Beige background). Because of the delicate contrast requirements for the Lime Green/Fossil Grey palette:
- **FORCED LIGHT MODE**: The public homepage and enterprise portals (e.g., Landsec) **MUST** force the `light` theme at the `ThemeProvider` level (`defaultTheme="light"`, `enableSystem={false}`). 
- This prevents "Dark-on-Dark" rendering issues where system-dark preferences could cause backgrounds to flip to Fossil Grey while text remains Fossil Grey.
- **Server-side enforcement** in `layout.tsx` is preferred over client-side logic to avoid the "flash of dark theme" during initial hydration.

### 3.2 Typography Standards
- **Primary Text**: Always use **Fossil Grey (`#4D4A46`)** for body text and headers on light backgrounds.
- **Emphasis Text**: Use Fossil Grey with a Lime Green background (as a pill or badge).

## 4. Section-Specific Implementation (V2)

### 4.1 Team Section
- **Card Titles**: Must be Fossil Grey or Stone Grey. Never Lime Green on white.
- **Labels (e.g., "Fun Fact")**: Use bold Fossil Grey. If Lime Green is needed, use it as a background highlight for the text.

### 4.2 Podcast Section
- **Icons**: Ensure icons have sufficient weight or a dark container if using Lime Green.

## 5. CSS/Tailwind Strategy
Avoid hardcoding `#E6FB60` as a text color class (`text-[#E6FB60]`). Use theme variables:
- `text-foreground` (defaults to Fossil Grey)
- `bg-primary` (Lime Green background)
- `text-primary-foreground` (Fossil Grey text on Lime Green)

## 6. Verified Implementation Patterns

### Primary Header on Light Background
```tsx
// YES
<h2 className="text-[#4D4A46]">Flourish Podcast</h2>
// NO
<h2 className="text-[#E6FB60]">Flourish Podcast</h2>
```

### High-Contrast Badge
```tsx
// YES
<span className="bg-[#E6FB60] text-[#4D4A46] px-2 py-1 rounded-full">
  New
</span>
```

### Team Member Identity (Contrast-Aware)
```tsx
// Option A: If background is LIGHT beige (Default / Forced Light Mode)
// This is the current implementation on the public homepage.
<CardTitle className="text-xl text-[#4D4A46]">{member.name}</CardTitle>

// Option B: If background is DARK (Fossil Grey backgrounds or Dark Mode Cards)
<CardTitle className="text-xl text-[#E6FB60]">{member.name}</CardTitle>
```

### Dark Background Exception (NMTF Pattern)
```tsx
// YES - Lime Green on Fossil Grey background is high-contrast (~10:1)
<Card className="bg-[#4D4A46]">
  <CardTitle className="text-[#E6FB60]">Who are NMTF?</CardTitle>
</Card>
```
