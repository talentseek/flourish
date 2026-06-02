import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { BRAND, FONTS } from "../../styles";
import type { TrainingVideoConfig } from "../../training-types";

/**
 * T05_Benefits — 4-card benefits summary grid
 * Duration: 240 frames / 8s
 */
export const T05_Benefits: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();

  const sectionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headlineY = interpolate(frame, [10, 35], [18, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const exitOpacity = interpolate(frame, [210, 240], [1, 0], { extrapolateLeft: "clamp" });

  // Lime glow — signals "solution"
  const glowOpacity = interpolate(
    Math.sin((frame / 40) * Math.PI),
    [-1, 1],
    [0.04, 0.12]
  );

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(230,251,96,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 120px",
          opacity: sectionOpacity,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 52, width: "100%" }}>

          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                color: BRAND.lime,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Why Spaces?
            </span>
            <h2
              style={{
                fontFamily: FONTS.sans,
                fontSize: 54,
                fontWeight: 800,
                color: BRAND.text,
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                textAlign: "center",
              }}
            >
              Everything in one place
            </h2>
          </div>

          {/* 2x2 benefit cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
            }}
          >
            {config.benefits.map((benefit, i) => {
              const cardOpacity = interpolate(
                frame,
                [45 + i * 22, 72 + i * 22],
                [0, 1],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );
              const cardY = interpolate(
                frame,
                [45 + i * 22, 72 + i * 22],
                [28, 0],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );

              return (
                <div
                  key={i}
                  style={{
                    background: `${BRAND.surface}DD`,
                    border: `1px solid ${benefit.color}33`,
                    borderRadius: 20,
                    padding: "32px 36px",
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Accent line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(90deg, ${benefit.color}, transparent)`,
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 24,
                      fontWeight: 700,
                      color: benefit.color,
                      margin: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {benefit.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 18,
                      color: BRAND.textSoft,
                      margin: 0,
                      fontWeight: 400,
                      lineHeight: 1.55,
                    }}
                  >
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
