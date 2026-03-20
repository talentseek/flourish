import React from "react";
import { AbsoluteFill } from "remotion";
import { BRAND } from "../styles";

export const DotGrid: React.FC<{ tint?: string }> = ({ tint }) => {
  const glowColor = tint || BRAND.tealDim;
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${glowColor} 0%, transparent 60%)`,
        }}
      />
    </AbsoluteFill>
  );
};
