# Video Section + YouTube Content

## YouTube Title & Description

**Title:**
> Introducing Flourish AI — Retail Property Intelligence for the UK Market

**Description:**
> Discover how Flourish is transforming retail property management with AI-powered intelligence. From gap analysis to tenant matching, Flourish gives landlords and operators the data they need to make smarter decisions — across 2,600+ UK shopping centres, retail parks, and outlet centres.
>
> 🔗 Learn more: https://thisisflourish.co.uk
> 📩 Get in touch: https://thisisflourish.co.uk/#contact
>
> #RetailProperty #AI #ShoppingCentres #RetailIntelligence #UKRetail #PropertyManagement #Flourish

---

## Proposed Changes

### Navigation

#### [MODIFY] [v2-navigation.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-navigation.tsx)

Add a `"Watch the Video"` nav item linking to `#video` — inserted between **"About Us"** and **"Podcast"** in the `navigationItems` array.

---

### New Video Section Component

#### [NEW] [v2-video-section.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/components/v2-video-section.tsx)

A new section with `id="video"` placed between the Team and Podcast sections. Design matches the existing section patterns (Podcast section acts as the template):

- **Background:** `bg-[#4D4A46]` (dark brown — contrasts with the cream `#F7F4F2` Podcast section above/below for visual rhythm)
- **Header:** Icon (`Play` from Lucide) + "See Flourish in Action" heading in white
- **Subtitle:** Brief description of the video content
- **Embedded YouTube:** `aspect-video` iframe inside a `Card` (same pattern as Podcast)
- **CTA:** A prominent `Button` linking to `#contact` — "Get in Touch" / "Book a Demo"

---

### Homepage Assembly

#### [MODIFY] [page.tsx](file:///Users/mbeckett/Documents/codeprojects/flourish/src/app/page.tsx)

- Import `V2VideoSection`
- Place `<V2VideoSection />` between `<V2TeamSection />` and `<V2PodcastSection />`

---

## Verification Plan

### Manual Verification
1. Run `pnpm dev` and open `http://localhost:3000`
2. Confirm **"Watch the Video"** appears in both desktop and mobile nav
3. Clicking the nav link scrolls smoothly to the video section
4. Video section is visually consistent (dark `#4D4A46` bg, white text, lime CTA)
5. YouTube embed loads and plays correctly
6. CTA button scrolls to the `#contact` section
7. Check mobile responsiveness (video scales, CTA remains tappable)
