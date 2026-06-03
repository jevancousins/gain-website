import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const NEWSLETTER_CONSENT_TEXT_V1 =
  "I'd like to receive occasional tips, programme updates and news from Gain. You can unsubscribe at any time.";

export const SITE = {
  name: "Gain Strength Therapy",
  shortName: "GAIN",
  tagline: "The gym for people who don't like gyms.",
  description:
    "Eastbourne's specialist small group strength training studio. We work with post-rehab clients, beginners, older adults, and anyone rebuilding after illness. Maximum six per session.",
  url: "https://www.gainstrengththerapy.com",
  address: {
    line1: "Dursley Rd",
    city: "Eastbourne",
    postcode: "BN22 8DJ",
    country: "United Kingdom",
  },
  phone: "+44 1323 370022",
  phoneHref: "+441323370022",
  bookingUrl: "https://cal.com/gainstrengththerapy/consultation",
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
};

/**
 * Fallback Google rating, used when the Places API is unavailable.
 * The live value is fetched by src/lib/google-rating.ts and cached
 * with a daily revalidation triggered by the google-reviews cron.
 */
export const GOOGLE_RATING = {
  stars: 5.0,
  count: 24,
  href: "https://share.google/VbfM3tGyhVSDRZUIZ",
};

/**
 * Curated slice of the five-star Google reviews. Each entry is
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
  logoLight: "/media/logo-light.png",
  logoOnFlame: "/media/logo-on-flame.png",

  // ——— GYM — Hallum coaching / member scenes ———
  gymBoxCoaching: "/media/gym/box-coaching.jpg",
  gymStretching: "/media/gym/stretching.jpg",
  gymWarmup: "/media/gym/warmup.jpg",
  gymGroupClass: "/media/gym/group-class.jpg",
  gymLunges: "/media/gym/lunges.jpg",
  gymWide: "/media/gym/wide.jpg",

  // ——— GYM — Hallum coaching (real photos, May 2026) ———
  gymHallumBoxStepup: "/media/gym/hallum-box-stepup.jpg",
  gymMemberCable: "/media/gym/member-cable.jpg",

  // ——— GYM — Member exercises (real photos, May 2026) ———
  gymMemberDumbbellLunge: "/media/gym/member-dumbbell-lunge.jpg",
  gymMemberFloorPushup: "/media/gym/member-floor-pushup.jpg",
  gymMemberDeadlift: "/media/gym/member-deadlift.jpg",
  gymMemberGymTraining: "/media/gym/member-gym-training.jpg",
  gymMemberHipHinge: "/media/gym/member-hip-hinge.jpg",
  gymFloorSession: "/media/gym/gym-floor-session.jpg",

  // ——— GYM — Interior / space (real photos, May 2026) ———
  gymWideNew: "/media/gym/gym-wide-member.jpg",
  gymInteriorWide: "/media/gym/gym-interior-wide.jpg",

  // ——— GYM — GAIN branding / sign shots (real photos, May 2026) ———
  gymGroupSession: "/media/gym/group-session.jpg",
  gainSignMemberPose: "/media/gym/gain-sign-member-pose.jpg",
  gainSignFemaleMember: "/media/gym/gain-sign-female-member.jpg",
  gainSignTwoMembers: "/media/gym/gain-sign-two-members.jpg",
  gainSignMemberOrange: "/media/gym/gain-sign-member-orange.jpg",
  gainSignTwoFemaleMembers: "/media/gym/gain-sign-two-female-members.jpg",

  // ——— GYM — RECEPTION (real photos, May 2026) ———
  gymMemberBlockBalance: "/media/gym/member-block-balance.jpg",
  gymHallumMemberProgress: "/media/gym/hallum-member-progress.jpg",

  // ——— GYM — feature former staff (Aaron). Placement-sensitive: OK to
  //     use but NOT as the primary "meet your coach" hero for current Gain.
  gymAaronOhp: "/media/gym/coach-member.jpg",
  gymAaronConversation: "/media/gym/coach-member-alt.jpg",
  gymAaronBeckyBackground: "/media/gym/two-training.jpg",

  // ——— STUDIO ———
  studioYoga: "/media/studio/yoga.jpg",

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
  /** One or two sentences describing exactly what is happening in the image. */
  description: string;
  /** Named people visible in the image. Use "Member (female, senior)" style when identity is unknown. */
  people: string[];
  /** Physical setting / category. Use "reception" for front-of-house / welcome area shots. */
  setting: "gym" | "studio" | "headshot" | "brand" | "reception";
  /** "current" = safe to use on any surface. "archive" = former staff visible — use only with historical context. */
  status: "current" | "archive";
  /**
   * Flat keyword tags for AI retrieval. Include: exercise names, muscle groups, demographics,
   * mood/tone, brand elements, content use-cases (e.g. "social proof", "testimonial", "atmosphere").
   */
  tags: string[];
};

