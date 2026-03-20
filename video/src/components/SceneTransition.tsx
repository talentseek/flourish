import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * Wraps a scene with a standardised enter/exit transition.
 * Enter: 15-frame fade + translateY.  Exit: 15-frame fade.
 */
export const SceneTransition: React.FC<{
  children: React.ReactNode;
  durationInFrames: number;
  enterDuration?: number;
  exitDuration?: number;
  enterY?: number;
}> = ({
  children,
  durationInFrames,
  enterDuration = 18,
  exitDuration = 18,
  enterY = 25,
}) => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, enterDuration], [0, 1], {
    extrapolateRight: "clamp",
  });
  const enterTranslate = interpolate(frame, [0, enterDuration], [enterY, 0], {
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [durationInFrames - exitDuration, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${enterTranslate}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
