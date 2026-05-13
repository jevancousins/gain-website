# Gain Strength Therapy — Media Inventory

Human-readable index of all assets in `/public/media`.
Keep in sync with `src/lib/utils.ts` → `IMAGES` and `IMAGE_META`.

Whenever you add, remove, or re-identify a photo, update this file — then sync the matching `IMAGE_META` entry in `src/lib/utils.ts` so code and docs stay aligned.

Last updated: 2026-05-12

---

## Key rules before using any image

- Always check the `people` and `status` fields in `IMAGE_META` before placing a photo on a new page.
- `status: "current"` — safe to use on any surface.
- `status: "archive"` — former staff are visible; only use if historical context is explicit.
- Never place archive photos as "meet your current coach/team" content.
- `stretching.jpg` is the strongest single Hallum photo — currently used as the video poster and on multiple pages; avoid over-using it further.

---

## Brand

| File | Key | Notes |
|---|---|---|
| `logo.png` | `IMAGES.logo` | Circular wordmark. |

---

## Headshots

| File | Key | People | Notes |
|---|---|---|---|
| `hallum.jpg` | `IMAGES.hallum` | Hallum Cousins | Clean headshot, plain background. Primary "Meet your coach" image. |

---

## Gym — Hallum coaching (real photos, May 2026)

| File | Key | People | Description |
|---|---|---|---|
| `gym/hallum-box-stepup.jpg` | `IMAGES.gymHallumBoxStepup` | Hallum (back to camera), female member | Hallum coaching a box step-up; GAIN branding on his t-shirt. |
| `gym/box-coaching.jpg` | `IMAGES.gymBoxCoaching` | Hallum, female member (40s) | Hallum spotting a box step-up. GAIN logo on t-shirt. |
| `gym/stretching.jpg` | `IMAGES.gymStretching` | Hallum, senior male member | Hallum and client stretching together, smiling. **Best Hallum coaching photo — use sparingly.** |
| `gym/warmup.jpg` | `IMAGES.gymWarmup` | Hallum, senior male member | Near-duplicate of stretching.jpg (different crop). |

---

## Gym — Group / class scenes (real photos, May 2026)

| File | Key | People | Description |
|---|---|---|---|
| `gym/group-class.jpg` | `IMAGES.gymGroupClass` | Hallum + 2F + 2M members | Group warm-up on mats. Mixed demographics, good energy. |
| `gym/group-session.jpg` | `IMAGES.gymGroupSession` | Four members (mixed) | Small-group PT session, four members on different exercises simultaneously. |
| `gym/gym-floor-session.jpg` | `IMAGES.gymFloorSession` | Four members (mixed) | Four members on different floor exercises; no coach visible. |

---

## Gym — Member exercises (real photos, May 2026)

| File | Key | People | Description |
|---|---|---|---|
| `gym/member-cable.jpg` | `IMAGES.gymMemberCable` | Male member | Solo cable machine exercise. No coach. |
| `gym/member-dumbbell-lunge.jpg` | `IMAGES.gymMemberDumbbellLunge` | Senior female member | Dumbbell lunge with good form. Shows strength training accessible to older adults. |
| `gym/member-floor-pushup.jpg` | `IMAGES.gymMemberFloorPushup` | Three male members | Press-ups; one using a weight plate — shows scaled, personalised training. |
| `gym/member-deadlift.jpg` | `IMAGES.gymMemberDeadlift` | Female member | Deadlift with strong form. Good for women-lifting content. |
| `gym/member-gym-training.jpg` | `IMAGES.gymMemberGymTraining` | 2F + 1M members | Lunge in foreground; dumbbell skullcrusher on mat in background. |
| `gym/member-hip-hinge.jpg` | `IMAGES.gymMemberHipHinge` | Middle-aged female member | RDL with barbell and 5 kg plates. Excellent form shot. |
| `gym/lunges.jpg` | `IMAGES.gymLunges` | Two female members (20s–30s) | Dumbbell leg exercises side by side. |

---

