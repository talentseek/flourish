import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { BRAND, FONTS } from "../../styles";
import type { TrainingVideoConfig } from "../../training-types";

/**
 * T02_FeatureReveal — "What is Spaces?" — headline + 4 bullet capabilities
 * Duration: 210 frames / 7s
 */
export const T02_FeatureReveal: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();

  const sectionOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headlineY = interpolate(frame, [10, 35], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const subOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Hold content for the full scene — exit near the very end
  const exitOpacity = interpolate(frame, [390, 420], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${BRAND.bg} 0%, ${BRAND.bgAlt} 100%)`,
        }}
      />
      <DotGrid tint={BRAND.tealDim} />

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 160px",
          opacity: sectionOpacity,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 48, width: "100%" }}>

          {/* Left-aligned header block */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Label pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 3,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${BRAND.teal}, ${BRAND.lime})`,
                }}
              />
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: BRAND.teal,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                What is Spaces?
              </span>
            </div>

            <h2
              style={{
                fontFamily: FONTS.sans,
                fontSize: 58,
                fontWeight: 800,
                color: BRAND.text,
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                opacity: headlineOpacity,
                transform: `translateY(${headlineY}px)`,
                maxWidth: 820,
              }}
            >
              {config.feature.tagline}
            </h2>

            <p
              style={{
                fontFamily: FONTS.sans,
                fontSize: 22,
                color: BRAND.textSoft,
                margin: 0,
                fontWeight: 300,
                lineHeight: 1.5,
                opacity: subOpacity,
                maxWidth: 680,
              }}
            >
              {config.intro.subheadline}
            </p>
          </div>

          {/* Capability bullets */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px 48px",
              width: "100%",
              maxWidth: 860,
            }}
          >
            {config.intro.bullets.map((bullet, i) => {
              const bulletOpacity = interpolate(
                frame,
                [60 + i * 22, 85 + i * 22],
                [0, 1],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );
              const bulletX = interpolate(
                frame,
                [60 + i * 22, 85 + i * 22],
                [-20, 0],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    opacity: bulletOpacity,
                    transform: `translateX(${bulletX}px)`,
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: BRAND.teal,
                      flexShrink: 0,
                      boxShadow: `0 0 8px ${BRAND.teal}88`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 20,
                      color: BRAND.text,
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {bullet}
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
