import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";

const SEARCH_TEXT = "Braehead Shopping Centre";
const RESULTS = [
  { name: "Braehead Shopping Centre", loc: "Renfrew, Glasgow", type: "Shopping Centre", match: true },
  { name: "Braehead Retail Park", loc: "Renfrew", type: "Retail Park", match: false },
  { name: "Braehead Arena", loc: "Glasgow", type: "Leisure", match: false },
];

export const S03_SearchBraehead: React.FC = () => {
  const frame = useCurrentFrame();

  // Search bar appears
  const barOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });
  const barY = interpolate(frame, [0, 15], [20, 0], {
    extrapolateRight: "clamp",
  });

  // Typing: frames 20–100
  const charsVisible = Math.min(
    Math.floor(
      interpolate(frame, [20, 90], [0, SEARCH_TEXT.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    ),
    SEARCH_TEXT.length
  );

  // Dropdown appears: frame 100
  const dropdownOpacity = interpolate(frame, [100, 115], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const dropdownY = interpolate(frame, [100, 115], [10, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Selection highlight: frame 140
  const selectGlow = interpolate(frame, [140, 155], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Card morphs in: frame 160
  const cardOpacity = interpolate(frame, [160, 185], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const cardY = interpolate(frame, [160, 185], [30, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
          padding: 80,
        }}
      >
        <div style={{ width: 900, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Label */}
          <p
            style={{
              fontFamily: FONTS.mono,
              fontSize: 13,
              color: BRAND.teal,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              margin: 0,
              opacity: barOpacity,
            }}
          >
            Flourish Intelligence Platform
          </p>

          {/* Search bar */}
          <GradientCard
            style={{
              opacity: barOpacity,
              transform: `translateY(${barY}px)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", padding: "18px 24px", gap: 14 }}>
              {/* Search icon */}
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  border: `2px solid ${BRAND.teal}`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    bottom: -4,
                    right: -4,
                    width: 8,
                    height: 2,
                    background: BRAND.teal,
                    transform: "rotate(45deg)",
                    borderRadius: 1,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 22,
                  color: BRAND.text,
                  letterSpacing: "-0.01em",
                }}
              >
                {SEARCH_TEXT.slice(0, charsVisible)}
                {charsVisible < SEARCH_TEXT.length && (
                  <span style={{ color: BRAND.teal }}>▋</span>
                )}
              </span>
            </div>
          </GradientCard>

          {/* Dropdown results */}
          {frame >= 100 && (
            <GradientCard
              style={{
                opacity: dropdownOpacity,
                transform: `translateY(${dropdownY}px)`,
              }}
            >
              {RESULTS.map((r, i) => (
                <div
                  key={r.name}
                  style={{
                    padding: "14px 24px",
                    borderBottom: i < RESULTS.length - 1 ? `1px solid ${BRAND.border}` : undefined,
                    background: r.match && selectGlow > 0
                      ? `rgba(6, 182, 212, ${0.08 * selectGlow})`
                      : "transparent",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 18,
                        fontWeight: r.match ? 700 : 400,
                        color: r.match ? BRAND.text : BRAND.textMuted,
                      }}
                    >
                      {r.name}
                    </span>
                    <span
                      style={{
                        fontFamily: FONTS.sans,
                        fontSize: 14,
                        color: BRAND.textMuted,
                        marginLeft: 12,
                      }}
                    >
                      {r.loc}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 11,
                      color: r.match ? BRAND.teal : BRAND.textMuted,
                      background: r.match ? BRAND.tealDim : "transparent",
                      padding: "3px 10px",
                      borderRadius: 6,
                    }}
                  >
                    {r.type}
                  </span>
                </div>
              ))}
            </GradientCard>
          )}

          {/* Property card after selection */}
          {frame >= 160 && (
            <GradientCard
              style={{
                opacity: cardOpacity,
                transform: `translateY(${cardY}px)`,
                padding: "28px 32px",
                borderLeft: `3px solid ${BRAND.teal}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 28,
                      fontWeight: 700,
                      color: BRAND.text,
                      margin: 0,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Braehead Shopping Centre
                  </h3>
                  <p
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 16,
                      color: BRAND.textMuted,
                      margin: 0,
                      marginTop: 4,
                    }}
                  >
                    Kings Inch Road, Renfrew, Glasgow PA4 8XQ
                  </p>
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 12,
                    color: BRAND.lime,
                    background: BRAND.limeDim,
                    padding: "6px 16px",
                    borderRadius: 8,
                    fontWeight: 700,
                  }}
                >
                  ANALYSING...
                </div>
              </div>
            </GradientCard>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
