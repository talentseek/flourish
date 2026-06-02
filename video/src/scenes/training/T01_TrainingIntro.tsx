import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { BRAND, FONTS } from "../../styles";
import type { TrainingVideoConfig } from "../../training-types";

/**
 * T01_TrainingIntro — Flourish logo + feature name reveal
 * Duration: 210 frames / 7s (extra hold before T02)
 */
export const T01_TrainingIntro: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();

  const logoOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(frame, [0, 30], [0.65, 1], { extrapolateRight: "clamp" });

  const badgeOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badgeY = interpolate(frame, [20, 40], [10, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const headlineOpacity = interpolate(frame, [40, 65], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headlineY = interpolate(frame, [40, 65], [24, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const tagOpacity = interpolate(frame, [65, 85], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const lineWidth = interpolate(frame, [75, 100], [0, 420], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Hold fully visible until frame 150, then fade over 25 frames — leaves breathing room before T02
  const exitOpacity = interpolate(frame, [150, 175], [1, 0], { extrapolateLeft: "clamp" });

  // Subtle teal glow that pulses
  const glowOpacity = interpolate(
    Math.sin((frame / 30) * Math.PI),
    [-1, 1],
    [0.06, 0.18]
  );

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 50%, rgba(6,182,212,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          {/* Flourish logo */}
          <Img
            src={staticFile("flourish-logo.png")}
            style={{
              width: 152,
              height: "auto",
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />

          {/* "New Feature" badge */}
          <div
            style={{
              opacity: badgeOpacity,
              transform: `translateY(${badgeY}px)`,
              background: `linear-gradient(135deg, ${BRAND.teal}22, ${BRAND.lime}22)`,
              border: `1px solid ${BRAND.teal}55`,
              borderRadius: 100,
              padding: "6px 20px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: BRAND.lime,
                boxShadow: `0 0 6px ${BRAND.lime}`,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                color: BRAND.lime,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              {config.feature.version ?? "New Feature"}
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: FONTS.sans,
              fontSize: 72,
              fontWeight: 800,
              color: BRAND.text,
              margin: 0,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
              textAlign: "center",
            }}
          >
            {config.intro.headline.split("Spaces").map((part: string, i: number, arr: string[]) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span style={{ color: BRAND.teal }}> Spaces</span>
                )}
              </React.Fragment>
            ))}
          </h1>

          {/* Location context pill */}
          <div
            style={{
              opacity: tagOpacity,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                height: 1,
                width: lineWidth,
                background: `linear-gradient(90deg, transparent, ${BRAND.teal}88)`,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: 20,
                color: BRAND.textSoft,
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              {config.location.fullName}
            </span>
            <div
              style={{
                height: 1,
                width: lineWidth,
                background: `linear-gradient(90deg, ${BRAND.teal}88, transparent)`,
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
