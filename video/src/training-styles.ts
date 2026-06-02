// Training video frame/scene constants (30fps, ~119 seconds)
// Scene durations are driven by voiceover audio lengths — measured with ffprobe.
// T01 gets an extra 60 frames (2s) to give a proper pause before T02.
//
// Audio file        Duration   Scene duration
// ──────────────────────────────────────────────
// vo-intro          4.99s      210f  (7s — extra hold)
// vo-whatisspaces   13.71s     420f  (14s)
// vo-beforespaces   11.55s     360f  (12s)
// vo-navigate       11.00s     340f  (11s)
// vo-selectlocation 11.73s     360f  (12s)
// vo-diary          13.01s     400f  (13s)
// vo-createbooking  16.12s     510f  (17s)
// vo-floormap        9.33s     300f  (10s)
// vo-benefits       10.68s     330f  (11s)
// vo-closing        11.15s     360f  (12s)
// ──────────────────────────────────────────────
// Total                              3590f  ≈ 119.7s

export const TRAINING_VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 3590,
} as const;

export const TRAINING_SCENES = {
  brandedIntro:    { from: 0,    duration: 210  },  //  7s (held longer)
  featureReveal:   { from: 210,  duration: 420  },  // 14s
  problem:         { from: 630,  duration: 360  },  // 12s
  step1:           { from: 990,  duration: 340  },  // 11s
  step2:           { from: 1330, duration: 360  },  // 12s
  step3:           { from: 1690, duration: 400  },  // 13s
  step4:           { from: 2090, duration: 510  },  // 17s
  step5:           { from: 2600, duration: 300  },  // 10s
  benefits:        { from: 2900, duration: 330  },  // 11s
  closing:         { from: 3230, duration: 360  },  // 12s
} as const;
