import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S07_Outreach: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { outreach } = config;

  // ── Phase 1: Counter (frames 0–110) ──
  const counterOpacity = interpolate(frame, [0, 15, 90, 110], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const count = Math.round(interpolate(frame, [10, 80], [0, 79], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }));

  // Micro-flash: random-ish recipient name chips appearing & fading
  const chipNames = [
    "Moyses Stevens", "McQueens", "Wild at Heart", "Rebel Rebel",
    "That Flower Shop", "Philippa Craddock", "Interflora London",
    "Blooms Flowers", "Flowers By Post", "Grace & Thorn",
    "Scarlet & Violet", "Flowerbx", "Bloom & Wild HQ",
  ];

  // ── Phase 2: Email panel (frames 105–180) ──
  const panelOpacity = interpolate(frame, [105, 125], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const panelY = interpolate(frame, [105, 125], [30, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subjectChars = Math.min(
    Math.floor(interpolate(frame, [125, 165], [0, outreach.subject.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
    outreach.subject.length
  );
  const sentFrame = 165;
  const sentScale = interpolate(frame, [sentFrame, sentFrame + 8, sentFrame + 14], [0, 1.1, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sentOpacity = interpolate(frame, [sentFrame, sentFrame + 5], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const exitOpacity = interpolate(frame, [175, 180], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.greenDim} />

      {/* ── Phase 1: 0→79 counter ── */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: counterOpacity, flexDirection: "column", gap: 0 }}>
        {/* Eyebrow */}
        <p style={{ fontFamily: FONTS.mono, fontSize: 14, color: BRAND.teal, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
          Flourish Outreach Engine
        </p>

        {/* Big counter */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, lineHeight: 1 }}>
          <span style={{ fontFamily: FONTS.sans, fontSize: 160, fontWeight: 900, color: BRAND.lime, letterSpacing: "-0.06em", lineHeight: 1 }}>
            {count}
          </span>
          <span style={{ fontFamily: FONTS.sans, fontSize: 40, fontWeight: 700, color: BRAND.textSoft, marginBottom: 24 }}>
            florists contacted
          </span>
        </div>

        {/* Location context */}
        <p style={{ fontFamily: FONTS.sans, fontSize: 20, color: BRAND.textMuted, margin: 0, marginTop: 12 }}>
          London-based operators — identified &amp; contacted in under 1 week
        </p>

        {/* Scrolling name chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 36, maxWidth: 900, justifyContent: "center" }}>
          {chipNames.map((name, i) => {
            const chipDelay = 12 + i * 5;
            const chipOpacity = interpolate(
              frame,
              [chipDelay, chipDelay + 6, chipDelay + 30, chipDelay + 40],
              [0, 1, 1, 0.35],
              { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
            );
            return (
              <span
                key={name}
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 13,
                  color: BRAND.textSoft,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${BRAND.border}`,
                  padding: "6px 14px",
                  borderRadius: 8,
                  opacity: chipOpacity,
                }}
              >
                {name}
              </span>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* ── Phase 2: Email compose panel ── */}
      {frame >= 100 && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
          <GradientCard style={{ width: 900, opacity: panelOpacity, transform: `translateY(${panelY}px)` }}>
            <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: BRAND.teal }} />
                <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.textMuted }}>NEW MESSAGE</span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: BRAND.textMuted }}>via Flourish Outreach</span>
            </div>

            <div style={{ padding: "16px 28px", borderBottom: `1px solid ${BRAND.border}` }}>
              <div style={{ display: "flex", gap: 40, marginBottom: 8 }}>
                <div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: BRAND.textMuted }}>FROM</span>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 16, color: BRAND.text, margin: 0, marginTop: 2 }}>Flourish Team</p>
                </div>
                <div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: BRAND.textMuted }}>TO</span>
                  <p style={{ fontFamily: FONTS.sans, fontSize: 16, color: BRAND.text, margin: 0, marginTop: 2 }}>{outreach.recipientName}</p>
                </div>
              </div>
              <div>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: BRAND.textMuted }}>SUBJECT</span>
                <p style={{ fontFamily: FONTS.sans, fontSize: 18, fontWeight: 600, color: BRAND.text, margin: 0, marginTop: 2 }}>
                  {outreach.subject.slice(0, subjectChars)}
                  {subjectChars < outreach.subject.length && <span style={{ color: BRAND.teal }}>▋</span>}
                </p>
              </div>
            </div>

            <div style={{ padding: "20px 28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {outreach.bullets.map((bullet, i) => {
                  const bDelay = 130 + i * 8;
                  const bOpacity = interpolate(frame, [bDelay, bDelay + 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                  const bX = interpolate(frame, [bDelay, bDelay + 12], [15, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, opacity: bOpacity, transform: `translateX(${bX}px)` }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.teal, flexShrink: 0 }} />
                      <span style={{ fontFamily: FONTS.sans, fontSize: 16, color: BRAND.textSoft, lineHeight: 1.5 }}>{bullet}</span>
                    </div>
                  );
                })}
              </div>

              {frame >= sentFrame && (
                <div style={{ marginTop: 24, textAlign: "center", opacity: sentOpacity, transform: `scale(${sentScale})` }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: BRAND.green, background: BRAND.greenDim, border: `2px solid ${BRAND.green}`, padding: "10px 24px", borderRadius: 10 }}>
                    ✓ SENT × 79 FLORISTS
                  </div>
                </div>
              )}
            </div>
          </GradientCard>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
