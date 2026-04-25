import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "Gain Strength Therapy",
  shortName: "GAIN",
  tagline: "Specialist small group strength training for adults who need expert guidance to build strength safely.",
  description:
    "Eastbourne's specialist small group strength training studio. We work with post-rehab clients, beginners, active seniors, and anyone rebuilding after illness. Maximum six per session.",
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
 * Live Google rating, verified 2026-04-23 from the Maps listing
 * (kgmid: /g/11ld82lbxg). Bump the count when it climbs.
 */
export const GOOGLE_RATING = {
  stars: 5.0,
  count: 22,
  href: "https://share.google/VbfM3tGyhVSDRZUIZ",
};

/**
 * Curated slice of the 22 five-star Google reviews. Each entry is
 * verbatim excerpts from a public Google review (pulled 2026-04-23);
 * selection covers the niche audiences (first-timer / anxious,
 * injury / illness recovery, older adults) plus a strength-for-performance
 * angle. Reviews that name former staff (Aaron, Becky) are intentionally
 * excluded. The 30-Day Strength Boost has been retired, so reviews that
 * reference it by name are excluded too. Drop in a fresh 5-star review
 * here when one comes through that fits the new programme positioning.
 */
export type Review = {
  text: string;
  author: string;
  rating?: 1 | 2 | 3 | 4 | 5;
};

export const REVIEWS: Review[] = [
  {
    author: "Alistair W.",
    rating: 5,
    text: "Walking into a gym can be intimidating, especially if you're dealing with health challenges or haven't felt confident about exercising in a while. The sessions feel private, respectful, and genuinely encouraging, which makes taking that first step far less daunting than a typical gym environment.",
  },
  {
    author: "Felicity W.",
    rating: 5,
    text: "Stronger, leaner, fitter. And the best I've felt in 10yrs. I needed to focus on flexibility and mobility to continue my recovery from a hip injury and build greater strength. Having regular sessions tailored specifically to my needs has enabled me to take huge leaps forwards.",
  },
  {
    author: "Julie F.",
    rating: 5,
    text: "At 72, and a professional fitness trainer for over 48 years, I am very hard to please. Since joining Gain Strength Therapy I have been enlightened and enthused by the knowledge and refreshing approach to strength training. The session flies by, and I always leave on a high.",
  },
  {
    author: "L T",
    rating: 5,
    text: "After a period of illness, I was looking for some structured support to ease myself back into the gym and rebuild my fitness and strength. Hal is fantastic at tailoring each session to individual needs and goals. I've already noticed real progress and am even back doing my previous sports.",
  },
  {
    author: "Alan B.",
    rating: 5,
    text: "If like me you're not a fan of typical gyms, and struggle to know which exercises to do and how, then these sessions are for you. I'm 50 but ages range from 20s upwards and everyone is really friendly and supportive. Over the 6 weeks I gained strength but also confidence.",
  },
  {
    author: "Dan H.",
    rating: 5,
    text: "With Brighton Marathon looming on the horizon, and no longer a spring chicken, I needed more than just miles in my legs. My strength, conditioning and mobility have come on leaps and bounds. Sessions fly by, which is not something I ever expected to say about a workout.",
  },
];

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

export const TEAM: TeamMember[] = [
  {
    name: "Hallum Cousins",
    role: "Founder & Head Coach",
    specialisms: ["MSc Sport Physiology", "Injury prevention", "Sports performance"],
    bio: "I started Gain to bridge the gap between physio and the gym. A small, expert-led space for adults who want to get strong safely, whatever their starting point.",
    photo: "/media/hallum.jpg",
  },
];
