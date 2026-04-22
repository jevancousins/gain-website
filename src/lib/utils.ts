import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "Gain Strength Therapy",
  shortName: "GAIN",
  tagline: "Empowering adults to unlock their strength and take control of their health.",
  description:
    "A friendly, uplifting environment where you'll move better, train smarter, and build lasting strength. Private strength training in Eastbourne.",
  url: "https://www.gainstrengththerapy.com",
  address: {
    line1: "Dursley Rd",
    city: "Eastbourne",
    postcode: "BN22 8DJ",
    country: "United Kingdom",
  },
  phone: "+44 1323 370022",
  phoneHref: "+441323370022",
  /**
   * Enquiry status. Toggle to "waitlist" when Hallum is at capacity; the
   * nav strip, footer callouts, and any "new enquiries open" dots read
   * from this single source of truth.
   */
  enquiryStatus: "open" as "open" | "waitlist",
  hours: [
    { day: "Monday", open: "06:00", close: "20:00" },
    { day: "Tuesday", open: "07:00", close: "20:00" },
    { day: "Wednesday", open: "06:00", close: "20:00" },
    { day: "Thursday", open: "07:00", close: "20:00" },
    { day: "Friday", open: "07:00", close: "20:00" },
    { day: "Saturday", open: "08:00", close: "16:00" },
    { day: "Sunday", open: null, close: null },
  ],
  social: {
    instagram: "https://www.instagram.com/gainuk_/",
    facebook: "https://www.facebook.com/p/Gain-Strength-Therapy-61555544315873/",
    googleReviews: "https://share.google/VbfM3tGyhVSDRZUIZ",
  },
  /**
   * TeamUp booking URLs. Hallum manages bookings in TeamUp
   * (goteamup.com/p/8554886-gain-strength-therapy). When he sends the
   * official embed snippet from the TeamUp dashboard, swap these for
   * the canonical iframe URL.
   */
  teamup: {
    appointments:
      "https://goteamup.com/p/8554886-gain-strength-therapy/c/appointment_types?page=1",
    customerSite:
      "https://goteamup.com/p/8554886-gain-strength-therapy/",
  },
};

/**
 * Live Google rating — verified 2026-04 from the Knowledge Graph panel
 * (kgmid: /g/11ld82lbxg). Bump the count when it climbs.
 */
export const GOOGLE_RATING = {
  stars: 5.0,
  count: 21,
  href: "https://share.google/VbfM3tGyhVSDRZUIZ",
};

/**
 * Real Google reviews for Gain Strength Therapy.
 * TODO(hallum): paste 3–4 existing 5-star reviews here. The placeholder
 * entries below render a clearly-marked empty state until filled.
 */
