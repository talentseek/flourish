import React from "react";
import { Composition } from "remotion";
import { Video } from "./Video";
import { VIDEO } from "./styles";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BraeheadShowcase"
        component={Video}
        durationInFrames={VIDEO.durationInFrames}
        fps={VIDEO.fps}
        width={VIDEO.width}
        height={VIDEO.height}
      />
    </>
  );
};
