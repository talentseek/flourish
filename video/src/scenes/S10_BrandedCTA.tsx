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

export const S10_BrandedCTA: React.FC = () => {
  const frame = useCurrentFrame();

  // Logo
  const logoOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const logoScale = interpolate(frame, [0, 25], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  // Heading
  const headingOpacity = interpolate(frame, [20, 40], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const headingY = interpolate(frame, [20, 40], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Tagline
  const tagOpacity = interpolate(frame, [40, 58], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Button
  const btnOpacity = interpolate(frame, [60, 80], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const pulseScale = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [1, 1.03]
  );

  // URL
  const urlOpacity = interpolate(frame, [80, 100], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Footer
  const footerOpacity = interpolate(frame, [100, 120], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      {/* Extra teal glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 45%, ${BRAND.tealDim} 0%, transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Logo */}
          <Img
            src={staticFile("flourish-logo.png")}
            style={{
              width: 140,
              height: "auto",
              opacity: logoOpacity,
              transform: `scale(${logoScale})`,
            }}
          />

          {/* Main heading */}
          <h1
            style={{
              fontFamily: FONTS.sans,
              fontSize: 56,
              fontWeight: 800,
              color: BRAND.text,
              margin: 0,
              letterSpacing: "-0.04em",
              opacity: headingOpacity,
              transform: `translateY(${headingY}px)`,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            Unlock{" "}
            <span style={{ color: BRAND.teal }}>Braehead's</span>
            <br />
            Hidden Potential
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 22,
              color: BRAND.textSoft,
              margin: 0,
              opacity: tagOpacity,
              fontWeight: 300,
              letterSpacing: "-0.01em",
              textAlign: "center",
            }}
          >
            AI-powered gap analysis. Curated tenants. Real results.
          </p>

          {/* CTA button */}
          <div
            style={{
              opacity: btnOpacity,
              transform: `scale(${pulseScale})`,
              marginTop: 12,
            }}
          >
            <div
              style={{
                background: BRAND.lime,
                color: BRAND.black,
                fontFamily: FONTS.sans,
                fontSize: 18,
                fontWeight: 700,
                padding: "16px 44px",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 10,
                letterSpacing: "-0.01em",
              }}
            >
              Request a Demo →
            </div>
          </div>

          {/* URL */}
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 16,
              color: BRAND.teal,
              margin: 0,
              opacity: urlOpacity,
              letterSpacing: "0.02em",
            }}
          >
            flourish.ai
          </p>

          {/* Footer */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 14,
              color: BRAND.textMuted,
              margin: 0,
              opacity: footerOpacity,
              marginTop: 20,
            }}
          >
            Prepared exclusively for Braehead Shopping Centre
          </p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
