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
 * T06_TrainingClosing — "Ready to try Spaces?" — CTA with URL and footer
 * Duration: 240 frames / 8s
 */
export const T06_TrainingClosing: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { closing } = config;

  const logoOpacity = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(frame, [0, 30], [0.8, 1], { extrapolateRight: "clamp" });

  const headlineOpacity = interpolate(frame, [25, 50], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headlineY = interpolate(frame, [25, 50], [24, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const instrOpacity = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  const btnOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const pulseScale = interpolate(Math.sin((frame / 30) * Math.PI * 0.5), [-1, 1], [1, 1.025]);

  const urlOpacity = interpolate(frame, [90, 110], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const footerOpacity = interpolate(frame, [110, 130], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Animated teal glow
  const glowOpacity = interpolate(
    Math.sin((frame / 35) * Math.PI),
    [-1, 1],
    [0.06, 0.20]
  );

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 45%, rgba(6,182,212,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            maxWidth: 860,
            textAlign: "center",
          }}
        >
          {/* Flourish logo */}
          <Img
            src={staticFile("flourish-logo.png")}
            style={{
              width: 128,
              height: "auto",
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />

          {/* "Spaces" feature chip */}
          <div
            style={{
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: `linear-gradient(135deg, ${BRAND.teal}22, ${BRAND.lime}22)`,
              border: `1px solid ${BRAND.teal}55`,
              borderRadius: 100,
              padding: "8px 24px",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: BRAND.teal,
                boxShadow: `0 0 8px ${BRAND.teal}`,
              }}
            />
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 14,
                color: BRAND.teal,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
              }}
            >
              Spaces
            </span>
          </div>

          {/* Main headline */}
          <h1
            style={{
              fontFamily: FONTS.sans,
              fontSize: 62,
              fontWeight: 800,
              color: BRAND.text,
              margin: 0,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
            }}
          >
            {closing.headline}
          </h1>

          {/* Instruction */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 22,
              color: BRAND.textSoft,
              margin: 0,
              fontWeight: 300,
              lineHeight: 1.55,
              opacity: instrOpacity,
            }}
          >
            {closing.instruction}
          </p>

          {/* CTA button */}
          <div
            style={{
              opacity: btnOpacity,
              transform: `scale(${pulseScale})`,
              marginTop: 8,
            }}
          >
            <div
              style={{
                background: BRAND.lime,
                color: BRAND.black,
                fontFamily: FONTS.sans,
                fontSize: 19,
                fontWeight: 700,
                padding: "18px 52px",
                borderRadius: 14,
                letterSpacing: "-0.01em",
                boxShadow: `0 0 32px ${BRAND.lime}44`,
              }}
            >
              Go to Space Bookings →
            </div>
          </div>

          {/* URL */}
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 15,
              color: BRAND.teal,
              margin: 0,
              opacity: urlOpacity,
              letterSpacing: "0.02em",
            }}
          >
            {closing.url}
          </p>

          {/* Footer */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 14,
              color: BRAND.textMuted,
              margin: 0,
              opacity: footerOpacity,
              marginTop: 8,
            }}
          >
            {closing.footer}
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
