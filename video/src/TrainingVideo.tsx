import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { BRAND } from "./styles";
import { TRAINING_SCENES } from "./training-styles";
import type { TrainingVideoConfig } from "./training-types";
import { T01_TrainingIntro } from "./scenes/training/T01_TrainingIntro";
import { T02_FeatureReveal } from "./scenes/training/T02_FeatureReveal";
import { T03_Problem } from "./scenes/training/T03_Problem";
import { T04_StepScene } from "./scenes/training/T04_StepScene";
import { T05_Benefits } from "./scenes/training/T05_Benefits";
import { T06_TrainingClosing } from "./scenes/training/T06_TrainingClosing";

/**
 * TrainingVideo — Remotion composition for internal training videos.
 *
 * Audio strategy:
 *  - Background music runs the full duration at low volume (0.07)
 *    so it sits gently behind the voiceover.
 *  - Each scene has its own voiceover Audio track, scoped inside
 *    its Sequence so timing is automatic.
 */
export const TrainingVideo: React.FC<{ config: TrainingVideoConfig }> = ({ config }) => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>

      {/* ── Background music — low volume under voiceover ── */}
      <Audio
        src={staticFile(config.soundtrack ?? "soundtrack.mp3")}
        volume={0.07}
        loop
      />

      {/* ── T01 — Branded intro ── */}
      <Sequence from={TRAINING_SCENES.brandedIntro.from} durationInFrames={TRAINING_SCENES.brandedIntro.duration}>
        <Audio src={staticFile("vo-intro.mp3")} volume={1} />
        <T01_TrainingIntro config={config} />
      </Sequence>

      {/* ── T02 — Feature reveal ── */}
      <Sequence from={TRAINING_SCENES.featureReveal.from} durationInFrames={TRAINING_SCENES.featureReveal.duration}>
        <Audio src={staticFile("vo-whatisspaces.mp3")} volume={1} />
        <T02_FeatureReveal config={config} />
      </Sequence>

      {/* ── T03 — Problem ── */}
      <Sequence from={TRAINING_SCENES.problem.from} durationInFrames={TRAINING_SCENES.problem.duration}>
        <Audio src={staticFile("vo-beforespaces.mp3")} volume={1} />
        <T03_Problem config={config} />
      </Sequence>

      {/* ── T04 — Step 1: Navigate to Spaces ── */}
      <Sequence from={TRAINING_SCENES.step1.from} durationInFrames={TRAINING_SCENES.step1.duration}>
        <Audio src={staticFile("vo-navigate.mp3")} volume={1} />
        <T04_StepScene config={config} stepIndex={0} duration={TRAINING_SCENES.step1.duration} />
      </Sequence>

      {/* ── T04 — Step 2: Select your location ── */}
      <Sequence from={TRAINING_SCENES.step2.from} durationInFrames={TRAINING_SCENES.step2.duration}>
        <Audio src={staticFile("vo-selectlocation.mp3")} volume={1} />
        <T04_StepScene config={config} stepIndex={1} duration={TRAINING_SCENES.step2.duration} />
      </Sequence>

      {/* ── T04 — Step 3: The Diary view ── */}
      <Sequence from={TRAINING_SCENES.step3.from} durationInFrames={TRAINING_SCENES.step3.duration}>
        <Audio src={staticFile("vo-diary.mp3")} volume={1} />
        <T04_StepScene config={config} stepIndex={2} duration={TRAINING_SCENES.step3.duration} />
      </Sequence>

      {/* ── T04 — Step 4: Create a booking ── */}
      <Sequence from={TRAINING_SCENES.step4.from} durationInFrames={TRAINING_SCENES.step4.duration}>
        <Audio src={staticFile("vo-createbooking.mp3")} volume={1} />
        <T04_StepScene config={config} stepIndex={3} duration={TRAINING_SCENES.step4.duration} />
      </Sequence>

      {/* ── T04 — Step 5: Floor map view ── */}
      <Sequence from={TRAINING_SCENES.step5.from} durationInFrames={TRAINING_SCENES.step5.duration}>
        <Audio src={staticFile("vo-floormap.mp3")} volume={1} />
        <T04_StepScene config={config} stepIndex={4} duration={TRAINING_SCENES.step5.duration} />
      </Sequence>

      {/* ── T05 — Benefits ── */}
      <Sequence from={TRAINING_SCENES.benefits.from} durationInFrames={TRAINING_SCENES.benefits.duration}>
        <Audio src={staticFile("vo-benefits.mp3")} volume={1} />
        <T05_Benefits config={config} />
      </Sequence>

      {/* ── T06 — Closing CTA ── */}
      <Sequence from={TRAINING_SCENES.closing.from} durationInFrames={TRAINING_SCENES.closing.duration}>
        <Audio src={staticFile("vo-closing.mp3")} volume={1} />
        <T06_TrainingClosing config={config} />
      </Sequence>

    </AbsoluteFill>
  );
};
