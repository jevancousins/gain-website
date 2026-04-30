import { IMAGES, REVIEWS, type Review } from "@/lib/utils";

export type Persona = {
  slug: string;
  source: string;
  metaTitle: string;
  metaDescription: string;
  adKicker: string;
  hero: {
    eyebrow: string;
    headlineLead: string;
    headlineItalic: string;
    lede: string;
    image: string;
    imageAlt: string;
  };
  problemMirror: {
    title: string;
    italic: string;
    intro: string;
    fears: { headline: string; body: string }[];
  };
  pillars: {
    title: string;
    italic: string;
    intro: string;
    items: { number: string; title: string; body: string }[];
  };
  // Optional persona-tailored walkthrough rendered between the pillars
  // section and the why-six-weeks section. Defuses first-time uncertainty
  // (the dominant Caroline fear); omitted on personas where it is not the
  // dominant objection.
  firstSession?: {
    title: string;
    italic: string;
    intro: string;
    steps: { time: string; body: string }[];
    footnote?: string;
  };
  whyNow: string[];
  // Persona-tailored framing sentence above the programme structure list.
  programmeFraming: string;
  testimonials: Review[];
  faqs: { q: string; a: string }[];
  ctaPrimary: string;
  formIntro: {
    eyebrow: string;
    title: string;
    body: string;
    // Lead-form submit button label. Defaults to "Book a free call".
    submitLabel?: string;
  };
  finalCta: {
    title: string;
    body: string;
  };
};

const COMMON_FAQS = {
  often:
    "Two sessions a week is the sweet spot for most members and the frequency we recommend by default. One session a week works well for absolute beginners or busy schedules. Three is ideal for people with some training history or those moving on from physio.",
  payment:
    "Yes. Pay in full upfront for simplicity, or split it into instalments. We confirm payment options on the consultation call before you book.",
  after:
    "You can step into ongoing monthly membership at the same sessions, on a rolling monthly contract. Members who finish the 6-week often roll into the 12-week instead. There is no auto-enrolment; we talk options at your final session.",
  consultation:
    "A 30 minute phone call before you enrol. We learn your goals, talk through any injury history or medical context, explain how the programme works, and answer your questions. No pressure, no sales script.",
  induction:
    "Your first 20 to 30 minutes at the studio, before your first group session. We assess your movement, choose one tracking exercise to measure progress, set your baseline, and walk you through the weekly structure.",
};

const pickReviews = (authors: string[]): Review[] =>
  authors
    .map((a) => REVIEWS.find((r) => r.author === a))
    .filter((r): r is Review => Boolean(r));

