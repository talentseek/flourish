import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S04_DataIntelligence: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { intelligence, location } = config;

  const labelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [190, 210], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
        <div style={{ width: 1300, display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ opacity: labelOpacity }}>
            <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.teal, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 8 }}>Location Intelligence</p>
            <h2 style={{ fontFamily: FONTS.sans, fontSize: 44, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.03em" }}>{location.name} at a Glance</h2>
          </div>

          <div style={{ display: "flex", gap: 16 }}>
            {intelligence.kpis.map((kpi, i) => {
              const delay = 15 + i * 12;
              const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const cardY = interpolate(frame, [delay, delay + 15], [25, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const counterProgress = interpolate(frame, [delay + 5, delay + 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const displayValue = kpi.decimals ? (kpi.value * counterProgress).toFixed(kpi.decimals) : Math.floor(kpi.value * counterProgress);
              return (
                <div key={kpi.label} style={{ flex: 1, opacity: cardOpacity, transform: `translateY(${cardY}px)`, borderRadius: 16, background: "rgba(255, 255, 255, 0.02)", border: `1px solid ${BRAND.border}`, padding: "28px 20px", textAlign: "center" }}>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 42, fontWeight: 800, color: kpi.color, letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {displayValue}<span style={{ fontSize: 28 }}>{kpi.suffix}</span>
                  </div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 13, color: BRAND.textMuted, marginTop: 10, letterSpacing: "0.02em" }}>{kpi.label}</div>
                </div>
              );
            })}
          </div>

          <div>
            <p style={{ fontFamily: FONTS.mono, fontSize: 12, color: BRAND.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0, marginBottom: 14, opacity: interpolate(frame, [80, 95], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" }) }}>Anchor Tenants</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {intelligence.anchors.map((name, i) => {
                const pillDelay = 90 + i * 6;
                const pillOpacity = interpolate(frame, [pillDelay, pillDelay + 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                const pillScale = interpolate(frame, [pillDelay, pillDelay + 12], [0.85, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                  <span key={name} style={{ fontFamily: FONTS.sans, fontSize: 15, fontWeight: 600, color: BRAND.lime, background: BRAND.limeDim, border: `1px solid ${BRAND.limeMid}`, padding: "8px 18px", borderRadius: 10, opacity: pillOpacity, transform: `scale(${pillScale})` }}>{name}</span>
                );
              })}
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
