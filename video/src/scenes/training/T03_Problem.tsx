import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { BRAND, FONTS } from "../../styles";
import type { TrainingVideoConfig } from "../../training-types";

/**
 * T03_Problem — "Before Spaces…" pain points
 * Duration: 210 frames / 7s
 */
export const T03_Problem: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();

  const containerOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headlineY = interpolate(frame, [10, 35], [18, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Hold content for the full scene — exit near the very end
  const exitOpacity = interpolate(frame, [330, 360], [1, 0], { extrapolateLeft: "clamp" });

  // Ambient red glow — signals "problem"
  const glowOpacity = interpolate(frame, [0, 30], [0, 0.12], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <DotGrid tint="rgba(248,113,113,0.06)" />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 60%, rgba(248,113,113,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: containerOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 52,
            width: "100%",
            padding: "0 160px",
          }}
        >
          {/* Headline */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
            }}
          >
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                color: BRAND.red,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              The Old Way
            </span>
            <h2
              style={{
                fontFamily: FONTS.sans,
                fontSize: 62,
                fontWeight: 800,
                color: BRAND.text,
                margin: 0,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {config.problem.headline}
            </h2>
          </div>

          {/* Pain points grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              width: "100%",
              maxWidth: 960,
            }}
          >
            {config.problem.pain_points.map((point, i) => {
              const cardOpacity = interpolate(
                frame,
                [45 + i * 20, 70 + i * 20],
                [0, 1],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );
              const cardY = interpolate(
                frame,
                [45 + i * 20, 70 + i * 20],
                [24, 0],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );

              return (
                <div
                  key={i}
                  style={{
                    background: `${BRAND.surface}CC`,
                    border: `1px solid ${BRAND.red}22`,
                    borderRadius: 16,
                    padding: "28px 32px",
                    display: "flex",
                    alignItems: "center",
                    gap: 20,
                    opacity: cardOpacity,
                    transform: `translateY(${cardY}px)`,
                  }}
                >
                  <span style={{ fontSize: 36, lineHeight: 1 }}>{point.icon}</span>
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 20,
                      color: BRAND.text,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {point.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