export const PERSONAS: Persona[] = [
  // ——— Cautious Caroline: beginner / gym-anxious ———
  {
    slug: "beginner",
    source: "6-week-beginner",
    metaTitle: "The 6-Week for First-Timers",
    metaDescription:
      "A 6-week strength programme for adults who have never trained, or have not been to a gym in years. Eastbourne. Small groups, max six. Friendly, jargon-free coaching.",
    adKicker: "First-timers welcome",
    hero: {
      eyebrow: "Never trained? Start here.",
      headlineLead: "You do not need to be fit to start.",
      headlineItalic: "You start to get fit.",
      lede:
        "A 6-week strength programme for adults who have never set foot in a gym, or have not in years. Small groups, expert coaching, no judgement, no jargon. We will meet you exactly where you are.",
      image: IMAGES.gymBoxCoaching,
      imageAlt: "A coach guiding a member through a step-up, gym in the background",
    },
    problemMirror: {
      title: "If any of this sounds like you,",
      italic: "you are in the right place.",
      intro:
        "These are the things first-timers tell us they are afraid of, before they walk in. We have heard them all, and the answers are kinder than you think.",
      fears: [
        {
          headline: "I do not know what any of the equipment does.",
          body:
            "You will not need to. Every session is led by a coach who walks you through each movement before you do it. There is no figuring it out alone.",
        },
        {
          headline: "I will look foolish in front of fitter people.",
          body:
            "Six people per session, all there for the same reason. Most of our members started exactly where you are. There is no fitter group at the back to compare yourself to.",
        },
        {
          headline: "I will hold the others up.",
          body:
            "Same exercises, different weights, different speeds. There is nothing to keep up with. The room is built so everyone can work at their own level.",
        },
        {
          headline: "I am too out of shape to even begin.",
          body:
            "That is precisely who the 6-week is for. We start with the basics: getting up off the floor, standing from a chair, stepping safely. Strength is built from there.",
        },
        {
          headline: "I have a health condition. Will I be safe?",
          body:
            "Tell us on the consultation call. Our head coach holds an MSc in Sport Physiology and works regularly with members managing diabetes, arthritis, blood pressure, and more. We adapt the programme to you.",
        },
      ],
    },
    pillars: {
      title: "What makes Gain different",
      italic: "for someone starting from scratch.",
      intro:
        "Four things we will not compromise on, because they are the things first-timers actually need.",
      items: [
        {
          number: "01",
          title: "Coached, never abandoned",
          body:
            "Every rep is watched. We do not hand you a printed plan and walk away. You will leave each session knowing exactly what you did and why.",
        },
        {
          number: "02",
          title: "A small, friendly room",
          body:
            "Maximum six members per session. No mirrors-and-music big-box gym. Just a calm room of adults who are also there to learn.",
        },
        {
          number: "03",
          title: "Plain English, always",
          body:
            "No fitness jargon, no shouty motivational language. We will explain the why behind each exercise in words that make sense.",
        },
        {
          number: "04",
          title: "Strength for everyday life",
          body:
            "Standing up confidently, carrying shopping, keeping up with grandchildren, climbing stairs without thinking. That is what we train for.",
        },
      ],
    },
    firstSession: {
      title: "Your first session,",
      italic: "minute by minute.",
      intro:
        "The biggest fear is the unknown. So here is exactly what your first time in the studio looks like, from arriving at the door to walking out the other side. It is a 20 to 30 minute one-to-one with your coach, before any group session.",
      steps: [
        {
          time: "0:00",
          body:
            "You arrive. The door is on Dursley Road; parking is free out front. Your coach meets you at the door, you hang up your coat, you sit down for a quick cup of water.",
        },
        {
          time: "0:05",
          body:
            "A short chat. Anything that has changed since the consultation call, anything bothering you today, what you ate, how you slept. No tests, no clipboards.",
        },
        {
          time: "0:10",
          body:
            "Movement assessment. Five basic patterns walked through with you, one at a time: a squat to a box, a hip hinge, a press, a pull, a carry. We watch, we cue, we never make a fuss.",
        },
        {
          time: "0:18",
          body:
            "We pick your tracking exercise. One movement we will measure across the six weeks, chosen to suit you. Your week-1 baseline is set, deliberately conservative.",
        },
        {
          time: "0:25",
          body:
            "Walk through your weekly schedule. Which sessions you are booked into, what to wear, what to bring, where to put your bag, where the toilet is.",
        },
        {
          time: "0:30",
          body:
            "You leave. You know what you did, why, and when you are next in. The next time you walk through the door, the room will already feel familiar.",
        },
      ],
      footnote:
        "From there, group sessions are six people maximum, same exercises, your own weights, your own pace. Your coach watches every rep.",
    },
    whyNow: [
      "The hardest part of starting is starting.",
      "Six weeks is short enough to commit to without a leap of faith, and long enough to feel real change in how you move and how you feel.",
      "Most of our first-timers tell us, six weeks in, that they wish they had started a year ago.",
    ],
    programmeFraming:
      "Two phases. The first three weeks are about learning the lifts in your own time. The next three are when strength starts to show.",
    testimonials: pickReviews(["Alistair W.", "Alan B.", "Felicity W."]),
    faqs: [
      {
        q: "I have honestly never lifted a weight. Is this really for me?",
        a: "Yes. The 6-week is built for exactly that. The first three weeks are about learning the movements properly, in your own time, with a coach watching every rep. There is no prior fitness assumed.",
      },
      {
        q: "Will I be the oldest one there?",
        a: "Almost certainly not. Our typical members are 40 to 75. A meaningful share have never trained before. You will not be the odd one out.",
      },
      {
        q: "What if I have a condition or an injury history?",
        a: "Tell us on the consultation call before you enrol. Our head coach holds an MSc in Sport Physiology and we work regularly with members managing chronic back pain, type 2 diabetes, osteoarthritis, osteoporosis, and post-surgical recovery. We adapt the programme to you.",
      },
      {
        q: "How often will I need to come?",
        a: COMMON_FAQS.often,
      },
      {
        q: "What happens after the 6 weeks?",
        a: COMMON_FAQS.after,
      },
    ],
    ctaPrimary: "Book a free call",
    formIntro: {
      eyebrow: "Step 01 · Arrange a call",
      title: "Start with a free call.",
      body:
        "Leave your details and we will call to learn what you want from the next 6 weeks. No pressure. If we are not the right fit, we will say so honestly.",
    },
    finalCta: {
      title: "Ready to start?",
      body:
        "Leave your details. We will call you for a no-pressure chat about whether the 6-week fits you.",
    },
  },

  // ——— Proactive Paul: post-physio progression ———
  {
    slug: "post-physio",
    source: "6-week-post-physio",
    metaTitle: "The 6-Week for Post-Physio Strength",
    metaDescription:
      "A 6-week strength programme for adults discharged from physio but not yet strong. Eastbourne. Progressive loading, small groups of six, post-rehab specialists.",
    adKicker: "Post-rehab, ready to progress",
    hero: {
      eyebrow: "When physio ends, this begins",
      headlineLead: "Discharged, but not yet strong?",
      headlineItalic: "Bridge the gap.",
      lede:
        "A 6-week strength programme for adults who are pain-free but know they have not rebuilt full capacity. Progressive loading, expert eyes, no guesswork. Built for the gap between physio and full fitness.",
      image: IMAGES.gymStretching,
      imageAlt: "A coach and an older male member working through a controlled warm-up",
    },
    problemMirror: {
      title: "The space after physio",
      italic: "is where most people get stuck.",
      intro:
        "Pain-free is not the same as strong. Most people leave physio and slowly drift back to their old loads, or back to the sofa. The 6-week exists for the in-between.",
      fears: [
        {
          headline: "I am scared of re-injuring it.",
          body:
            "We start cautious and earn progression. Loads climb only when your technique earns them. If something does not feel right, we adjust on the day, not next week.",
        },
        {
          headline: "I tried home rehab. I lost interest.",
          body:
            "YouTube cannot watch your form, modify when work has beaten you up, or notice when an old pattern is creeping back. A coached small group will. Accountability is the part you cannot manufacture alone.",
        },
        {
          headline: "I do not want to be 'rehabbed' forever.",
          body:
            "You should not be. Physio gets you out of pain. Strength training is the next step: building the capacity to handle real life, with expert eyes on your form. We are explicitly not treatment, and we are not trying to be.",
        },
        {
          headline: "Generic gym programmes do not respect my history.",
          body:
            "Tell us about your injury on the consultation call. We program around it, not despite it. Our head coach holds an MSc in Sport Physiology and works post-rehab daily.",
        },
        {
          headline: "I cannot afford another 12 weeks of physio.",
          body:
            "Strength training is the cheaper, more durable next step, with experienced strength-coaching oversight. Six weeks here costs less than a single re-injury.",
        },
      ],
    },
    pillars: {
      title: "Why post-rehab clients choose Gain",
      italic: "over a commercial gym or another physio block.",
      intro:
        "Four things we will not compromise on, because they are what post-rehab progression actually needs.",
      items: [
        {
          number: "01",
          title: "Injury-informed loading",
          body:
            "Progressive resistance built around what you can do, not around a generic template. Loads climb week to week, technique stays clean.",
        },
        {
          number: "02",
          title: "Eyes on every rep",
          body:
            "Maximum six members per session. Old patterns get caught early. You will not be left to default back into the movement that hurt you in the first place.",
        },
        {
          number: "03",
          title: "We work from your physio's notes, not around them",
          body:
            "Every programme starts with what your physio said you can and cannot do. Bring their notes to the consultation call and we build the six weeks on top of them.",
        },
        {
          number: "04",
          title: "On-site physiotherapy when you need it",
          body:
            "Isabel, our on-site physiotherapist, works from the same building. If something flares up mid-programme, you can book a session with her directly. Physiotherapy is a separate service charged separately, but it is a short walk, not a separate trip across town.",
        },
      ],
    },
    whyNow: [
      "The post-physio window is the one that decides the next ten years.",
      "Members who load progressively in the months after discharge stay out of the clinic. Members who do not, come back.",
      "Six weeks is enough to put a structured re-build between you and the old pattern.",
    ],
    programmeFraming:
      "Two phases. The first three weeks rebuild patterns and confidence under load. The next three add real progressive strength.",
    testimonials: pickReviews(["Felicity W.", "Dan H."]),
    faqs: [
      {
        q: "My physio discharged me, but I do not feel ready for a normal gym. Is this for me?",
        a: "Yes. That is the most common starting point for the 6-week. We are explicitly the next step after physio, with progressive loading and an experienced eye.",
      },
      {
        q: "I have a specific injury (back, knee, shoulder). Can you actually work around it?",
        a: "Yes, and we have done so for many members. Tell us on the consultation call. Our head coach holds an MSc in Sport Physiology. Every programme starts with what your physio said you can and cannot do, and we build from their notes. If we are not the right fit, we will say so honestly.",
      },
      {
        q: "How heavy will I be lifting?",
        a: "Heavier than you might think, and lighter than you might fear. Loads in the first three weeks are deliberately conservative while we re-learn patterns. From week four onwards they climb progressively. Nothing is loaded that has not earned the load.",
      },
      {
        q: "Could I just do this at home with a YouTube programme?",
        a: "You could. The honest answer is most people do not stick with it, and home programming cannot adapt when work or life has beaten you up. The value of the 6-week is the eyes on you and the structure around you.",
      },
      {
        q: "What happens after the 6 weeks?",
        a: COMMON_FAQS.after,
      },
    ],
    ctaPrimary: "Book a strength assessment call",
    formIntro: {
      eyebrow: "Step 01 · Arrange a call",
      title: "Tell us your history.",
      body:
        "Leave your details and we will call. We will ask about your injury, the physio you have been through, and what you want next. No pressure, no sales script.",
      submitLabel: "Book a strength assessment call",
    },
    finalCta: {
      title: "Ready for the next step after physio?",
      body:
        "Leave your details. We will call you for a no-pressure chat about your history and whether the 6-week fits.",
    },
  },

  // ——— Determined Dorothy: active senior, bone health ———
  {
    slug: "active-senior",
    source: "6-week-active-senior",
    metaTitle: "The 6-Week for Strength After 60",
    metaDescription:
      "A 6-week, evidence-based strength programme for active adults over 60. Eastbourne. Progressive resistance for bone density, balance and independence. Small groups, max six.",
    adKicker: "Strength after 60",
    hero: {
      eyebrow: "Evidence-based strength",
      headlineLead: "Light weights are not enough.",
      headlineItalic: "You need progressive load.",
      lede:
        "A 6-week strength programme for adults over 60 who want to protect bone density, balance and independence. Evidence-based, properly loaded, never patronising.",
      image: IMAGES.gymGroupClass,
      imageAlt: "A small mixed-age group working through coached strength exercises",
    },
    problemMirror: {
      title: "What we hear from active adults",
      italic: "in their sixties and seventies.",
      intro:
        "You are not fragile. You are also not 25. The mistake most gyms and most well-meaning programmes make is to assume one of those is true. We assume neither.",
      fears: [
        {
          headline: "I have been told to be careful with weights.",
          body:
            "Light weights and walking will not move bone density. The current evidence is clear: bones respond to progressive load, properly applied. We follow that protocol, with monitoring.",
        },
        {
          headline: "I do not want to be coddled.",
          body:
            "You will not be. We respect your capability. Loads climb when your technique earns them. We are firm and specific, not patronising.",
        },
        {
          headline: "I tried a gym before. Boring machines, mirrors, music.",
          body:
            "This is none of that. A small room, free weights, varied movements, coached end to end. People come for the strength and stay for the company.",
        },
        {
          headline: "I want to keep caring for my partner, my home, my life.",
          body:
            "Then strength is the lever. Carrying, transferring, balancing, getting up. Functional strength is the difference between independence and not.",
        },
        {
          headline: "I have a heart history, or osteoporosis, or arthritis.",
          body:
            "Tell us on the consultation call. Our head coach holds an MSc in Sport Physiology. Resistance training, properly programmed, has well-established cardiovascular and bone-health benefits when paired with appropriate medical care.",
        },
      ],
    },
    pillars: {
      title: "Why active seniors choose Gain",
      italic: "over the leisure-centre alternative.",
      intro:
        "Four things we will not compromise on, because they are what training after 60 actually needs to be.",
      items: [
        {
          number: "01",
          title: "Evidence-based loading",
          body:
            "Progressive resistance protocols informed by the Royal Osteoporosis Society's Strong, Steady and Straight consensus and current literature on bone, muscle and balance in older adults. We can talk you through the why if you want.",
        },
        {
          number: "02",
          title: "Capability, not limitation",
          body:
            "We treat you as an adult who can do hard things. We modify where needed, never pre-emptively. The bar earns its weight.",
        },
        {
          number: "03",
          title: "A coach who reads your history",
          body:
            "Heart, joints, prior surgeries, medications, the lot. Our head coach holds an MSc in Sport Physiology and a PT qualification. Your history shapes the programme.",
        },
        {
          number: "04",
          title: "Variety, not boredom",
          body:
            "Free weights, kettlebells, balance, carries, controlled steps. Movements that map to real life, never circuits on tired machines.",
        },
      ],
    },
    whyNow: [
      "Bone density and lean muscle peak in your thirties, then decline gently for decades, then steeply.",
      "The single most powerful intervention against that decline is progressive resistance training, started in any decade.",
      "Six weeks is enough to feel the difference and see the data. The hard part is starting; we make starting easy.",
    ],
    programmeFraming:
      "Two phases. The first three weeks set the movement patterns that protect joints and bones. The next three are where progressive overload starts moving the dial.",
    testimonials: pickReviews(["Julie F.", "Felicity W."]),
    faqs: [
      {
        q: "Will this actually improve my bone density?",
        a: "Published evidence (Watson et al., LIFTMOR RCT, 2018) shows supervised high-intensity resistance and impact training can improve bone mineral density in postmenopausal women with low bone mass. We follow the supervised, screened approach the trial used, in line with the Royal Osteoporosis Society's Strong, Steady and Straight consensus. Light weights and walking on their own are not enough.",
      },
      {
        q: "I have osteoporosis. Is this safe?",
        a: "Yes, with proper monitoring. Resistance training, correctly progressed, is recommended for osteoporosis management. Tell us on the consultation call so we can plan around your DEXA history and any medication. On the call we will also ask about any vertebral fracture history; the programme avoids loaded spinal flexion in line with Royal Osteoporosis Society guidance. If we are not the right fit, we will say so honestly.",
      },
      {
        q: "I am also caring for my partner. I cannot commit to a 12-week.",
        a: "That is exactly why the 6-week exists. Short enough to fit a complicated life, structured enough to genuinely shift things. One session a week is enough to get going.",
      },
      {
        q: "How heavy will I be lifting?",
        a: "As heavy as your technique earns. The first three weeks are deliberately conservative as we set patterns. From week four, loads climb. The aim is meaningful progressive overload, which is what your bones and muscles actually respond to.",
      },
      {
        q: "What happens after the 6 weeks?",
        a: COMMON_FAQS.after,
      },
    ],
    ctaPrimary: "Book a consultation call",
    formIntro: {
      eyebrow: "Step 01 · Arrange a call",
      title: "Ask us anything.",
      body:
        "Leave your details and we will call you for a 30 minute consultation. Bring your questions on bone health, programming, or your medical history. No pressure.",
    },
    finalCta: {
      title: "Ready to train properly?",
      body:
        "Leave your details. We will call you for a no-pressure chat about your goals, your history, and whether the 6-week fits.",
    },
  },

  // ——— Rebuilding Robert: post-illness / long COVID ———
  {
    slug: "post-illness",
    source: "6-week-post-illness",
    metaTitle: "The 6-Week for Rebuilding After Illness",
    metaDescription:
      "A 6-week strength programme for adults rebuilding fitness after illness, long COVID, or a long stretch of inactivity. Eastbourne. Adaptive pacing, small groups of six.",
    adKicker: "Rebuild at your own pace",
    hero: {
      eyebrow: "After a long stretch off",
      headlineLead: "Deconditioning is not failure.",
      headlineItalic: "It is something we rebuild.",
      lede:
        "A 6-week strength programme for adults rebuilding after illness, long COVID, or a long stretch of inactivity. Adaptive pacing, expert eyes, judgement-free. Some days you will do less. That is part of the plan.",
      image: IMAGES.gymWarmup,
      imageAlt: "A coach and a member working through a careful, low-load warm-up",
    },
    problemMirror: {
      title: "Rebuilding fitness after illness",
      italic: "needs a different approach.",
      intro:
        "You are not lazy. You are not back to who you were. A normal gym programme will punish you on a low-energy day; a coached small group will adapt around it. That is the difference.",
      fears: [
        {
          headline: "I used to be fit. Now stairs wind me.",
          body:
            "That is the starting point. The first three weeks are deliberately gentle, building a baseline you can repeat without crashing. Then load climbs, slowly.",
        },
        {
          headline: "I am scared of crashing again.",
          body:
            "We expect variable energy. On a low day we drop the load and shorten the session. That is not failure, it is smart pacing, and it is built into how we coach you.",
        },
        {
          headline: "I do not want to be in a crowded gym right now.",
          body:
            "Maximum six members per session, in a calm, quiet room. No queues, no mirrors, no music you cannot hear yourself over.",
        },
        {
          headline: "I might miss sessions when energy is low.",
          body:
            "We expect that, and we plan around it. Members rebuilding from illness flex their schedule with us. There is no penalty for listening to your body.",
        },
        {
          headline: "I have tried before and lost confidence.",
          body:
            "We hear this often. The 6-week is short enough to commit to and structured enough to feel progress. Confidence rebuilds in small wins, not in a hero week.",
        },
      ],
    },
    pillars: {
      title: "Why rebuilders choose Gain",
      italic: "over a self-led return to the gym.",
      intro:
        "Four things we will not compromise on, because they are what a careful return to training actually needs.",
      items: [
        {
          number: "01",
          title: "Adaptive pacing",
          body:
            "Energy varies. We adjust the load and the volume on the day, not the week. You will not be ground through a fixed plan that does not respect your body.",
        },
        {
          number: "02",
          title: "A judgement-free room",
          body:
            "Six members, all there for the same reason. Modifications are normal. Resting is normal. Nobody is watching you for proof of recovery.",
        },
        {
          number: "03",
          title: "Capacity, then strength",
          body:
            "We rebuild work capacity first, then layer strength on top. The order matters. Skip it and you crash. Get it right and the gains stay.",
        },
        {
          number: "04",
          title: "An expert who has seen it before",
          body:
            "Our head coach holds an MSc in Sport Physiology and works regularly with members managing long COVID, post-viral fatigue, and deep deconditioning. You will not need to explain the basics.",
        },
      ],
    },
    whyNow: [
      "The longer deconditioning sits, the more it costs to undo. Not impossibly so, but more than today.",
      "Six weeks of structured, paced rebuild beats six months of stop-start solo attempts.",
      "Most members tell us, weeks in, that they wish they had been given permission to start small sooner.",
    ],
    programmeFraming:
      "Two phases. The first three weeks build a baseline you can repeat without crashing. The next three layer load on top, slowly.",
    testimonials: pickReviews(["L T", "Alistair W."]),
    faqs: [
      {
        q: "Do you do graded exercise therapy?",
        a: "No. We don't do graded exercise therapy. We work session-to-session with how your body is responding, including post-exertional symptoms that show up 24 to 72 hours after training. If a session triggered a crash, we change the next one rather than push through it.",
      },
      {
        q: "Is this safe for long COVID or post-viral fatigue?",
        a: "Yes, with the right approach. We use adaptive pacing: load and volume flex on the day, based on how you are. We do not push through a fatigue crash, and we plan around the post-exertional malaise window of 24 to 72 hours that often follows a hard session. Our approach is informed by the AHA's 2024 scientific statement on exercise intolerance in PASC and current best-practice guidance for long COVID. Tell us about your history on the consultation call so we can plan well. If we are not the right fit, we will say so honestly.",
      },
      {
        q: "What if I have a bad week and miss two sessions?",
        a: "It is built into how we work. Members rebuilding from illness flex their attendance regularly. We will pick up where you are when you are back, not where the printed plan thinks you should be.",
      },
      {
        q: "How hard will sessions be in the first three weeks?",
        a: "Deliberately gentle. The aim is consistency without crashing. We build a baseline first, then layer load on top. The hardest week is rarely the first one.",
      },
      {
        q: "Will I really feel different in 6 weeks?",
        a: "Most members do, and not just in strength. Energy stabilises, sleep improves, confidence creeps back. Six weeks is short enough to commit to without a leap of faith, and long enough to show real movement.",
      },
      {
        q: "What happens after the 6 weeks?",
        a: COMMON_FAQS.after,
      },
    ],
    ctaPrimary: "Tell us your story",
    formIntro: {
      eyebrow: "Step 01 · Tell us your story",
      title: "No pressure, no judgement.",
      body:
        "Leave your details, and a few words on what you have been through if you would like. We will call you to talk it through. We will be honest about whether the 6-week fits.",
      submitLabel: "Send my story",
    },
    finalCta: {
      title: "Ready to rebuild?",
      body:
        "Leave your details. We will call you for a no-pressure chat about how you are, where you are starting from, and whether the 6-week fits.",
    },
  },
];

export const PERSONA_SLUGS = PERSONAS.map((p) => p.slug);

export function getPersona(slug: string): Persona | undefined {
  return PERSONAS.find((p) => p.slug === slug);
}
