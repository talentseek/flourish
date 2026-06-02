import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Img, Video, staticFile } from "remotion";
import { DotGrid } from "../../components/DotGrid";
import { BRAND, FONTS } from "../../styles";
import type { TrainingVideoConfig } from "../../training-types";

interface StepSceneProps {
  config: TrainingVideoConfig;
  stepIndex: number;
  duration: number;
  screenshotSlot?: boolean;
}

/**
 * T04_StepScene — Generic walkthrough step scene.
 * Left: step badge, title, description, highlight callout.
 * Right: real Img / Video when step.media is set; dashed placeholder otherwise.
 */
export const T04_StepScene: React.FC<StepSceneProps> = ({
  config,
  stepIndex,
  duration,
  screenshotSlot = true,
}) => {
  const frame = useCurrentFrame();
  const step = config.steps[stepIndex];

  if (!step) return null;

  const containerOpacity  = interpolate(frame, [0,  18], [0, 1], { extrapolateRight: "clamp" });
  const stepNumOpacity    = interpolate(frame, [8,  28], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleOpacity      = interpolate(frame, [20, 42], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const titleY            = interpolate(frame, [20, 42], [18, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const descOpacity       = interpolate(frame, [38, 58], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const highlightOpacity  = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const mediaOpacity      = interpolate(frame, [30, 60], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const mediaScale        = interpolate(frame, [30, 60], [0.96, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const exitOpacity       = interpolate(frame, [duration - 30, duration], [1, 0], { extrapolateLeft: "clamp" });

  const glowOpacity = interpolate(Math.sin((frame / 30) * Math.PI), [-1, 1], [0.04, 0.14]);

  // ── Shared wrapper style for real media ───────────────────────────────────

  const mediaWrapStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    opacity: mediaOpacity,
    transform: `scale(${mediaScale})`,
    boxShadow: `0 0 0 1px ${BRAND.teal}33, 0 32px 64px rgba(0,0,0,0.5)`,
    background: BRAND.surface,
    maxHeight: 560,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // ── Right panel ───────────────────────────────────────────────────────────

  const renderRightPanel = () => {
    if (step.media?.type === "image") {
      return (
        <div style={mediaWrapStyle}>
          <Img
            src={staticFile(step.media.file)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      );
    }

    if (step.media?.type === "video") {
      return (
        <div style={mediaWrapStyle}>
          <Video
            src={staticFile(step.media.file)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            muted
            loop
            startFrom={0}
          />
        </div>
      );
    }

    // Placeholder
    return (
      <div
        style={{
          flex: 1,
          aspectRatio: "16/10",
          background: BRAND.surface,
          border: `2px dashed ${BRAND.teal}44`,
          borderRadius: 20,
          opacity: mediaOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Corner accents */}
        <div style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, borderTop: `2px solid ${BRAND.teal}88`, borderLeft: `2px solid ${BRAND.teal}88`, borderRadius: "4px 0 0 0" }} />
        <div style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, borderTop: `2px solid ${BRAND.teal}88`, borderRight: `2px solid ${BRAND.teal}88`, borderRadius: "0 4px 0 0" }} />
        <div style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, borderBottom: `2px solid ${BRAND.teal}88`, borderLeft: `2px solid ${BRAND.teal}88`, borderRadius: "0 0 0 4px" }} />
        <div style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, borderBottom: `2px solid ${BRAND.teal}88`, borderRight: `2px solid ${BRAND.teal}88`, borderRadius: "0 0 4px 0" }} />
        <span style={{ fontSize: 44, opacity: 0.35 }}>🖥️</span>
        <span style={{ fontFamily: FONTS.sans, fontSize: 16, color: BRAND.textMuted, fontWeight: 500, textAlign: "center", lineHeight: 1.5, maxWidth: 260 }}>
          Screenshot: {step.title}
        </span>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AbsoluteFill style={{ opacity: exitOpacity }}>
      <DotGrid tint={BRAND.tealDim} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 70% 50% at 20% 50%, rgba(6,182,212,${glowOpacity}) 0%, transparent 70%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "0 100px",
          gap: 80,
          opacity: containerOpacity,
        }}
      >
        {/* Left panel */}
        <div style={{ flex: "0 0 460px", display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Step badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: stepNumOpacity }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.tealDark})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: `0 0 20px ${BRAND.teal}44`,
              }}
            >
              <span style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 800, color: BRAND.white }}>
                {step.number}
              </span>
            </div>
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: BRAND.teal, letterSpacing: "0.10em", textTransform: "uppercase" }}>
              Step {step.number} of {config.steps.length}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: FONTS.sans,
              fontSize: 48,
              fontWeight: 800,
              color: BRAND.text,
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
            }}
          >
            {step.title}
          </h2>

          {/* Description */}
          <p
            style={{
              fontFamily: FONTS.sans,
              fontSize: 20,
              color: BRAND.textSoft,
              margin: 0,
              fontWeight: 400,
              lineHeight: 1.65,
              opacity: descOpacity,
            }}
          >
            {step.description}
          </p>

          {/* Highlight callout */}
          {step.highlight && (
            <div
              style={{
                opacity: highlightOpacity,
                background: `linear-gradient(135deg, ${BRAND.tealDim}, ${BRAND.limeDim})`,
                border: `1px solid ${BRAND.teal}44`,
                borderRadius: 12,
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20 }}>👉</span>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 15,
                  color: BRAND.lime,
                  letterSpacing: "0.02em",
                  fontWeight: 500,
                }}
              >
                {step.highlight}
              </span>
            </div>
          )}
        </div>

        {/* Right panel */}
        {screenshotSlot && renderRightPanel()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
