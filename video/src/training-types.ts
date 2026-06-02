/**
 * TrainingVideoConfig — data shape for Flourish feature training videos.
 * Designed for regional manager onboarding, feature walkthroughs, and
 * internal education content. Separate from ShowcaseConfig (client-facing).
 */
export interface TrainingVideoConfig {
  /** Remotion composition ID */
  id: string;

  /** The feature being trained on */
  feature: {
    name: string;           // "Spaces"
    tagline: string;        // "Your booking diary, built into Flourish"
    version?: string;       // "New Feature"
  };

  /** Example location used throughout the video */
  location: {
    name: string;           // "HighCross"
    fullName: string;       // "HighCross Leicester"
    city: string;           // "Leicester"
    type: string;           // "Shopping Centre"
  };

  /** Intro scene — what is Spaces? */
  intro: {
    headline: string;       // "Introducing Spaces"
    subheadline: string;    // "Manage your kiosk & unit bookings..."
    bullets: string[];      // Key capabilities
  };

  /** What problem does Spaces solve? */
  problem: {
    headline: string;
    pain_points: Array<{
      icon: string;         // emoji
      text: string;
    }>;
  };

  /** Feature walkthrough steps — each maps to a UI moment */
  steps: Array<{
    number: number;
    title: string;
    description: string;
    highlight?: string;     // Optional callout text
    /** Real media to display in the right-hand slot */
    media?: {
      file: string;           // filename in public/ e.g. "spaces-step1.png"
      type: "image" | "video";
    };
  }>;

  /** Key capabilities / benefits summary */
  benefits: Array<{
    title: string;
    description: string;
    color: string;
  }>;

  /** Closing call to action for training */
  closing: {
    headline: string;
    instruction: string;
    url: string;
    footer: string;
  };

  /** Optional custom soundtrack */
  soundtrack?: string;
}
