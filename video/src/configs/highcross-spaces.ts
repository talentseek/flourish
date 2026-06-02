import { BRAND } from "../styles";
import type { TrainingVideoConfig } from "../training-types";

export const highcrossSpaces: TrainingVideoConfig = {
  id: "HighCrossSpacesTraining",

  feature: {
    name: "Spaces",
    tagline: "Your booking diary, built into Flourish",
    version: "New Feature",
  },

  location: {
    name: "HighCross",
    fullName: "HighCross Leicester",
    city: "Leicester",
    type: "Shopping Centre",
  },

  intro: {
    headline: "Introducing Spaces",
    subheadline:
      "Manage kiosk and unit bookings directly inside Flourish — your team's single source of truth for space availability.",
    bullets: [
      "Visual diary showing all spaces side-by-side",
      "One-click booking creation and management",
      "Floor plan view with pinned space locations",
      "Upcoming bookings widget at a glance",
    ],
  },

  problem: {
    headline: "Before Spaces…",
    pain_points: [
      { icon: "📋", text: "Spreadsheets scattered across email threads" },
      { icon: "📞", text: "Phone calls to check if a kiosk is available" },
      { icon: "🤷", text: "No single view of what's booked when" },
      { icon: "⏱️", text: "Hours lost chasing confirmations each week" },
    ],
  },

  steps: [
    {
      number: 1,
      title: "Navigate to Spaces",
      description:
        'From your regional dashboard, click "Space Bookings" in the left sidebar. It\'s available to all Regional Managers.',
      highlight: "Sidebar → Space Bookings",
      media: { file: "spaces-step1-navigate.png", type: "image" },
    },
    {
      number: 2,
      title: "Select Your Location",
      description:
        "Choose HighCross from your assigned locations. You'll only see the centres you manage — no extra noise.",
      highlight: "HighCross Leicester",
      media: { file: "spaces-step2-location.mp4", type: "video" },
    },
    {
      number: 3,
      title: "The Diary View",
      description:
        "See all your bookable spaces as rows, with a 10-day rolling calendar. Today is highlighted. Navigate forward and back freely.",
      highlight: "10-day rolling diary",
      media: { file: "spaces-step3-diary.mp4", type: "video" },
    },
    {
      number: 4,
      title: "Create a Booking",
      description:
        'Click any empty cell on the diary to open the booking form. Enter the operator name, dates, and daily rate. Click "Confirm" — done.',
      highlight: "Click any empty cell",
      media: { file: "spaces-step4-booking.mp4", type: "video" },
    },
    {
      number: 5,
      title: "Floor Map View",
      description:
        "Switch to the floor plan tab to see exactly where each space sits within HighCross. Hover a pin to preview space photos.",
      highlight: "Visualise space locations",
      media: { file: "spaces-step5-floormap.mp4", type: "video" },
    },
  ],

  benefits: [
    {
      title: "Real-time Availability",
      description: "Always know what's booked and what's free — no back-and-forth needed.",
      color: BRAND.teal,
    },
    {
      title: "Faster Bookings",
      description: "Create a booking in under 30 seconds, directly from the diary.",
      color: BRAND.lime,
    },
    {
      title: "Visual Floor Plans",
      description: "Show traders exactly where their space is before they commit.",
      color: BRAND.green,
    },
    {
      title: "One Central Record",
      description: "No more spreadsheets — every booking lives in Flourish.",
      color: BRAND.amber,
    },
  ],

  closing: {
    headline: "Ready to try Spaces?",
    instruction:
      "Head to your Regional Dashboard now and explore the Space Bookings section for HighCross.",
    url: "thisisflourish.co.uk/dashboard/regional/spaces",
    footer: "Regional Manager Training — Flourish Spaces Feature",
  },

  soundtrack: "soundtrack.mp3",
};
