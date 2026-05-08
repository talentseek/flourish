import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, OffthreadVideo, staticFile } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";

export const S12_GrokWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const overlayOpacity = interpolate(frame, [30, 55], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badge1Opacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badge1Y = interpolate(frame, [60, 75], [12, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badge2Opacity = interpolate(frame, [72, 88], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const badge2Y = interpolate(frame, [72, 88], [12, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  // Phone frame dimensions (portrait, scaled to fit 1080p canvas)
  const phoneW = 420;
  const phoneH = 910;
  const phoneBorderR = 44;

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <DotGrid tint={BRAND.tealDim} />

      {/* Ambient glow behind phone */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 30% 55% at 50% 50%, rgba(230,251,96,0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Phone frame container */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            width: phoneW,
            height: phoneH,
            borderRadius: phoneBorderR,
            border: `2px solid rgba(255,255,255,0.14)`,
            boxShadow: `0 0 60px rgba(6,182,212,0.18), 0 40px 80px rgba(0,0,0,0.7)`,
            overflow: "hidden",
            position: "relative",
            background: "#000",
          }}
        >
          {/* Notch bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 30,
              background: "#000",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16,
              zIndex: 10,
            }}
          />

          {/* Video content */}
          <OffthreadVideo
            src={staticFile("jens-walkthrough.mp4")}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            volume={0}
          />
        </div>
      </AbsoluteFill>

      {/* Text overlay — bottom left of screen */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "60px 80px", opacity: overlayOpacity }}>
        <div>
          <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.lime, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0, marginBottom: 10 }}>
            The Result
          </p>
          <h2 style={{ fontFamily: FONTS.sans, fontSize: 48, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Jen's Plants
          </h2>
          <p style={{ fontFamily: FONTS.sans, fontSize: 20, color: BRAND.textSoft, margin: 0, marginTop: 6 }}>
            Site Visit — The Royal Exchange Courtyard
          </p>

          {/* Badges */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: BRAND.lime, background: BRAND.limeDim, border: `1px solid ${BRAND.limeMid}`, padding: "8px 18px", borderRadius: 8, opacity: badge1Opacity, transform: `translateY(${badge1Y}px)` }}>
              Identified by Flourish AI
            </span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, color: BRAND.teal, background: BRAND.tealDim, border: `1px solid ${BRAND.tealMid}`, padding: "8px 18px", borderRadius: 8, opacity: badge2Opacity, transform: `translateY(${badge2Y}px)` }}>
              1 of 3 Site Visits
            </span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
