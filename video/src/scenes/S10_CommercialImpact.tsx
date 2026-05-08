import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S10_CommercialImpact: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const ci = config.commercialImpact;

  if (!ci) return null;

  const eyebrowOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [10, 28], [20, 0], { extrapolateRight: "clamp" });

  // Left card (before)
  const leftOpacity = interpolate(frame, [35, 55], [0, 1], { extrapolateRight: "clamp" });
  const leftY = interpolate(frame, [35, 55], [25, 0], { extrapolateRight: "clamp" });

  // Right card (after) — delayed pop
  const rightOpacity = interpolate(frame, [70, 88], [0, 1], { extrapolateRight: "clamp" });
  const rightScale = interpolate(frame, [70, 78, 88], [0.8, 1.08, 1], { extrapolateRight: "clamp" });

  // Monthly subtitle inside right card
  const monthlyOpacity = interpolate(frame, [92, 108], [0, 1], { extrapolateRight: "clamp" });

  // Arrow between cards
  const arrowOpacity = interpolate(frame, [58, 70], [0, 1], { extrapolateRight: "clamp" });

  // Caption line
  const captionOpacity = interpolate(frame, [115, 135], [0, 1], { extrapolateRight: "clamp" });

  const exitOpacity = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.greenDim} />

      {/* Subtle lime glow behind the right card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 35% 50% at 68% 50%, ${BRAND.limeDim} 0%, transparent 70%)`,
          opacity: rightOpacity,
        }}
      />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
        <div style={{ width: 1200, display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>

          {/* Heading */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.lime, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, marginBottom: 10, opacity: eyebrowOpacity }}>
              Commercial Outcome
            </p>
            <h2 style={{ fontFamily: FONTS.sans, fontSize: 52, fontWeight: 900, color: BRAND.text, margin: 0, letterSpacing: "-0.04em", opacity: titleOpacity, transform: `translateY(${titleY}px)` }}>
              Revenue Generated
            </h2>
          </div>

          {/* Before → After cards */}
          <div style={{ display: "flex", alignItems: "center", gap: 32, width: "100%" }}>

            {/* LEFT: Before */}
            <GradientCard style={{ flex: 1, padding: "40px 48px", textAlign: "center", opacity: leftOpacity, transform: `translateY(${leftY}px)`, borderLeft: `3px solid ${BRAND.red}` }}>
              <p style={{ fontFamily: FONTS.mono, fontSize: 12, color: BRAND.textMuted, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
                Before Flourish
              </p>
              <div style={{ fontFamily: FONTS.sans, fontSize: 88, fontWeight: 900, color: BRAND.red, letterSpacing: "-0.05em", lineHeight: 1 }}>
                {ci.rentBefore}
              </div>
              <p style={{ fontFamily: FONTS.sans, fontSize: 18, color: BRAND.textMuted, margin: 0, marginTop: 16 }}>
                Annual Revenue from this space
              </p>
            </GradientCard>

            {/* Arrow */}
            <div style={{ fontSize: 48, color: BRAND.textMuted, opacity: arrowOpacity, flexShrink: 0 }}>→</div>

            {/* RIGHT: After */}
            <GradientCard
              style={{
                flex: 1,
                padding: "40px 48px",
                textAlign: "center",
                opacity: rightOpacity,
                transform: `scale(${rightScale})`,
                borderLeft: `3px solid ${BRAND.lime}`,
                background: `linear-gradient(135deg, rgba(230,251,96,0.06) 0%, rgba(255,255,255,0.02) 100%)`,
              }}
            >
              <p style={{ fontFamily: FONTS.mono, fontSize: 12, color: BRAND.lime, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
                After Flourish
              </p>
              <div style={{ fontFamily: FONTS.sans, fontSize: 72, fontWeight: 900, color: BRAND.lime, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {ci.annualAfter}
              </div>
              <div style={{ opacity: monthlyOpacity, marginTop: 14 }}>
                <span style={{
                  fontFamily: FONTS.mono,
                  fontSize: 18,
                  color: BRAND.green,
                  background: BRAND.greenDim,
                  border: `1px solid ${BRAND.green}`,
                  padding: "6px 18px",
                  borderRadius: 8,
                }}>
                  {ci.rentAfter}
                </span>
              </div>
            </GradientCard>
          </div>

          {/* Caption */}
          <p style={{ fontFamily: FONTS.sans, fontSize: 20, color: BRAND.textMuted, margin: 0, textAlign: "center", opacity: captionOpacity, fontStyle: "italic" }}>
            One gap identified. One week of outreach. One new revenue stream.
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
