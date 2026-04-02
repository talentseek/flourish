import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  OffthreadVideo,
  Img,
  staticFile,
} from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S08_Reveal: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { reveal } = config;

  const mediaOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const zoom = reveal.mediaType === "image" ? interpolate(frame, [0, 240], [1, 1.04], { extrapolateRight: "clamp" }) : 1;
  const overlayOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ opacity: exitOpacity }}>
        <AbsoluteFill style={{ opacity: mediaOpacity, transform: `scale(${zoom})` }}>
          {reveal.mediaType === "video" ? (
            <OffthreadVideo src={staticFile(reveal.media)} volume={0} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Img src={staticFile(reveal.media)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10, 22, 40, 0.85) 100%)" }} />
          <AbsoluteFill style={{ background: `linear-gradient(0deg, ${BRAND.bg} 0%, transparent 40%)` }} />
        </AbsoluteFill>

        <AbsoluteFill style={{ justifyContent: "flex-end", padding: 80, opacity: overlayOpacity }}>
          <div>
            <p style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.lime, letterSpacing: "0.15em", textTransform: "uppercase", margin: 0, marginBottom: 10 }}>Curated by Flourish</p>
            <h2 style={{ fontFamily: FONTS.sans, fontSize: 48, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.03em" }}>{reveal.tenantName}</h2>
            <p style={{ fontFamily: FONTS.sans, fontSize: 20, color: BRAND.textSoft, margin: 0, marginTop: 8 }}>{reveal.placement}</p>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {reveal.badges.map((badge, i) => {
                const bDelay = 80 + i * 20;
                const bOpacity = interpolate(frame, [bDelay, bDelay + 15], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                const bY = interpolate(frame, [bDelay, bDelay + 15], [15, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return (
                  <span key={badge.label} style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: badge.color, background: `${badge.color}15`, border: `1px solid ${badge.color}40`, padding: "8px 16px", borderRadius: 8, opacity: bOpacity, transform: `translateY(${bY}px)` }}>
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
