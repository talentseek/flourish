import { BRAND } from "../styles";
import type { ShowcaseConfig } from "../types";

export const braehead: ShowcaseConfig = {
  id: "BraeheadShowcase",

  location: {
    name: "Braehead",
    fullName: "Braehead Shopping Centre",
    address: "Kings Inch Road, Renfrew, Glasgow PA4 8XQ",
    tagline: "AI-Powered Retail Intelligence",
    ctaHeading: "Unlock Braehead's Hidden Potential",
    ctaTagline: "AI-powered gap analysis. Curated tenants. Real results.",
    footer: "Prepared exclusively for Braehead Shopping Centre",
  },

  problem: {
    headline: "£2.3 Billion",
    headlineSuffix: "lost to empty retail\nunits every year.",
    subtitle:
      "UK shopping centres are bleeding revenue through\nunoptimised tenant mixes and prolonged vacancies.",
    stats: [
      { value: "12.4%", label: "National vacancy rate", color: BRAND.red },
      { value: "£18K", label: "Lost per empty unit / year", color: BRAND.amber },
      { value: "3.2 yrs", label: "Average void period", color: BRAND.textSoft },
    ],
  },

  search: {
    searchText: "Braehead Shopping Centre",
    results: [
      { name: "Braehead Shopping Centre", loc: "Renfrew, Glasgow", type: "Shopping Centre", match: true },
      { name: "Braehead Retail Park", loc: "Renfrew", type: "Retail Park", match: false },
      { name: "Braehead Arena", loc: "Glasgow", type: "Leisure", match: false },
    ],
  },

  intelligence: {
    kpis: [
      { value: 120, suffix: "+", label: "Active Retailers", color: BRAND.lime },
      { value: 15, suffix: "M", label: "Annual Footfall", color: BRAND.teal },
      { value: 1.1, suffix: "M sqft", label: "Retail Floor Area", color: BRAND.text, decimals: 1 },
      { value: 6500, suffix: "", label: "Free Parking Spaces", color: BRAND.green },
      { value: 4.2, suffix: "★", label: "Google Rating", color: BRAND.amber, decimals: 1 },
    ],
    anchors: ["M&S", "Primark", "H&M", "Next", "Apple", "JD Sports", "Flannels", "TK Maxx", "Currys"],
  },

  gapAnalysis: {
    categories: [
      { name: "Clothing & Footwear", pct: 28, color: "#06B6D4" },
      { name: "Health & Beauty", pct: 15, color: "#E8458B" },
      { name: "Cafes & Restaurants", pct: 13, color: "#4ADE80" },
      { name: "Jewellery & Watches", pct: 8, color: "#FBBF24" },
      { name: "Electrical & Technology", pct: 7, color: "#38BDF8" },
      { name: "Home & Garden", pct: 5, color: "#A78BFA" },
      { name: "Gifts & Stationery", pct: 2, color: "#F97316", isGap: true },
    ],
    gapCategory: "Gifts & Stationery",
    gapDetail: "67% below",
    competitors: "competitor average. Silverburn and St Enoch both have 4× more coverage in this category.",
    missingBrands: ["Oliver Bonas", "Paperchase", "The Works", "Anthropologie", "Flying Tiger", "Cath Kidston", "Molton Brown"],
  },

  tenant: {
    name: "Artisans of Scotland",
    description: "Celebrating Scotland's finest craftsmen — handcrafted tartan, pewter, kilt accessories, and artisan gifts.",
    categories: ["Gifts & Stationery", "Scottish Heritage"],
    products: ["Tartan Wraps", "Celtic Kilt Pins", "Pewter Jewellery", "Gift Vouchers"],
    matchScore: 94,
  },

  outreach: {
    subject: "Exciting kiosk opportunity at Braehead Shopping Centre",
    bullets: [
      "Premium kiosk location in Scotland's largest shopping centre",
      "15M+ annual footfall with 6,500 free parking spaces",
      "Curated space in the main atrium — high visibility",
      "Full compliance and visual merchandising support",
    ],
    recipientName: "Artisans of Scotland",
  },

  reveal: {
    media: "artisans-kiosk.mp4",
    mediaType: "video",
    tenantName: "Artisans of Scotland",
    placement: "Main Atrium Kiosk — Braehead Shopping Centre",
    badges: [
      { label: "Visual Merchandising ✓", color: BRAND.lime },
      { label: "Compliance ✓", color: BRAND.green },
      { label: "Occupancy Live ✓", color: BRAND.teal },
    ],
  },

  impact: {
    metrics: [
      { label: "Vacancy Status", before: "⊘ Gap", after: "✓ Filled", afterColor: BRAND.green },
      { label: "Category Coverage", before: "78%", after: "94%", afterColor: BRAND.green },
      { label: "Footfall Impact", before: "—", after: "+12% in zone", afterColor: BRAND.teal },
      { label: "Annual Revenue", before: "—", after: "+£45K", afterColor: BRAND.lime },
    ],
  },
};
