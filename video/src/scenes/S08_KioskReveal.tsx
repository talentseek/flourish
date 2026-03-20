import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  OffthreadVideo,
  staticFile,
} from "remotion";
import { DotGrid } from "../components/DotGrid";
import { BRAND, FONTS } from "../styles";

const BADGES = [
  { label: "Visual Merchandising ✓", color: BRAND.lime },
  { label: "Compliance ✓", color: BRAND.green },
  { label: "Occupancy Live ✓", color: BRAND.teal },
];

export const S08_KioskReveal: React.FC = () => {
  const frame = useCurrentFrame();

  // Video fade in
  const vidOpacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Overlay text
  const overlayOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid />
      <AbsoluteFill style={{ opacity: exitOpacity }}>
        {/* Full-frame kiosk video (muted) */}
        <AbsoluteFill
          style={{
            opacity: vidOpacity,
          }}
        >
          <OffthreadVideo
            src={staticFile("artisans-kiosk.mp4")}
            volume={0}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          {/* Cinematic vignette */}
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(10, 22, 40, 0.85) 100%)",
            }}
          />
          {/* Bottom gradient for text readability */}
          <AbsoluteFill
            style={{
              background: `linear-gradient(0deg, ${BRAND.bg} 0%, transparent 40%)`,
            }}
          />
        </AbsoluteFill>

        {/* Overlay content */}
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            padding: 80,
            opacity: overlayOpacity,
          }}
        >
          <div>
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                color: BRAND.lime,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 10,
              }}
            >
              Curated by Flourish
            </p>
            <h2
              style={{
                fontFamily: FONTS.sans,
                fontSize: 48,
                fontWeight: 800,
                color: BRAND.text,
                margin: 0,
                letterSpacing: "-0.03em",
              }}
            >
              Artisans of Scotland
            </h2>
            <p
              style={{
                fontFamily: FONTS.sans,
                fontSize: 20,
                color: BRAND.textSoft,
                margin: 0,
                marginTop: 8,
              }}
            >
              Main Atrium Kiosk — Braehead Shopping Centre
            </p>

            {/* Badges */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {BADGES.map((badge, i) => {
                const bDelay = 80 + i * 20;
                const bOpacity = interpolate(
                  frame,
                  [bDelay, bDelay + 15],
                  [0, 1],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                );
                const bY = interpolate(
                  frame,
                  [bDelay, bDelay + 15],
                  [15, 0],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                );
                return (
                  <span
                    key={badge.label}
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      fontWeight: 700,
                      color: badge.color,
                      background: `${badge.color}15`,
                      border: `1px solid ${badge.color}40`,
                      padding: "8px 16px",
                      borderRadius: 8,
                      opacity: bOpacity,
                      transform: `translateY(${bY}px)`,
                    }}
                  >
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
