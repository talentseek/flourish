import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  Img,
  staticFile,
} from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";

export const S01_BrandedIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // Logo entrance
  const logoScale = interpolate(frame, [0, 30], [0.6, 1], {
    extrapolateRight: "clamp",
  });
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Divider expands
  const dividerWidth = interpolate(frame, [20, 40], [0, 60], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Client name slides in
  const clientOpacity = interpolate(frame, [30, 45], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const clientX = interpolate(frame, [30, 45], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Tagline fades
  const tagOpacity = interpolate(frame, [45, 60], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Teal accent line
  const lineWidth = interpolate(frame, [50, 65], [0, 300], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [75, 90], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      {/* Central teal glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 40% 40% at 50% 50%, ${BRAND.tealDim} 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          {/* Flourish logo */}
          <Img
            src={staticFile("flourish-logo.png")}
            style={{
              width: 160,
              height: "auto",
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />

          {/* Divider + Client name row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginTop: 8,
            }}
          >
            <div
              style={{
                height: 1,
                width: dividerWidth,
                background: `linear-gradient(90deg, transparent, ${BRAND.teal})`,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.sans,
                fontSize: 36,
                fontWeight: 700,
                color: BRAND.text,
                letterSpacing: "-0.02em",
                opacity: clientOpacity,
                transform: `translateX(${clientX}px)`,
              }}
            >
              Braehead
            </span>
            <div
              style={{
                height: 1,
                width: dividerWidth,
                background: `linear-gradient(90deg, ${BRAND.teal}, transparent)`,
              }}
            />
          </div>

          {/* Tagline */}
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: BRAND.teal,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              margin: 0,
              opacity: tagOpacity,
            }}
          >
            AI-Powered Retail Intelligence
          </p>

          {/* Accent underline */}
          <div
            style={{
              height: 2,
              width: lineWidth,
              background: `linear-gradient(90deg, transparent, ${BRAND.teal}, transparent)`,
              borderRadius: 1,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
