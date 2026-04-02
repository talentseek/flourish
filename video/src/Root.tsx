import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { VIDEO } from "./styles";
import { braehead } from "./configs/braehead";

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
      {/* Add future showcases here:
      <Composition
        id={newConfig.id}
        component={Video}
        defaultProps={{ config: newConfig }}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
      */}
    </>
  );
};
