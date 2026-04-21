import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SITE = {
  name: "Gain Strength Therapy",
  shortName: "GAIN",
  tagline: "Empowering busy adults to unlock their strength and take control of their health.",
  description:
    "A friendly, uplifting environment where you'll move better, train smarter, and build lasting strength. Private strength training in Eastbourne.",
  url: "https://www.gainstrengththerapy.com",
  address: {
    line1: "Dursley Rd",
    city: "Eastbourne",
    postcode: "BN22 8DJ",
    country: "United Kingdom",
  },
  phone: "01323 370022",
  phoneHref: "+441323370022",
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
 * Image assets — now served from /public/media (originals pulled from
 * the Wix CDN and committed to the repo). Naming reflects subject.
 */
export const IMAGES = {
  logo: "/media/logo.png",

  // ——— GYM (free-weight floor, racks, cable, coaching) ———
  gymCoachMember: "/media/gym/coach-member.jpg",
  gymCoachMemberAlt: "/media/gym/coach-member-alt.jpg",
  gymLunges: "/media/gym/lunges.jpg",
  gymStretching: "/media/gym/stretching.jpg",
  gymBoxCoaching: "/media/gym/box-coaching.jpg",
  gymTwoTraining: "/media/gym/two-training.jpg",
  gymWide: "/media/gym/wide.jpg",
  gymWarmup: "/media/gym/warmup.jpg",

  teamPhoto: "/media/team.jpg",

  // ——— SMALL-GROUP PT CLASS (in the gym) ———
  gymGroupClass: "/media/gym/group-class.jpg",

  // ——— STUDIO (yoga / mobility / recovery) ———
  studioYoga: "/media/studio/yoga.jpg",

  // ——— SAUNA & COLD PLUNGE ———
  saunaPlungeClose: "/media/sauna/plunge-close.jpg",
  saunaPlungeWide: "/media/sauna/plunge-wide.jpg",
  saunaCabin: "/media/sauna/cabin.jpg",
};

/** Hero + facility background videos — served from /public/media/videos */
export const VIDEOS = {
  hero: {
    src720: "/media/videos/hero-720.mp4",
    src1080: "/media/videos/hero-1080.mp4",
    poster: IMAGES.gymCoachMember,
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
    specialisms: ["Injury prevention", "Human physiology", "Sports performance"],
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
