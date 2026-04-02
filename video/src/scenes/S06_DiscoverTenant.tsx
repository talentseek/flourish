import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DotGrid } from "../components/DotGrid";
import { GradientCard } from "../components/GradientCard";
import { BRAND, FONTS } from "../styles";
import type { ShowcaseConfig } from "../types";

export const S06_DiscoverTenant: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  const frame = useCurrentFrame();
  const { tenant } = config;

  const scanPhase = frame * 0.06;
  const scanOpacity = interpolate(frame, [0, 10, 75, 85], [0, 1, 1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scanRingScale = interpolate(Math.sin(scanPhase), [-1, 1], [0.95, 1.05]);
  const cardOpacity = interpolate(frame, [90, 110], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const cardX = interpolate(frame, [90, 115], [60, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const matchProgress = interpolate(frame, [120, 170], [0, tenant.matchScore], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const productsOpacity = interpolate(frame, [140, 160], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const exitOpacity = interpolate(frame, [220, 240], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill>
      <DotGrid tint={BRAND.limeDim} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: exitOpacity, padding: 80 }}>
        {frame < 90 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, opacity: scanOpacity }}>
            <div style={{ position: "relative", width: 140, height: 140 }}>
              {[0, 1, 2].map((ring) => {
                const ringDelay = ring * 15;
                const ringOpacity = interpolate(frame, [ringDelay, ringDelay + 10], [0, 0.3 - ring * 0.08], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
                return <div key={ring} style={{ position: "absolute", inset: -ring * 25, borderRadius: "50%", border: `2px solid ${BRAND.teal}`, opacity: ringOpacity, transform: `scale(${scanRingScale})` }} />;
              })}
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: BRAND.tealDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 40 }}>🔍</span>
              </div>
            </div>
            <p style={{ fontFamily: FONTS.mono, fontSize: 15, color: BRAND.teal, letterSpacing: "0.1em" }}>FLOURISH AI SCANNING TENANT NETWORK...</p>
          </div>
        )}

        {frame >= 90 && (
          <div style={{ display: "flex", gap: 50, alignItems: "center", width: 1300, opacity: cardOpacity, transform: `translateX(${cardX}px)` }}>
            <GradientCard style={{ flex: 1, padding: "36px 40px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 11, color: BRAND.green, letterSpacing: "0.15em", textTransform: "uppercase" }}>✓ MATCH FOUND</div>
                <h2 style={{ fontFamily: FONTS.sans, fontSize: 40, fontWeight: 800, color: BRAND.text, margin: 0, letterSpacing: "-0.02em" }}>{tenant.name}</h2>
                <p style={{ fontFamily: FONTS.sans, fontSize: 18, color: BRAND.textSoft, margin: 0, lineHeight: 1.6 }}>{tenant.description}</p>

                <div style={{ display: "flex", gap: 10 }}>
                  {tenant.categories.map((cat, i) => (
                    <span key={cat} style={{ fontFamily: FONTS.mono, fontSize: 12, color: i === 0 ? BRAND.amber : BRAND.teal, background: i === 0 ? BRAND.amberDim : BRAND.tealDim, padding: "5px 14px", borderRadius: 8 }}>{cat}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 8, opacity: productsOpacity }}>
                  {tenant.products.map((product) => (
                    <div key={product} style={{ flex: 1, height: 80, borderRadius: 10, background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))", border: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "center", padding: 8 }}>
                      <span style={{ fontFamily: FONTS.sans, fontSize: 11, color: BRAND.textMuted, textAlign: "center" }}>{product}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GradientCard>

            <div style={{ width: 260, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 180, height: 180 }}>
                <svg width={180} height={180} style={{ transform: "rotate(-90deg)" }}>
                  <circle cx={90} cy={90} r={80} fill="none" stroke={BRAND.border} strokeWidth={6} />
                  <circle cx={90} cy={90} r={80} fill="none" stroke={BRAND.green} strokeWidth={6} strokeDasharray={`${(matchProgress / 100) * 502} 502`} strokeLinecap="round" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                  <span style={{ fontFamily: FONTS.sans, fontSize: 48, fontWeight: 800, color: BRAND.green }}>{Math.floor(matchProgress)}%</span>
                </div>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.textMuted, letterSpacing: "0.08em" }}>COMPATIBILITY SCORE</span>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
