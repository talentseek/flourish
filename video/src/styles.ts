// Flourish brand tokens for Remotion videos
export const BRAND = {
  bg: "#0A1628",
  bgAlt: "#0F2135",
  surface: "#132038",
  elevated: "#1C2D4A",
  border: "rgba(255, 255, 255, 0.06)",
  borderLight: "rgba(255, 255, 255, 0.10)",
  teal: "#06B6D4",
  tealDim: "rgba(6, 182, 212, 0.10)",
  tealMid: "rgba(6, 182, 212, 0.30)",
  tealDark: "#0E7490",
  lime: "#E6FB60",
  limeDim: "rgba(230, 251, 96, 0.08)",
  limeMid: "rgba(230, 251, 96, 0.25)",
  green: "#4ADE80",
  greenDim: "rgba(74, 222, 128, 0.10)",
  amber: "#FBBF24",
  amberDim: "rgba(251, 191, 36, 0.10)",
  red: "#F87171",
  redDim: "rgba(248, 113, 113, 0.10)",
  coral: "#E8458B",
  text: "rgba(255, 255, 255, 0.90)",
  textSoft: "rgba(255, 255, 255, 0.65)",
  textMuted: "rgba(255, 255, 255, 0.40)",
  textDim: "rgba(255, 255, 255, 0.06)",
  white: "#ffffff",
  black: "#000000",
} as const;

export const FONTS = {
  sans: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

// Video configuration — 30fps, 1080p
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 2100, // 70 seconds
} as const;

// Scene frame allocations (30fps)
// Total: 2100 frames = 70 seconds
export const SCENES = {
  brandedIntro:     { from: 0,    duration: 90  },   //  3s — Logo + Braehead
  theProblem:       { from: 90,   duration: 180 },   //  6s — Empty units crisis
  searchBraehead:   { from: 270,  duration: 240 },   //  8s — Dashboard search
  dataIntelligence: { from: 510,  duration: 210 },   //  7s — Stats counters
  gapAnalysis:      { from: 720,  duration: 300 },   // 10s — Category bars + gap
  discoverArtisans: { from: 1020, duration: 240 },   //  8s — Brand reveal
  outreach:         { from: 1260, duration: 180 },   //  6s — Email mock
  kioskReveal:      { from: 1440, duration: 240 },   //  8s — Kiosk image
  impact:           { from: 1680, duration: 180 },   //  6s — Before/after
  brandedCTA:       { from: 1860, duration: 240 },   //  8s — CTA
} as const;
