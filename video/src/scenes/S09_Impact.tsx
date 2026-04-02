import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S09_Impact: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { impact } = config;

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.greenDim} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
        <div style={{ width: 1100, display: "flex", flexDirection: "column", gap: 32 }}>
          <div style={{ opacity: titleOpacity, textAlign: "center" }}>
            <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.lime, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 8 }}>Measurable Impact</p>
            <h2 style={{ fontFamily: FONTS.sans, fontSize: 44, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.03em" }}>Before & After</h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {impact.metrics.map((metric, i) => {
              const rowDelay = 25 + i * 18;
              const rowOpacity = interpolate(frame, [rowDelay, rowDelay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const afterDelay = rowDelay + 30;
              const afterOpacity = interpolate(frame, [afterDelay, afterDelay + 12], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const afterScale = interpolate(frame, [afterDelay, afterDelay + 8, afterDelay + 12], [0.8, 1.05, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              return (
                <GradientCard key={metric.label} style={{ opacity: rowOpacity, padding: "20px 32px", display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <div style={{ width: 220 }}><span style={{ fontFamily: FONTS.sans, fontSize: 16, fontWeight: 600, color: BRAND.textSoft }}>{metric.label}</span></div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: BRAND.textMuted, display: "block", marginBottom: 4 }}>BEFORE</span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 700, color: BRAND.textMuted }}>{metric.before}</span>
                    </div>
                    <div style={{ width: 40, textAlign: "center", color: BRAND.textMuted, fontSize: 18 }}>→</div>
                    <div style={{ flex: 1, textAlign: "center", opacity: afterOpacity, transform: `scale(${afterScale})` }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: metric.afterColor, display: "block", marginBottom: 4 }}>AFTER</span>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 26, fontWeight: 800, color: metric.afterColor }}>{metric.after}</span>
                    </div>
                  </div>
                </GradientCard>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
