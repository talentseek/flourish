import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S02_TheProblem: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { problem } = config;

  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: "clamp" });
  const numberScale = interpolate(frame, [15, 35], [0.8, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], { extrapolateLeft: "clamp" });

  const suffixLines = problem.headlineSuffix.split("\n");

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.redDim} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
        <div style={{ display: "flex", gap: 80, alignItems: "center", width: 1400 }}>
          <div style={{ flex: 1, opacity: headlineOpacity, transform: `translateY(${headlineY}px)` }}>
            <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.red, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 16 }}>
              The Challenge
            </p>
            <h1 style={{ fontFamily: FONTS.sans, fontSize: 52, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
              <span style={{ color: BRAND.red, transform: `scale(${numberScale})`, display: "inline-block" }}>
                {problem.headline}
              </span>
              {suffixLines.map((line, i) => (
                <React.Fragment key={i}><br />{line}</React.Fragment>
              ))}
            </h1>
            <p style={{ fontFamily: FONTS.sans, fontSize: 20, color: BRAND.textMuted, margin: 0, marginTop: 20, lineHeight: 1.6 }}>
              {problem.subtitle.split("\n").map((line, i) => (
                <React.Fragment key={i}>{i > 0 && <br />}{line}</React.Fragment>
              ))}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 380 }}>
            {problem.stats.map((stat, i) => {
              const delay = 30 + i * 25;
              const cardOpacity = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              const cardX = interpolate(frame, [delay, delay + 20], [40, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
              return (
                <GradientCard key={stat.label} style={{ opacity: cardOpacity, transform: `translateX(${cardX}px)`, padding: "24px 28px" }}>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800, color: stat.color, letterSpacing: "-0.02em" }}>{stat.value}</div>
                  <div style={{ fontFamily: FONTS.sans, fontSize: 15, color: BRAND.textMuted, marginTop: 4 }}>{stat.label}</div>
                </GradientCard>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