export type Review = {
  text: string;
  author: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const REVIEWS: Review[] = [];

/**
 * Image assets — served from /public/media.
 *
 * People in each image are documented in IMAGE_META below. When picking
 * an image for a new surface, **always consult IMAGE_META first** to make
 * sure the people in the photo still represent current Gain staff.
 */
export const IMAGES = {
  logo: "/media/logo.png",

  // ——— GYM — Hallum coaching / member scenes ———
  gymBoxCoaching: "/media/gym/box-coaching.jpg",
  gymStretching: "/media/gym/stretching.jpg",
  gymWarmup: "/media/gym/warmup.jpg",
  gymGroupClass: "/media/gym/group-class.jpg",
  gymLunges: "/media/gym/lunges.jpg",
  gymWide: "/media/gym/wide.jpg",

  // ——— GYM — feature former staff (Aaron). Placement-sensitive: OK to
  //     use but NOT as the primary "meet your coach" hero for current Gain.
  gymAaronOhp: "/media/gym/coach-member.jpg",
  gymAaronConversation: "/media/gym/coach-member-alt.jpg",
  gymAaronBeckyBackground: "/media/gym/two-training.jpg",

  // ——— STUDIO ———
  studioYoga: "/media/studio/yoga.jpg",

  // ——— SAUNA & COLD PLUNGE ———
  saunaPlungeClose: "/media/sauna/plunge-close.jpg",
  saunaPlungeWide: "/media/sauna/plunge-wide.jpg",
  saunaCabin: "/media/sauna/cabin.jpg",

  // ——— HEADSHOTS ———
  hallum: "/media/hallum.jpg",
  becky: "/media/becky.jpg",

  // ——— ARCHIVAL — the original Gain team, including people no longer
  //     at Gain (Aaron, Ash, the physio). Use only if historical context
  //     is explicit; never as "the team you'll train with today".
  teamOriginal: "/media/team.jpg",
};

/**
 * Rich metadata for every image. When adding a new image, extend this
 * object. When choosing an image for a new surface, read `people` and
 * `status` first — never place photos of former staff on new pages.
 *
 * The human-readable equivalent lives at /public/media/README.md for
 * mobile editing via the GitHub app.
 */
export type ImageMeta = {
  description: string;
  people: string[];
  setting: "gym" | "studio" | "sauna" | "headshot" | "brand";
  status: "current" | "archive";
};

export const IMAGE_META: Record<string, ImageMeta> = {
  "/media/logo.png": {
    description: "Gain Strength Therapy circular wordmark logo.",
    people: [],
    setting: "brand",
    status: "current",
  },
  "/media/gym/box-coaching.jpg": {
    description:
      "Hallum coaching and spotting a female client (40s) as she steps onto a box in the gym. GAIN logo clearly visible on the back of Hallum's t-shirt.",
    people: ["Hallum Cousins (coach)", "Female client, 40s"],
    setting: "gym",
    status: "current",
  },
  "/media/gym/stretching.jpg": {
    description:
      "Hallum coaching and doing the same warm-up stretch as a male client (60s). Both looking at each other smiling in the gym.",
    people: ["Hallum Cousins (coach)", "Male client, 60s"],
    setting: "gym",
    status: "current",
  },
  "/media/gym/warmup.jpg": {
    description:
      "Near-duplicate of stretching.jpg — Hallum warming up with male client (60s). Possibly different crop/size.",
    people: ["Hallum Cousins (coach)", "Male client, 60s"],
    setting: "gym",
    status: "current",
  },
  "/media/gym/group-class.jpg": {
    description:
      "Hallum coaching a small-group class of four clients (2 male, 2 female, various ages) doing ab exercises on mats in the gym.",
    people: [
      "Hallum Cousins (coach)",
      "Four clients (2M 2F, various ages)",
    ],
    setting: "gym",
    status: "current",
  },
  "/media/gym/lunges.jpg": {
    description:
      "Two female clients (20s–30s) doing two different leg exercises with dumbbells in the gym. No coach visible.",
    people: ["Two female clients, 20s–30s"],
    setting: "gym",
    status: "current",
  },
  "/media/gym/wide.jpg": {
    description: "Wide atmospheric shot of the empty gym floor — racks, weights, equipment.",
    people: [],
    setting: "gym",
    status: "current",
  },
  "/media/studio/yoga.jpg": {
    description:
      "The studio set up for yoga / meditation — mats, singing bowls on a woven rug, Buddha wall art, turquoise curtains.",
    people: [],
    setting: "studio",
    status: "current",
  },
  "/media/sauna/plunge-wide.jpg": {
    description:
      "Wide shot of the sauna + cold plunge room. Wooden cold plunge tub, sauna cabin, night-sky mountain mural on the wall, herringbone floor.",
    people: [],
    setting: "sauna",
    status: "current",
  },
  "/media/sauna/plunge-close.jpg": {
    description: "Close-up of the wooden cold plunge tub with night-sky mural behind.",
    people: [],
    setting: "sauna",
    status: "current",
  },
  "/media/sauna/cabin.jpg": {
    description: "Side view of the cold plunge and infrared sauna cabin.",
    people: [],
    setting: "sauna",
    status: "current",
  },
  "/media/hallum.jpg": {
    description: "Headshot of Hallum smiling, plain background.",
    people: ["Hallum Cousins"],
    setting: "headshot",
    status: "current",
  },
  "/media/becky.jpg": {
    description: "Headshot of Becky smiling, plain background.",
    people: ["Becky Brown"],
    setting: "headshot",
    status: "current",
  },
  "/media/gym/coach-member.jpg": {
    description:
      "Aaron Goacher (former Gain PT) smiling while a female client (40s) does seated overhead barbell press. Aaron is prominently in frame.",
    people: ["Aaron Goacher (former Gain PT)", "Female client, 40s"],
    setting: "gym",
    status: "archive",
  },
  "/media/gym/coach-member-alt.jpg": {
    description:
      "Aaron Goacher (former Gain PT) in conversation with the same female client, likely giving advice on an exercise. Aaron is prominently in frame.",
    people: ["Aaron Goacher (former Gain PT)", "Female client, 40s"],
    setting: "gym",
    status: "archive",
  },
  "/media/gym/two-training.jpg": {
    description:
      "Aaron Goacher and Becky Brown watching on as a female client does an exercise in the background. Both Aaron and Becky have their backs to the camera, displaying the GAIN logo on their t-shirts. Faces are not visible — usable as atmospheric background.",
    people: [
      "Aaron Goacher (former Gain PT, back to camera)",
      "Becky Brown (back to camera)",
      "Female client",
    ],
    setting: "gym",
    status: "archive",
  },
  "/media/team.jpg": {
    description:
      "Original Gain team photo. Hallum stood in the background, while Aaron Goacher, Becky Brown, the physio, and Ash Mugasa are seated in the gym smiling. Do not use as 'the current team' — Aaron, the physio and Ash are no longer at Gain.",
    people: [
      "Hallum Cousins (standing)",
      "Aaron Goacher (former Gain PT)",
      "Becky Brown",
      "Physio (former)",
      "Ash Mugasa (former Gain PT)",
    ],
    setting: "gym",
    status: "archive",
  },
};

/** Hero + facility background videos — served from /public/media/videos */
export const VIDEOS = {
  hero: {
    src720: "/media/videos/hero-720.mp4",
    src1080: "/media/videos/hero-1080.mp4",
    poster: IMAGES.gymStretching,
  },
  facilityA: {
    src720: "/media/videos/facility-a-720.mp4",
    src1080: "/media/videos/facility-a-1080.mp4",
  },
  facilityB: {
    src720: "/media/videos/facility-b-720.mp4",
    src1080: "/media/videos/facility-b-1080.mp4",
  },
};

export const HERO_VIDEO = VIDEOS.hero;

export type TeamMember = {
  name: string;
  role: string;
  specialisms: string[];
  bio: string;
  photo: string;
};

/**
 * Team bios taken from the original Wix /about-us page verbatim (minus Aaron &
 * Ash who no longer work at GAIN).
 */
export const TEAM: TeamMember[] = [
  {
    name: "Hallum Cousins",
    role: "Founder & Head Coach",
    specialisms: ["MSc Sport Physiology", "Injury prevention", "Sports performance"],
    bio: "I created Gain to provide a personal and supportive space where anyone can build strength and confidence at their own pace.",
    photo: "/media/hallum.jpg",
  },
  {
    name: "Becky Brown",
    role: "Personal Trainer",
    specialisms: ["Pre & post natal", "Fat loss", "Nutrition"],
    bio: "I'm here not only to help expectant and new mums but I also work with people to improve lifestyle habits.",
    photo: "/media/becky.jpg",
  },
];
