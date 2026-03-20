import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";

const CATEGORIES = [
  { name: "Clothing & Footwear", pct: 28, color: "#06B6D4" },
  { name: "Health & Beauty", pct: 15, color: "#E8458B" },
  { name: "Cafes & Restaurants", pct: 13, color: "#4ADE80" },
  { name: "Jewellery & Watches", pct: 8, color: "#FBBF24" },
  { name: "Electrical & Technology", pct: 7, color: "#38BDF8" },
  { name: "Home & Garden", pct: 5, color: "#A78BFA" },
  { name: "Gifts & Stationery", pct: 2, color: "#F97316", isGap: true },
];

const MISSING_BRANDS = [
  "Oliver Bonas", "Paperchase", "The Works", "Anthropologie",
  "Flying Tiger", "Cath Kidston", "Molton Brown",
];

export const S05_GapAnalysis: React.FC = () => {
  const frame = useCurrentFrame();

  // Title
  const titleOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Gap detected badge — dramatic reveal
  const gapFrame = 160;
  const gapBadgeScale = interpolate(
    frame,
    [gapFrame, gapFrame + 8, gapFrame + 12],
    [0, 1.15, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );
  const gapBadgeOpacity = interpolate(
    frame,
    [gapFrame, gapFrame + 5],
    [0, 1],
    { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
  );

  // Gap details
  const detailOpacity = interpolate(frame, [175, 195], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const detailY = interpolate(frame, [175, 195], [20, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Missing brands
  const brandsOpacity = interpolate(frame, [210, 230], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [280, 300], [1, 0], {
    extrapolateLeft: "clamp",
  });

  // Screen shake on gap detect
  const shakeX = frame >= gapFrame && frame <= gapFrame + 10
    ? Math.sin(frame * 2.5) * 3 * interpolate(frame, [gapFrame, gapFrame + 10], [1, 0], { extrapolateRight: "clamp" })
    : 0;

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.tealDim} />
      {/* Red glow on gap detect */}
      {frame >= gapFrame && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 50% 50% at 70% 50%, ${BRAND.redDim} 0%, transparent 60%)`,
            opacity: interpolate(frame, [gapFrame, gapFrame + 30], [0.5, 0], {
              extrapolateRight: "clamp",
            }),
          }}
        />
      )}
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
          padding: 80,
          transform: `translateX(${shakeX}px)`,
        }}
      >
        <div style={{ width: 1400, display: "flex", gap: 50 }}>
          {/* Left: Category bars */}
          <div style={{ flex: 1 }}>
            <div style={{ opacity: titleOpacity, marginBottom: 24 }}>
              <p
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: BRAND.teal,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                Tenant Mix Breakdown
              </p>
              <h2
                style={{
                  fontFamily: FONTS.sans,
                  fontSize: 40,
                  fontWeight: 800,
                  color: BRAND.text,
                  margin: 0,
                  letterSpacing: "-0.03em",
                }}
              >
                Category Analysis
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {CATEGORIES.map((cat, i) => {
                const barDelay = 20 + i * 12;
                const barWidth = interpolate(
                  frame,
                  [barDelay, barDelay + 30],
                  [0, cat.pct],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                );
                const labelOpacity = interpolate(
                  frame,
                  [barDelay, barDelay + 10],
                  [0, 1],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                );

                return (
                  <div key={cat.name} style={{ opacity: labelOpacity }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 14,
                          color: cat.isGap ? BRAND.red : BRAND.textSoft,
                          fontWeight: cat.isGap ? 700 : 400,
                        }}
                      >
                        {cat.name}
                        {cat.isGap && (
                          <span
                            style={{
                              fontFamily: FONTS.mono,
                              fontSize: 10,
                              color: BRAND.red,
                              background: BRAND.redDim,
                              padding: "2px 8px",
                              borderRadius: 4,
                              marginLeft: 8,
                            }}
                          >
                            GAP
                          </span>
                        )}
                      </span>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 13,
                          color: BRAND.textMuted,
                        }}
                      >
                        {barWidth.toFixed(0)}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 8,
                        borderRadius: 4,
                        background: BRAND.textDim,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${(barWidth / 30) * 100}%`,
                          borderRadius: 4,
                          background: cat.isGap
                            ? `linear-gradient(90deg, ${BRAND.red}, ${cat.color})`
                            : cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Gap detection */}
          <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 20 }}>
            {/* GAP DETECTED badge */}
            {frame >= gapFrame && (
              <div
                style={{
                  opacity: gapBadgeOpacity,
                  transform: `scale(${gapBadgeScale})`,
                  textAlign: "center",
                  padding: "20px 0",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    fontFamily: FONTS.mono,
                    fontSize: 18,
                    fontWeight: 700,
                    color: BRAND.red,
                    background: BRAND.redDim,
                    border: `2px solid ${BRAND.red}`,
                    padding: "12px 28px",
                    borderRadius: 12,
                    letterSpacing: "0.08em",
                  }}
                >
                  ⚠ GAP DETECTED
                </div>
              </div>
            )}

            {/* Gap detail card */}
            {frame >= 175 && (
              <GradientCard
                style={{
                  opacity: detailOpacity,
                  transform: `translateY(${detailY}px)`,
                  padding: "24px 28px",
                  borderLeft: `3px solid ${BRAND.red}`,
                }}
              >
                <h4
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 20,
                    fontWeight: 700,
                    color: BRAND.text,
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  Gifts & Stationery
                </h4>
                <p
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 15,
                    color: BRAND.textMuted,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  <span style={{ color: BRAND.red, fontWeight: 700 }}>67% below</span>{" "}
                  competitor average. Silverburn and St Enoch
                  both have 4× more coverage in this category.
                </p>
              </GradientCard>
            )}

            {/* Missing brands */}
            {frame >= 210 && (
              <div style={{ opacity: brandsOpacity }}>
                <p
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: BRAND.textMuted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    margin: 0,
                    marginBottom: 10,
                  }}
                >
                  Missing at Braehead
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {MISSING_BRANDS.map((brand, i) => {
                    const bDelay = 215 + i * 5;
                    const bOpacity = interpolate(
                      frame,
                      [bDelay, bDelay + 10],
                      [0, 1],
                      { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                    );
                    return (
                      <span
                        key={brand}
                        style={{
                          fontFamily: FONTS.sans,
                          fontSize: 13,
                          color: BRAND.textSoft,
                          background: "rgba(255,255,255,0.04)",
                          border: `1px solid ${BRAND.border}`,
                          padding: "6px 14px",
                          borderRadius: 8,
                          opacity: bOpacity,
                        }}
                      >
                        {brand}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