## Gym — Interior / space

| File | Key | People | Description |
|---|---|---|---|
| `gym/gym-wide-member.jpg` | `IMAGES.gymWideNew` | 4 members (senior male in foreground) | Wide shot; senior male on cable machine prominent in foreground. |
| `gym/gym-interior-wide.jpg` | `IMAGES.gymInteriorWide` | Three members (mixed) | Wide interior, three members on different exercises. |
| `gym/wide.jpg` | `IMAGES.gymWide` | — | Empty gym, dark atmospheric lighting. |

---

## Gym — GAIN sign / social proof (real photos, May 2026)

| File | Key | People | Description |
|---|---|---|---|
| `gym/gain-sign-member-orange.jpg` | `IMAGES.gainSignMemberOrange` | Middle-aged male member | Thumbs up next to GAIN sign. |
| `gym/gain-sign-member-pose.jpg` | `IMAGES.gainSignMemberPose` | Senior male member | Posing in front of GAIN sign. |
| `gym/gain-sign-two-members.jpg` | `IMAGES.gainSignTwoMembers` | Senior male + senior female | Posing together at GAIN sign. |
| `gym/gain-sign-female-member.jpg` | `IMAGES.gainSignFemaleMember` | Middle-aged female member | Pointing enthusiastically at GAIN sign. |
| `gym/gain-sign-two-female-members.jpg` | `IMAGES.gainSignTwoFemaleMembers` | Two middle-aged female members | Hugging and pointing at GAIN sign. |

---

## Gym — Reception / front-of-house (real photos, May 2026)

| File | Key | People | Description |
|---|---|---|---|
| `gym/member-block-balance.jpg` | `IMAGES.gymMemberBlockBalance` | Senior male member | Balancing a block on his head in reception. Unusual, characterful rehab image. |
| `gym/hallum-member-progress.jpg` | `IMAGES.gymHallumMemberProgress` | Hallum + middle-aged male member | Holding a progress/pain-reduction sign in reception. Strong results image. |

---

## Studio

| File | Key | Notes |
|---|---|---|
| `studio/yoga.jpg` | `IMAGES.studioYoga` | Studio set for yoga/meditation: mats, singing bowls, wall art. |

---

## Archive — Former staff visible

> Do not use these as "current team" content. Former staff: Aaron Goacher, Becky Brown, Ash Mugasa.

| File | Key | People | Notes |
|---|---|---|---|
| `gym/coach-member.jpg` | `IMAGES.gymAaronOhp` | Aaron Goacher, female member (40s) | Aaron coaching overhead press. |
| `gym/coach-member-alt.jpg` | `IMAGES.gymAaronConversation` | Aaron Goacher, female member (40s) | Aaron in conversation with client. |
| `gym/two-training.jpg` | `IMAGES.gymAaronBeckyBackground` | Aaron + Becky (backs to camera), female client | Backs to camera — usable as atmosphere only. |
| `team.jpg` | `IMAGES.teamOriginal` | Hallum + Aaron + Becky + physio + Ash | Original team photo. Never as "current team". |
| `team-entrance.jpg` | *(remove manually)* | Unconfirmed | Confirmed duplicate of stretching.jpg — safe to delete from disk. |

---

## Notes for AI agents

When selecting images for social media or web content:

1. Check `IMAGE_META[path].status` — only use `"current"` images on new surfaces.
2. Check `IMAGE_META[path].people` — never label archive staff as current Gain coaches.
3. Use `IMAGE_META[path].tags` for semantic matching to content themes (exercise names, demographics, mood, brand).
4. Prefer photos of Hallum with clients for "coaching" or "meet the coach" content.
5. Prefer GAIN sign photos for milestone, results, and social-proof posts.
6. `stretching.jpg` is the strongest image but is already heavily used — vary with `hallum-box-stepup.jpg` or `box-coaching.jpg`.
7. Reception photos (`member-block-balance.jpg`, `hallum-member-progress.jpg`) work well for rehabilitation / results / testimonial storytelling.