export const IMAGE_META: Record<string, ImageMeta> = {

  // ——— BRAND ———

  "/media/logo.png": {
    description: "Gain wordmark logo: white GAIN text with orange runner, for dark backgrounds.",
    people: [],
    setting: "brand",
    status: "current",
    tags: ["logo", "brand", "wordmark", "dark-bg"],
  },
  "/media/logo-light.png": {
    description: "Gain wordmark logo: dark GAIN text with orange runner, for light/cream backgrounds.",
    people: [],
    setting: "brand",
    status: "current",
    tags: ["logo", "brand", "wordmark", "light-bg"],
  },
  "/media/logo-on-flame.png": {
    description: "Gain wordmark logo: white GAIN text with dark runner, for flame/orange backgrounds.",
    people: [],
    setting: "brand",
    status: "current",
    tags: ["logo", "brand", "wordmark", "flame-bg"],
  },

  // ——— HEADSHOTS ———

  "/media/hallum.jpg": {
    description: "Hallum Cousins smiling at the camera, plain neutral background. Clean headshot suitable for any 'Meet your coach' or profile surface.",
    people: ["Hallum Cousins (coach)"],
    setting: "headshot",
    status: "current",
    tags: ["headshot", "portrait", "Hallum", "coach", "profile", "meet the coach"],
  },

  // ——— GYM — Hallum coaching (real photos, May 2026) ———

  "/media/gym/hallum-box-stepup.jpg": {
    description:
      "Hallum coaching a member through a box step-up. Hallum's back is to the camera, showing the GAIN branding on his t-shirt. Strong one-to-one coaching image.",
    people: ["Hallum Cousins (coach, back to camera)", "Member (female)"],
    setting: "gym",
    status: "current",
    tags: ["coaching", "box step-up", "one-to-one", "GAIN branding", "strength training", "lower body", "Hallum"],
  },

  "/media/gym/box-coaching.jpg": {
    description:
      "Hallum coaching and spotting a female client (40s) as she steps onto a box. GAIN logo clearly visible on the back of Hallum's t-shirt.",
    people: ["Hallum Cousins (coach)", "Member (female, 40s)"],
    setting: "gym",
    status: "current",
    tags: ["coaching", "spotting", "box step-up", "one-to-one", "GAIN branding", "female member", "Hallum", "40s"],
  },

  "/media/gym/stretching.jpg": {
    description:
      "Hallum and a senior male client stretching together on the gym floor, both smiling and facing each other. Warm, connected moment. Best single image showing Hallum's coaching relationship with an older client.",
    people: ["Hallum Cousins (coach)", "Member (male, senior)"],
    setting: "gym",
    status: "current",
    tags: ["stretching", "warm-up", "coaching", "one-to-one", "senior member", "connection", "rapport", "Hallum", "smiling", "older adults"],
  },

  "/media/gym/warmup.jpg": {
    description:
      "Hallum warming up alongside a senior male client — near-duplicate of stretching.jpg, possibly a different crop. Same warm, side-by-side coaching dynamic.",
    people: ["Hallum Cousins (coach)", "Member (male, senior)"],
    setting: "gym",
    status: "current",
    tags: ["warm-up", "stretching", "coaching", "one-to-one", "senior member", "Hallum", "older adults"],
  },

  // ——— GYM — Group / class scenes (real photos, May 2026) ———

  "/media/gym/group-class.jpg": {
    description:
      "Hallum coaching a small group of four clients (2 female, 2 male) doing a warm-up on mats. Good energy, mixed demographics.",
    people: [
      "Hallum Cousins (coach)",
      "Two female members",
      "Two male members",
    ],
    setting: "gym",
    status: "current",
    tags: ["group class", "warm-up", "mats", "coaching", "small group", "mixed group", "Hallum", "community", "floor exercise"],
  },

  "/media/gym/group-session.jpg": {
    description:
      "Small group personal training session with four members doing different exercises simultaneously. Shows the variety and personalised nature of Gain's group sessions.",
    people: ["Four members (mixed)"],
    setting: "gym",
    status: "current",
    tags: ["group training", "small group", "PT session", "community", "multiple members", "variety", "personalised", "mixed group"],
  },

  "/media/gym/gym-floor-session.jpg": {
    description:
      "Four members working on different exercises across the gym floor simultaneously. No coach visible — shows independent training within a group context.",
    people: ["Four members (mixed)"],
    setting: "gym",
    status: "current",
    tags: ["group training", "floor session", "multiple members", "variety", "independent training", "gym atmosphere"],
  },

  // ——— GYM — Member exercises (real photos, May 2026) ———

  "/media/gym/member-cable.jpg": {
    description:
      "Solo male member performing a cable machine exercise. No coach present — shows a member confidently training independently.",
    people: ["Member (male)"],
    setting: "gym",
    status: "current",
    tags: ["cable machine", "strength training", "solo training", "male member", "upper body", "resistance training"],
  },

  "/media/gym/member-dumbbell-lunge.jpg": {
    description:
      "Senior female member performing a dumbbell lunge with good form. Clear demonstration of strength training accessible to older adults.",
    people: ["Member (female, senior)"],
    setting: "gym",
    status: "current",
    tags: ["lunge", "dumbbell", "strength training", "senior member", "female member", "functional fitness", "lower body", "older adults", "good form"],
  },

  "/media/gym/member-floor-pushup.jpg": {
    description:
      "Three male members doing press-ups simultaneously; one is using a weight plate on his back, demonstrating how sessions are scaled to individual ability.",
    people: ["Three male members"],
    setting: "gym",
    status: "current",
    tags: ["press-up", "push-up", "floor exercise", "male members", "personalisation", "scaled training", "different levels", "strength", "group exercise"],
  },

  "/media/gym/member-deadlift.jpg": {
    description:
      "Female member performing a deadlift with strong, confident form. Good image for showcasing women lifting heavy at Gain.",
    people: ["Member (female)"],
    setting: "gym",
    status: "current",
    tags: ["deadlift", "strength training", "female member", "good form", "barbell", "lower body", "posterior chain", "women lifting"],
  },

  "/media/gym/member-gym-training.jpg": {
    description:
      "Two female members and one male member training together. Female in foreground performing a lunge; another female doing dumbbell skullcrushers on a mat behind her.",
    people: ["Member (female, foreground)", "Member (female, background)", "Member (male)"],
    setting: "gym",
    status: "current",
    tags: ["lunge", "dumbbell", "skullcrushers", "mixed group", "floor exercise", "strength training", "female member", "variety"],
  },

  "/media/gym/member-hip-hinge.jpg": {
    description:
      "Middle-aged female member performing a Romanian deadlift (RDL) with a barbell loaded with 5 kg plates each side. Excellent form demonstration.",
    people: ["Member (female, middle-aged)"],
    setting: "gym",
    status: "current",
    tags: ["RDL", "Romanian deadlift", "hip hinge", "barbell", "female member", "middle-aged", "strength training", "form", "posterior chain", "women lifting"],
  },

  "/media/gym/lunges.jpg": {
    description:
      "Two female members (20s–30s) doing different dumbbell leg exercises side by side. No coach visible.",
    people: ["Member (female, 20s–30s)", "Member (female, 20s–30s)"],
    setting: "gym",
    status: "current",
    tags: ["lunge", "dumbbell", "leg exercise", "female members", "younger adults", "strength training", "lower body"],
  },

  // ——— GYM — Interior / space ———

  "/media/gym/gym-wide-member.jpg": {
    description:
      "Wide gym interior with four members training. A senior male member on a cable machine is prominent in the foreground. Good facility overview shot.",
    people: ["Member (male, senior, foreground)", "Three other members"],
    setting: "gym",
    status: "current",
    tags: ["wide shot", "cable machine", "multiple members", "senior member", "gym atmosphere", "facility", "overview"],
  },

  "/media/gym/gym-interior-wide.jpg": {
    description:
      "Wide shot of the gym interior with three members doing different exercises. No coach visible. Shows scale, equipment variety, and layout of the space.",
    people: ["Three members (mixed)"],
    setting: "gym",
    status: "current",
    tags: ["wide shot", "gym interior", "multiple members", "atmosphere", "facility", "equipment", "overview"],
  },

  "/media/gym/wide.jpg": {
    description:
      "Atmospheric wide shot of the empty gym floor under dark lighting. Shows racks, weights, and equipment layout.",
    people: [],
    setting: "gym",
    status: "current",
    tags: ["empty gym", "atmosphere", "facility", "dark lighting", "equipment", "racks", "gym layout"],
  },

  // ——— GYM — GAIN sign / social proof shots (real photos, May 2026) ———

  "/media/gym/gain-sign-member-orange.jpg": {
    description:
      "Middle-aged male member giving a thumbs up next to the GAIN wall sign. Warm, celebratory image ideal for social proof or milestone posts.",
    people: ["Member (male, middle-aged)"],
    setting: "gym",
    status: "current",
    tags: ["GAIN sign", "thumbs up", "social proof", "celebration", "male member", "middle-aged", "milestone", "results", "orange branding"],
  },

  "/media/gym/gain-sign-member-pose.jpg": {
    description:
      "Senior male member posing proudly in front of the GAIN wall sign. Good social proof image showing older adults engaged and confident at Gain.",
    people: ["Member (male, senior)"],
    setting: "gym",
    status: "current",
    tags: ["GAIN sign", "social proof", "senior member", "male member", "milestone", "posing", "older adults", "confidence"],
  },

  "/media/gym/gain-sign-two-members.jpg": {
    description:
      "Senior male and senior female member posing together in front of the GAIN wall sign. Great image for showing older couples or pairs training together.",
    people: ["Member (male, senior)", "Member (female, senior)"],
    setting: "gym",
    status: "current",
    tags: ["GAIN sign", "social proof", "senior members", "couple", "milestone", "posing", "older adults", "mixed gender", "community"],
  },

  "/media/gym/gain-sign-female-member.jpg": {
    description:
      "Middle-aged female member pointing enthusiastically at the GAIN wall sign with her arm outstretched. High energy, celebratory tone.",
    people: ["Member (female, middle-aged)"],
    setting: "gym",
    status: "current",
    tags: ["GAIN sign", "social proof", "female member", "middle-aged", "pointing", "milestone", "enthusiasm", "celebration"],
  },

  "/media/gym/gain-sign-two-female-members.jpg": {
    description:
      "Two middle-aged female members hugging and pointing at the GAIN wall sign together. Joyful, friendship-focused image.",
    people: ["Member (female, middle-aged)", "Member (female, middle-aged)"],
    setting: "gym",
    status: "current",
    tags: ["GAIN sign", "social proof", "female members", "friendship", "hugging", "celebration", "middle-aged", "community", "milestone"],
  },

  // ——— GYM — RECEPTION / front-of-house (real photos, May 2026) ———

  "/media/gym/member-block-balance.jpg": {
    description:
      "Senior male member balancing a block on his head at the gym reception area. Unusual, characterful image that illustrates rehabilitation and functional training.",
    people: ["Member (male, senior)"],
    setting: "reception",
    status: "current",
    tags: ["balance", "coordination", "senior member", "reception", "rehabilitation", "functional training", "characterful", "unusual"],
  },

  "/media/gym/hallum-member-progress.jpg": {
    description:
      "Hallum and a middle-aged male member holding up a sign at the gym reception. The sign references the member's progress or pain reduction — strong results and testimonial image.",
    people: ["Hallum Cousins (coach)", "Member (male, middle-aged)"],
    setting: "reception",
    status: "current",
    tags: ["progress", "results", "testimonial", "Hallum", "pain reduction", "milestone", "reception", "social proof", "before and after"],
  },

  // ——— STUDIO ———

  "/media/studio/yoga.jpg": {
    description:
      "The studio set up for yoga or meditation: mats laid out, singing bowls on a woven rug, Buddha wall art, turquoise curtains.",
    people: [],
    setting: "studio",
    status: "current",
    tags: ["studio", "yoga", "meditation", "mats", "singing bowls", "calm", "mindfulness", "interior"],
  },

  // ——— ARCHIVE — Former Gain staff. Never use on current-facing surfaces. ———

  "/media/gym/coach-member.jpg": {
    description:
      "Aaron Goacher (former Gain PT) smiling while a female client (40s) does a seated overhead barbell press. Aaron is prominently in frame.",
    people: ["Aaron Goacher (former Gain PT)", "Member (female, 40s)"],
    setting: "gym",
    status: "archive",
    tags: ["archive", "former staff", "coaching", "overhead press", "barbell", "one-to-one"],
  },
  "/media/gym/coach-member-alt.jpg": {
    description:
      "Aaron Goacher (former Gain PT) in conversation with the same female client, likely offering exercise guidance. Aaron is prominently in frame.",
    people: ["Aaron Goacher (former Gain PT)", "Member (female, 40s)"],
    setting: "gym",
    status: "archive",
    tags: ["archive", "former staff", "coaching", "conversation", "one-to-one"],
  },
  "/media/gym/two-training.jpg": {
    description:
      "Aaron Goacher and Becky Brown watching a female client exercise in the background. Both have their backs to the camera showing GAIN t-shirt logos. Faces not visible — could be used as atmospheric background only.",
    people: [
      "Aaron Goacher (former Gain PT, back to camera)",
      "Becky Brown (back to camera)",
      "Member (female)",
    ],
    setting: "gym",
    status: "archive",
    tags: ["archive", "former staff", "GAIN branding", "atmosphere", "background", "backs to camera"],
  },
  "/media/team.jpg": {
    description:
      "Original Gain team photo — Hallum standing behind Aaron Goacher, Becky Brown, the physio, and Ash Mugasa, all seated in the gym. Do not use as the current team: Aaron, the physio, and Ash are no longer at Gain.",
    people: [
      "Hallum Cousins (standing)",
      "Aaron Goacher (former Gain PT)",
      "Becky Brown",
      "Physio (former)",
      "Ash Mugasa (former Gain PT)",
    ],
    setting: "gym",
    status: "archive",
    tags: ["archive", "team photo", "former staff", "original team", "historical"],
  },
};

/** Hero + facility background videos — served from /public/media/videos */
export const VIDEOS = {
  hero: {
    src720: "/media/videos/hero-720.mp4",
    src1080: "/media/videos/hero-1080.mp4",
    poster: IMAGES.gymStretching,
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
