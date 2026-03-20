import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";

const STATS = [
  { value: "12.4%", label: "National vacancy rate", color: BRAND.red },
  { value: "£18K", label: "Lost per empty unit / year", color: BRAND.amber },
  { value: "3.2 yrs", label: "Average void period", color: BRAND.textSoft },
];

export const S02_TheProblem: React.FC = () => {
  const frame = useCurrentFrame();

  // Headline
  const headlineOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const headlineY = interpolate(frame, [0, 20], [30, 0], {
    extrapolateRight: "clamp",
  });

  // Big number accent
  const numberScale = interpolate(frame, [15, 35], [0.8, 1], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp",
  });

  // Exit
  const exitOpacity = interpolate(frame, [160, 180], [1, 0], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.redDim} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          opacity: exitOpacity,
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 80,
            alignItems: "center",
            width: 1400,
          }}
        >
          {/* Left: Headline */}
          <div
            style={{
              flex: 1,
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
            }}
          >
            <p
              style={{
                fontFamily: FONTS.mono,
                fontSize: 13,
                color: BRAND.red,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: 0,
                marginBottom: 16,
              }}
            >
              The Challenge
            </p>
            <h1
              style={{
                fontFamily: FONTS.sans,
                fontSize: 52,
                fontWeight: 800,
                color: BRAND.text,
                margin: 0,
                letterSpacing: "-0.03em",
                lineHeight: 1.15,
              }}
            >
              <span
                style={{
                  color: BRAND.red,
                  transform: `scale(${numberScale})`,
                  display: "inline-block",
                }}
              >
                £2.3 Billion
              </span>
              <br />
              lost to empty retail
              <br />
              units every year.
            </h1>
            <p
              style={{
                fontFamily: FONTS.sans,
                fontSize: 20,
                color: BRAND.textMuted,
                margin: 0,
                marginTop: 20,
                lineHeight: 1.6,
              }}
            >
              UK shopping centres are bleeding revenue through
              <br />
              unoptimised tenant mixes and prolonged vacancies.
            </p>
          </div>

          {/* Right: Stat cards */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              width: 380,
            }}
          >
            {STATS.map((stat, i) => {
              const delay = 30 + i * 25;
              const cardOpacity = interpolate(
                frame,
                [delay, delay + 20],
                [0, 1],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );
              const cardX = interpolate(
                frame,
                [delay, delay + 20],
                [40, 0],
                { extrapolateRight: "clamp", extrapolateLeft: "clamp" }
              );

              return (
                <GradientCard
                  key={stat.label}
                  style={{
                    opacity: cardOpacity,
                    transform: `translateX(${cardX}px)`,
                    padding: "24px 28px",
                  }}
                >
                  <div
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 36,
                      fontWeight: 800,
                      color: stat.color,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.sans,
                      fontSize: 15,
                      color: BRAND.textMuted,
                      marginTop: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                </GradientCard>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
