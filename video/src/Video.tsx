import React from "react";
import { AbsoluteFill, Sequence, Audio, staticFile } from "remotion";
import { BRAND, SCENES } from "./styles";
import { S01_BrandedIntro } from "./scenes/S01_BrandedIntro";
import { S02_TheProblem } from "./scenes/S02_TheProblem";
import { S03_SearchBraehead } from "./scenes/S03_SearchBraehead";
import { S04_DataIntelligence } from "./scenes/S04_DataIntelligence";
import { S05_GapAnalysis } from "./scenes/S05_GapAnalysis";
import { S06_DiscoverArtisans } from "./scenes/S06_DiscoverArtisans";
import { S07_Outreach } from "./scenes/S07_Outreach";
import { S08_KioskReveal } from "./scenes/S08_KioskReveal";
import { S09_Impact } from "./scenes/S09_Impact";
import { S10_BrandedCTA } from "./scenes/S10_BrandedCTA";

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BRAND.bg }}>
      {/* Background soundtrack */}
      <Audio src={staticFile("soundtrack.mp3")} volume={0.35} />

      {/* Scene 1: Branded Intro (3s) */}
      <Sequence from={SCENES.brandedIntro.from} durationInFrames={SCENES.brandedIntro.duration}>
        <S01_BrandedIntro />
      </Sequence>

      {/* Scene 2: The Problem (6s) */}
      <Sequence from={SCENES.theProblem.from} durationInFrames={SCENES.theProblem.duration}>
        <S02_TheProblem />
      </Sequence>

      {/* Scene 3: Search Braehead (8s) */}
      <Sequence from={SCENES.searchBraehead.from} durationInFrames={SCENES.searchBraehead.duration}>
        <S03_SearchBraehead />
      </Sequence>

      {/* Scene 4: Data Intelligence (7s) */}
      <Sequence from={SCENES.dataIntelligence.from} durationInFrames={SCENES.dataIntelligence.duration}>
        <S04_DataIntelligence />
      </Sequence>

      {/* Scene 5: Gap Analysis (10s) */}
      <Sequence from={SCENES.gapAnalysis.from} durationInFrames={SCENES.gapAnalysis.duration}>
        <S05_GapAnalysis />
      </Sequence>

      {/* Scene 6: Discover Artisans (8s) */}
      <Sequence from={SCENES.discoverArtisans.from} durationInFrames={SCENES.discoverArtisans.duration}>
        <S06_DiscoverArtisans />
      </Sequence>

      {/* Scene 7: Outreach (6s) */}
      <Sequence from={SCENES.outreach.from} durationInFrames={SCENES.outreach.duration}>
        <S07_Outreach />
      </Sequence>

      {/* Scene 8: Kiosk Reveal (8s) */}
      <Sequence from={SCENES.kioskReveal.from} durationInFrames={SCENES.kioskReveal.duration}>
        <S08_KioskReveal />
      </Sequence>

      {/* Scene 9: Impact (6s) */}
      <Sequence from={SCENES.impact.from} durationInFrames={SCENES.impact.duration}>
        <S09_Impact />
      </Sequence>

      {/* Scene 10: Branded CTA (8s) */}
      <Sequence from={SCENES.brandedCTA.from} durationInFrames={SCENES.brandedCTA.duration}>
        <S10_BrandedCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
