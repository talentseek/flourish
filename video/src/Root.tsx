import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { TrainingVideo } from "./TrainingVideo";
import { VIDEO } from "./styles";
import { TRAINING_VIDEO } from "./training-styles";
import { braehead } from "./configs/braehead";
import { royalExchange } from "./configs/royal-exchange";
import { highcrossSpaces } from "./configs/highcross-spaces";

/**
 * To add a new showcase:
 * 1. Create a new config file in src/configs/ (copy braehead.ts as template)
 * 2. Import it here
 * 3. Add a new <Composition> block below
 * 4. Add matching assets to public/ (logo, media, soundtrack)
 * 5. Run: npx remotion render <CompositionId> out/<name>.mp4
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={braehead.id}
        component={Video}
        defaultProps={{ config: braehead }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      <Composition
        id={royalExchange.id}
        component={Video}
        defaultProps={{ config: royalExchange }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />

      {/* ── Training Videos ─────────────────────────────────── */}
      {/**
       * Add new training compositions here.
       * Copy the block below and swap out the config.
       */}
      <Composition
        id={highcrossSpaces.id}
        component={TrainingVideo}
        defaultProps={{ config: highcrossSpaces }}
        durationInFrames={TRAINING_VIDEO.durationInFrames}
        fps={TRAINING_VIDEO.fps}
        width={TRAINING_VIDEO.width}
        height={TRAINING_VIDEO.height}
      />
    </>
  );
};
