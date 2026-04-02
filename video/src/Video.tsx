import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { BRAND, SCENES } from "./styles";
import type { ShowcaseConfig } from "./types";
import { S01_BrandedIntro } from "./scenes/S01_BrandedIntro";
import { S02_TheProblem } from "./scenes/S02_TheProblem";
import { S03_Search } from "./scenes/S03_Search";
import { S04_DataIntelligence } from "./scenes/S04_DataIntelligence";
import { S05_GapAnalysis } from "./scenes/S05_GapAnalysis";
import { S06_DiscoverTenant } from "./scenes/S06_DiscoverTenant";
import { S07_Outreach } from "./scenes/S07_Outreach";
import { S08_Reveal } from "./scenes/S08_Reveal";
import { S09_Impact } from "./scenes/S09_Impact";
import { S10_BrandedCTA } from "./scenes/S10_BrandedCTA";

export const Video: React.FC<{ config: ShowcaseConfig }> = ({ config }) => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      <Audio src={staticFile(config.soundtrack ?? "soundtrack.mp3")} volume={0.35} />

      <Sequence from={SCENES.brandedIntro.from} durationInFrames={SCENES.brandedIntro.duration}>
        <S01_BrandedIntro config={config} />
      </Sequence>

      <Sequence from={SCENES.theProblem.from} durationInFrames={SCENES.theProblem.duration}>
        <S02_TheProblem config={config} />
      </Sequence>

      <Sequence from={SCENES.searchBraehead.from} durationInFrames={SCENES.searchBraehead.duration}>
        <S03_Search config={config} />
      </Sequence>

      <Sequence from={SCENES.dataIntelligence.from} durationInFrames={SCENES.dataIntelligence.duration}>
        <S04_DataIntelligence config={config} />
      </Sequence>

      <Sequence from={SCENES.gapAnalysis.from} durationInFrames={SCENES.gapAnalysis.duration}>
        <S05_GapAnalysis config={config} />
      </Sequence>

      <Sequence from={SCENES.discoverArtisans.from} durationInFrames={SCENES.discoverArtisans.duration}>
        <S06_DiscoverTenant config={config} />
      </Sequence>

      <Sequence from={SCENES.outreach.from} durationInFrames={SCENES.outreach.duration}>
        <S07_Outreach config={config} />
      </Sequence>

      <Sequence from={SCENES.kioskReveal.from} durationInFrames={SCENES.kioskReveal.duration}>
        <S08_Reveal config={config} />
      </Sequence>

      <Sequence from={SCENES.impact.from} durationInFrames={SCENES.impact.duration}>
        <S09_Impact config={config} />
      </Sequence>

      <Sequence from={SCENES.brandedCTA.from} durationInFrames={SCENES.brandedCTA.duration}>
        <S10_BrandedCTA config={config} />
      </Sequence>
    </AbsoluteFill>
  );
};
