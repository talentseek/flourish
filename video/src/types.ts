import { BRAND } from "./styles";

/**
 * ShowcaseConfig — the single data shape that drives an entire
 * Flourish programmatic video. Swap this config to generate a
 * video for any location.
 */
export interface ShowcaseConfig {
  /** Composition ID used by Remotion (PascalCase, no spaces) */
  id: string;

  // ── Scene 1 & 10: Branded bookends ──
  location: {
    name: string;           // "Braehead"
    fullName: string;       // "Braehead Shopping Centre"
    address: string;        // "Kings Inch Road, Renfrew, Glasgow PA4 8XQ"
    tagline: string;        // "AI-Powered Retail Intelligence"
    ctaHeading: string;     // "Unlock Braehead's Hidden Potential"
    ctaTagline: string;     // "AI-powered gap analysis. Curated tenants. Real results."
    footer: string;         // "Prepared exclusively for Braehead Shopping Centre"
  };

  // ── Scene 2: The Problem ──
  problem: {
    headline: string;       // "£2.3 Billion"
    headlineSuffix: string; // "lost to empty retail\nunits every year."
    subtitle: string;       // "UK shopping centres are bleeding revenue..."
    stats: Array<{
      value: string;
      label: string;
      color: string;
    }>;
  };

  // ── Scene 3: Search ──
  search: {
    searchText: string;     // "Braehead Shopping Centre"
    results: Array<{
      name: string;
      loc: string;
      type: string;
      match: boolean;
    }>;
  };

  // ── Scene 4: Data Intelligence ──
  intelligence: {
    kpis: Array<{
      value: number;
      suffix: string;
      label: string;
      color: string;
      decimals?: number;
    }>;
    anchors: string[];
  };

  // ── Scene 5: Gap Analysis ──
  gapAnalysis: {
    categories: Array<{
      name: string;
      pct: number;
      color: string;
      isGap?: boolean;
    }>;
    gapCategory: string;        // "Gifts & Stationery"
    gapDetail: string;          // "67% below competitor average..."
    competitors: string;        // "Silverburn and St Enoch both have 4× more coverage"
    missingBrands: string[];
  };

  // ── Scene 6: Discover tenant ──
  tenant: {
    name: string;               // "Artisans of Scotland"
    description: string;        // "Celebrating Scotland's finest craftsmen..."
    categories: string[];       // ["Gifts & Stationery", "Scottish Heritage"]
    products: string[];         // ["Tartan Wraps", "Celtic Kilt Pins", ...]
    matchScore: number;         // 94
  };

  // ── Scene 7: Outreach ──
  outreach: {
    subject: string;
    bullets: string[];
    recipientName: string;      // "Artisans of Scotland"
  };

  // ── Scene 8: Kiosk / Reveal ──
  reveal: {
    /** filename in public/ — can be .mp4 (video) or .png/.jpg (image) */
    media: string;
    mediaType: "video" | "image";
    tenantName: string;
    placement: string;          // "Main Atrium Kiosk — Braehead Shopping Centre"
    badges: Array<{ label: string; color: string }>;
  };

  // ── Scene 9: Impact ──
  impact: {
    metrics: Array<{
      label: string;
      before: string;
      after: string;
      afterColor: string;
    }>;
  };

  // ── Optional: Custom soundtrack ──
  /** Filename in public/ — defaults to "soundtrack.mp3" */
  soundtrack?: string;
}
