import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Img, staticFile } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S10_BrandedCTA: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { location } = config;

  const logoOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const logoScale = interpolate(frame, [0, 25], [0.8, 1], { extrapolateRight: "clamp" });
  const headingOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const headingY = interpolate(frame, [20, 40], [20, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const tagOpacity = interpolate(frame, [40, 58], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const btnOpacity = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const pulseScale = interpolate(Math.sin(frame * 0.06), [-1, 1], [1, 1.03]);
  const urlOpacity = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const footerOpacity = interpolate(frame, [100, 120], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 40% at 50% 45%, ${BRAND.tealDim} 0%, transparent 70%)` }} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <Img src={staticFile("flourish-logo.png")} style={{ width: 140, height: "auto", opacity: logoOpacity, transform: `scale(${logoScale})` }} />
          <h1 style={{ fontFamily: FONTS.sans, fontSize: 56, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.04em", opacity: headingOpacity, transform: `translateY(${headingY}px)`, textAlign: "center", lineHeight: 1.15 }}>
            {location.ctaHeading.split(location.name).map((part, i, arr) => (
              <React.Fragment key={i}>
                {part}
                {i < arr.length - 1 && <span style={{ color: BRAND.teal }}>{location.name}</span>}
              </React.Fragment>
            ))}
          </h1>
          <p style={{ fontFamily: FONTS.sans, fontSize: 22, color: BRAND.textSoft, margin: 0, opacity: tagOpacity, fontWeight: 300, letterSpacing: "-0.01em", textAlign: "center" }}>{location.ctaTagline}</p>
          <div style={{ opacity: btnOpacity, transform: `scale(${pulseScale})`, marginTop: 12 }}>
            <div style={{ background: BRAND.lime, color: BRAND.black, fontFamily: FONTS.sans, fontSize: 18, fontWeight: 700, padding: "16px 44px", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, letterSpacing: "-0.01em" }}>Request a Demo →</div>
          </div>
          <p style={{ fontFamily: FONTS.mono, fontSize: 16, color: BRAND.teal, margin: 0, opacity: urlOpacity, letterSpacing: "0.02em" }}>thisisflourish.co.uk</p>
          <p style={{ fontFamily: FONTS.sans, fontSize: 14, color: BRAND.textMuted, margin: 0, opacity: footerOpacity, marginTop: 20 }}>{location.footer}</p>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
