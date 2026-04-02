import { BRAND } from "../styles";
import type { ShowcaseConfig } from "../types";

export const royalExchange: ShowcaseConfig = {
  id: "RoyalExchangeSuccess",

  location: {
    name: "The Royal Exchange",
    fullName: "The Royal Exchange",
    address: "Royal Exchange, London, EC3V 3LL",
    tagline: "AI-Powered Retail Intelligence",
    ctaHeading: "See What Flourish Delivered for The Royal Exchange",
    ctaTagline: "Gap detection. Targeted outreach. Real-world results.",
    footer: "A Flourish Success Story — The Royal Exchange, London",
  },

  problem: {
    headline: "£2.3 Billion",
    headlineSuffix: "lost to empty retail\nunits every year.",
    subtitle:
      "Even London's most prestigious destinations\nhave hidden gaps in their tenant mix.",
    stats: [
      { value: "12.4%", label: "National vacancy rate", color: BRAND.red },
      { value: "£45K+", label: "Lost per premium void / year", color: BRAND.amber },
      { value: "0", label: "Florists at the Royal Exchange", color: BRAND.textSoft },
    ],
  },

  search: {
    searchText: "The Royal Exchange",
    results: [
      { name: "The Royal Exchange", loc: "City of London", type: "Shopping Centre", match: true },
      { name: "Royal Exchange Buildings", loc: "London EC3", type: "Office", match: false },
      { name: "Manchester Royal Exchange", loc: "Manchester", type: "Theatre", match: false },
    ],
  },

  intelligence: {
    kpis: [
      { value: 35, suffix: "+", label: "Luxury Retailers", color: BRAND.lime },
      { value: 2, suffix: "M", label: "Annual Visitors", color: BRAND.teal },
      { value: 20370, suffix: " sqft", label: "Retail Floor Area", color: BRAND.text },
      { value: 4.6, suffix: "★", label: "Google Rating", color: BRAND.amber, decimals: 1 },
      { value: 450, suffix: "+ yrs", label: "Heritage Since 1571", color: BRAND.green },
    ],
    anchors: ["Hermès", "Tiffany & Co", "Omega", "Fortnum & Mason", "Boodles", "Jo Malone", "Bremont", "Georg Jensen", "Montblanc"],
  },

  gapAnalysis: {
    categories: [
      { name: "Jewellery & Watches", pct: 26, color: "#06B6D4" },
      { name: "Cafes & Restaurants", pct: 23, color: "#4ADE80" },
      { name: "Clothing & Footwear", pct: 14, color: "#E8458B" },
      { name: "Health & Beauty", pct: 9, color: "#FBBF24" },
      { name: "Food & Grocery", pct: 6, color: "#38BDF8" },
      { name: "Gifts & Stationery", pct: 6, color: "#A78BFA" },
      { name: "Flowers & Florists", pct: 0, color: "#F97316", isGap: true },
    ],
    gapCategory: "Flowers & Florists",
    gapDetail: "0% coverage —",
    competitors: "comparable luxury centres like Burlington Arcade and One New Change all feature premium florists.",
    missingBrands: ["McQueens", "Rebel Rebel", "That Flower Shop", "Moyses Stevens", "Wild at Heart", "Philippa Craddock"],
  },

  tenant: {
    name: "3 London Florists",
    description: "Flourish identified and contacted 79 London-based florists within a single week. Three outstanding operators visited the site — each bringing unique floral artistry to the City.",
    categories: ["Flowers & Florists", "Premium Retail"],
    products: ["Jen's Plants & Florist", "Flowers With Swag", "Blooms London Bridge"],
    matchScore: 92,
  },

  outreach: {
    subject: "Exciting opportunity at The Royal Exchange, City of London",
    bullets: [
      "Premium concession in a Grade I listed landmark",
      "2M+ annual visitors — affluent City of London clientele",
      "No existing florist — a completely uncontested category",
      "Positioned alongside Hermès, Tiffany & Co, and Fortnum & Mason",
    ],
    recipientName: "79 London Florists",
  },

  reveal: {
    media: "florist-royal-exchange.png",
    mediaType: "image",
    tenantName: "3 Florists Visited the Site",
    placement: "Premium Concession — The Royal Exchange Courtyard",
    badges: [
      { label: "Jen's Plants & Florist ★", color: BRAND.lime },
      { label: "Flowers With Swag ★", color: BRAND.green },
      { label: "Blooms London Bridge ★", color: BRAND.teal },
    ],
  },

  impact: {
    metrics: [
      { label: "Category Coverage", before: "0 Florists", after: "3 Site Visits", afterColor: BRAND.green },
      { label: "Outreach Volume", before: "—", after: "79 Contacted", afterColor: BRAND.teal },
      { label: "Response Rate", before: "—", after: "~20%", afterColor: BRAND.lime },
      { label: "Timeline", before: "Gap Identified", after: "1 Week to Visits", afterColor: BRAND.green },
    ],
  },

  // Custom soundtrack for this showcase
  soundtrack: "soundtrack-epic.mp3",
};
