import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S07_Outreach: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { outreach } = config;

  const panelOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const panelY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" });
  const subjectChars = Math.min(Math.floor(interpolate(frame, [20, 75], [0, outreach.subject.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })), outreach.subject.length);
  const sentFrame = 140;
  const sentScale = interpolate(frame, [sentFrame, sentFrame + 8, sentFrame + 14], [0, 1.1, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const sentOpacity = interpolate(frame, [sentFrame, sentFrame + 5], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.greenDim} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
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
                const bDelay = 80 + i * 10;
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
                  ✓ SENT SUCCESSFULLY
                </div>
              </div>
            )}
          </div>
        </GradientCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
