import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";

export const S06_DiscoverArtisans: React.FC = () => {
  const frame = useCurrentFrame();

  // Scanning indicator: frames 0-80
  const scanPhase = frame * 0.06;
  const scanOpacity = interpolate(frame, [0, 10, 75, 85], [0, 1, 1, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const scanRingScale = interpolate(
    Math.sin(scanPhase),
    [-1, 1],
    [0.95, 1.05]
  );

  // Brand card: frames 90+
  const cardOpacity = interpolate(frame, [90, 110], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });
  const cardX = interpolate(frame, [90, 115], [60, 0], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Match score counter: frames 120+
  const matchProgress = interpolate(frame, [120, 170], [0, 94], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Product thumbnails
  const productsOpacity = interpolate(frame, [140, 160], [0, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.limeDim} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
          padding: 80,
        }}
      >
        {/* Scanning phase */}
        {frame < 90 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 24,
              opacity: scanOpacity,
            }}
          >
            {/* Radar rings */}
            <div style={{ position: "relative", width: 140, height: 140 }}>
              {[0, 1, 2].map((ring) => {
                const ringDelay = ring * 15;
                const ringOpacity = interpolate(
                  frame,
                  [ringDelay, ringDelay + 10],
                  [0, 0.3 - ring * 0.08],
                  { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
                );
                return (
                  <div
                    key={ring}
                    style={{
                      position: "absolute",
                      inset: -ring * 25,
                      borderRadius: "50%",
                      border: `2px solid ${BRAND.teal}`,
                      opacity: ringOpacity,
                      transform: `scale(${scanRingScale})`,
                    }}
                  />
                );
              })}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background: BRAND.tealDim,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 40 }}>🔍</span>
              </div>
            </div>
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: 15,
                color: BRAND.teal,
                letterSpacing: "0.1em",
              }}
            >
              FLOURISH AI SCANNING TENANT NETWORK...
            </p>
          </div>
        )}

        {/* Brand reveal */}
        {frame >= 90 && (
          <div
            style={{
              display: "flex",
              gap: 50,
              alignItems: "center",
              width: 1300,
              opacity: cardOpacity,
              transform: `translateX(${cardX}px)`,
            }}
          >
            {/* Brand card */}
            <GradientCard
              style={{
                flex: 1,
                padding: "36px 40px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 11,
                    color: BRAND.green,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  ✓ MATCH FOUND
                </div>
                <h2
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 40,
                    fontWeight: 800,
                    color: BRAND.text,
                    margin: 0,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Artisans of Scotland
                </h2>
                <p
                  style={{
                    fontFamily: FONTS.sans,
                    fontSize: 18,
                    color: BRAND.textSoft,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Celebrating Scotland's finest craftsmen — handcrafted tartan,
                  pewter, kilt accessories, and artisan gifts.
                </p>

                {/* Category badge */}
                <div style={{ display: "flex", gap: 10 }}>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      color: BRAND.amber,
                      background: BRAND.amberDim,
                      padding: "5px 14px",
                      borderRadius: 8,
                    }}
                  >
                    Gifts & Stationery
                  </span>
                  <span
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 12,
                      color: BRAND.teal,
                      background: BRAND.tealDim,
                      padding: "5px 14px",
                      borderRadius: 8,
                    }}
                  >
                    Scottish Heritage
                  </span>
                </div>

                {/* Mini product grid */}
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    marginTop: 8,
                    opacity: productsOpacity,
                  }}
                >
                  {["Tartan Wraps", "Celtic Kilt Pins", "Pewter Jewellery", "Gift Vouchers"].map(
                    (product, i) => (
                      <div
                        key={product}
                        style={{
                          flex: 1,
                          height: 80,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))`,
                          border: `1px solid ${BRAND.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 8,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: FONTS.sans,
                            fontSize: 11,
                            color: BRAND.textMuted,
                            textAlign: "center",
                          }}
                        >
                          {product}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </GradientCard>

            {/* Match score */}
            <div
              style={{
                width: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ position: "relative", width: 180, height: 180 }}>
                {/* Circular progress */}
                <svg
                  width={180}
                  height={180}
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx={90}
                    cy={90}
                    r={80}
                    fill="none"
                    stroke={BRAND.border}
                    strokeWidth={6}
                  />
                  <circle
                    cx={90}
                    cy={90}
                    r={80}
                    fill="none"
                    stroke={BRAND.green}
                    strokeWidth={6}
                    strokeDasharray={`${(matchProgress / 100) * 502} 502`}
                    strokeLinecap="round"
                  />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <span
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 48,
                      fontWeight: 800,
                      color: BRAND.green,
                    }}
                  >
                    {Math.floor(matchProgress)}%
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 13,
                  color: BRAND.textMuted,
                  letterSpacing: "0.08em",
                }}
              >
                COMPATIBILITY SCORE
              </span>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
